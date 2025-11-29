import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import {
  Payment,
  PaymentDocument,
  PaymentStatus,
  PaymentMethod,
} from './schema/payment.schema';
import { StripeService } from '../stripe/stripe.service';
import { MailService } from '../mail/mail.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { RefundPaymentDto } from './dto/refund-payment.dto';
import { AllConfigType } from '../config/config.type';

import { EnrollmentSchemaClass } from '../Enrollment/infrastructure/enrollments.schema';
import { ClassScheduleHelperService } from '../utils/class-schedule/class-schedule-helper.service';
import {
  CourseSchemaClass,
  CourseSchema,
} from '../course/schema/course.schema';

import { UserSchemaClass } from '../users/schema/user.schema';
import { Booking, BookingDocument } from '../booking/schema/booking.schema';
import {
  BookingStatus,
  PaymentMethod as BookingPaymentMethod,
} from '../booking/dto/create-booking.dto';
import {
  convertIdToString,
  sanitizeMongooseDocument,
} from '../utils/convert-id';
import { PurchaseOrderEntity } from '../purchaseOrder/domain/purchase-order.entity';
import { PaymentEntity } from './domain/payment.entity';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    @InjectModel(Payment.name)
    private paymentModel: Model<PaymentDocument>,
    @InjectModel(CourseSchemaClass.name)
    private courseModel: Model<CourseSchemaClass>,
    @InjectModel(UserSchemaClass.name)
    private readonly userModel: Model<UserSchemaClass>,
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
    @InjectModel(EnrollmentSchemaClass.name)
    private enrollmentModel: Model<EnrollmentSchemaClass>,
    private stripeService: StripeService,
    private mailService: MailService,
    private configService: ConfigService<AllConfigType>,
    private readonly classScheduleHelper: ClassScheduleHelperService, // ✅ Inject
  ) {}

  private map(doc: any): PaymentEntity {
    if (!doc) return undefined as any;

    const sanitized = sanitizeMongooseDocument(doc);
    if (!sanitized) return undefined as any;

    return {
      ...sanitized,
      id: sanitized.id || convertIdToString(doc),
    };
  }

  /**
   * Create a payment intent for a course purchase
   */
  async createPayment(userId: string, createPaymentDto: CreatePaymentDto) {
    const {
      courseId,
      amount,
      currency = 'usd',
      metadata,
      BookingId,
    } = createPaymentDto;

    const course = await this.courseModel.findById(courseId);

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Validate user exists
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existingPayment = await this.paymentModel.findOne({
      userId: userId,
      courseId: courseId,
      status: { $in: [PaymentStatus.SUCCEEDED, PaymentStatus.PROCESSING] },
    });

    if (existingPayment) {
      throw new BadRequestException('You have already paid for this course');
    }

    const existingEnrollment = await this.enrollmentModel.findOne({
      user: user,
      course: course,
      status: { $in: ['active', 'completed'] },
    });

    if (existingEnrollment) {
      throw new BadRequestException('User already enrolled in this course');
    }

    // Use custom amount or course price
    const paymentAmount = amount || course.price || 0;

    if (paymentAmount <= 0) {
      throw new BadRequestException('Invalid payment amount');
    }

    // Convert to cents for Stripe
    const amountInCents = Math.round(paymentAmount * 100);

    // Create payment record
    const payment = new this.paymentModel({
      courseId: course?._id.toString(),
      userId: user?._id.toString(),
      amount: paymentAmount,
      currency,
      status: PaymentStatus.PENDING,
      description: `Payment for course: ${course.title}`,
      ...(BookingId && { BookingId: new Types.ObjectId(BookingId) }), // ✅ Add BookingId if provided
      metadata: {
        ...metadata,
        courseName: course.title,
        userName: user.firstName + ' ' + user.lastName,
        userEmail: user.email,
      },
    });

    await payment.save();

    try {
      // Create Stripe payment intent
      const paymentIntent = await this.stripeService.createPaymentIntent({
        amount: amountInCents,
        currency,
        courseId: course?._id.toString(),
        userId: user?._id.toString(),
        description: `Payment for ${course.title}`,
      });

      // Update payment with Stripe details
      payment.stripePaymentIntentId = paymentIntent.paymentIntentId;
      payment.status = PaymentStatus.SUCCEEDED;

      const booking = await this.bookingModel.findOne({
        studentId: new Types.ObjectId(payment.userId),
        courseId: new Types.ObjectId(payment.courseId),
      });

      if (!booking) {
        return {
          statusCode: 400,
          message: 'Booking not found',
          error: 'Bad Request',
        };
      }

      booking.status = BookingStatus.CONFIRMED;
      booking.paymentMethod = BookingPaymentMethod.STRIPE;
      await booking.save();

      try {
        for (const session of course?.sessions) {
          if (session.timeBlocks && session.timeBlocks.length > 0) {
            const firstTimeBlock = session.timeBlocks[0];

            await this.classScheduleHelper.addStudentToSchedule(
              booking.courseId.toString(),
              booking.studentId.toString(),
              {
                sessionId: booking.sessionId,
                instructor: course?.instructor,
                date: firstTimeBlock.startDate,
                time: firstTimeBlock.startTime,
                duration: 60,
                timeTableId: booking.timeTableId,
              } as any,
            );
            console.log('✅ Student added to schedule successfully');
          }
        }
      } catch (error) {
        console.warn(`Failed to add student to schedule: ${error.message}`);
      }

      await payment.save();

      this.logger.log(
        `Payment intent created: ${paymentIntent.paymentIntentId} for user ${userId}`,
      );

      // Send payment confirmation email to finance department
      try {
        const financeEmail =
          this.configService.get('app.adminEmail', { infer: true }) ||
          this.configService.get('mail.defaultEmail', { infer: true });

        if (financeEmail) {
          await this.mailService.paymentConfirmation({
            to: financeEmail,
            data: {
              paymentId: payment._id.toString(),
              paymentIntentId: paymentIntent.paymentIntentId,
              studentName: `${user.firstName} ${user.lastName}`,
              studentEmail: user.email,
              courseTitle: course.title,
              amount: paymentAmount,
              currency: currency.toUpperCase(),
              paymentMethod: 'stripe',
              createdAt: new Date().toISOString(),
            },
          });

          this.logger.log(
            `Payment confirmation email sent to finance: ${financeEmail}`,
          );
        }
      } catch (emailError) {
        // Don't fail payment creation if email fails
        this.logger.error(
          `Failed to send payment confirmation email to finance: ${emailError.message}`,
        );
      }

      return {
        payment: payment.toObject(),
        clientSecret: paymentIntent.clientSecret,
        paymentIntentId: paymentIntent.paymentIntentId,
      };
    } catch (error) {
      // Update payment status to failed
      payment.status = PaymentStatus.FAILED;
      payment.failureReason = error.message;
      await payment.save();

      this.logger.error(`Failed to create payment intent: ${error.message}`);
      throw new BadRequestException('Failed to create payment');
    }
  }

  async confirmPayment(paymentIntentId: string) {
    // Find the payment by Stripe PaymentIntent ID
    const payment = await this.paymentModel
      .findOne({
        stripePaymentIntentId: paymentIntentId,
      })
      .populate('userId', 'firstName lastName email')
      .populate('courseId', 'title slug sessions details');

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // Update status to PAID
    payment.status = PaymentStatus.SUCCEEDED;
    payment.paidAt = new Date();
    await payment.save();

    // Get user and course details
    let user = payment.userId as any;
    let course = payment.courseId as any;

    // If user is not populated properly (missing email), fetch it manually
    if (!user?.email) {
      const userId =
        user?._id?.toString() ||
        (typeof user === 'string' ? user : null) ||
        payment.userId?.toString();

      if (userId) {
        const fetchedUser = await this.userModel
          .findById(userId)
          .select('firstName lastName email')
          .lean();

        if (fetchedUser) {
          user = fetchedUser;
        }
      }
    }

    // If course is not populated properly (missing title), fetch it manually
    if (!course?.title) {
      const courseId =
        course?._id?.toString() ||
        (typeof course === 'string' ? course : null) ||
        payment.courseId?.toString();

      if (courseId) {
        const fetchedCourse = await this.courseModel
          .findById(courseId)
          .select('title slug sessions details')
          .lean();

        if (fetchedCourse) {
          course = fetchedCourse;
        }
      }
    }

    // Generate course material link
    const frontendDomain = this.configService.getOrThrow('app.frontendDomain', {
      infer: true,
    });
    const courseMaterialLink = course?.slug
      ? `${frontendDomain}/courses/${course.slug}/materials`
      : `${frontendDomain}/courses/${course?._id?.toString() || payment.courseId}/materials`;

    // Prepare course materials list
    const courseMaterials: Array<{
      name: string;
      type: string;
      link?: string;
    }> = [];

    // Add sessions as materials
    if (course?.sessions && Array.isArray(course.sessions)) {
      course.sessions.forEach((session: any, index: number) => {
        courseMaterials.push({
          name: `Session ${index + 1} - ${session.type || 'Session'}`,
          type: 'Session',
          link: `${courseMaterialLink}#session-${index + 1}`,
        });
      });
    }

    // Add course details as materials if available
    if (course?.details) {
      if (course.details.features && course.details.features.length > 0) {
        courseMaterials.push({
          name: 'Course Features',
          type: 'Documentation',
          link: `${courseMaterialLink}#features`,
        });
      }
    }

    // Send confirmation email to student
    try {
      if (user?.email) {
        await this.mailService.studentPaymentConfirmation({
          to: user.email,
          data: {
            studentName:
              `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
              'Student',
            courseTitle: course?.title || 'Course',
            courseMaterialLink,
            courseMaterials,
            amount: payment.amount,
            currency: payment.currency?.toUpperCase() || 'USD',
            paymentDate: new Date().toISOString(),
          },
        });

        this.logger.log(
          `Payment confirmation email sent to student: ${user.email}`,
        );
      }
    } catch (emailError) {
      // Don't fail payment confirmation if email fails
      this.logger.error(
        `Failed to send payment confirmation email to student: ${emailError.message}`,
      );
    }

    return {
      success: true,
      message: 'Payment confirmed',
      payment: {
        id: payment._id.toString(),
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency,
        paidAt: payment.paidAt,
      },
      course: {
        id: course?._id?.toString() || payment.courseId,
        title: course?.title,
        slug: course?.slug,
      },
      courseMaterialLink,
      courseMaterials,
    };
  }

  /**
   * Create a checkout session for a course purchase
   */
  async createCheckout(userId: string, createCheckoutDto: CreateCheckoutDto) {
    const { courseId, successUrl, cancelUrl, metadata, BookingId } =
      createCheckoutDto;

    // Validate course exists
    const course = await this.courseModel.findById(courseId);
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Validate user exists
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user already enrolled
    const existingEnrollment = await this.enrollmentModel.findOne({
      user: new Types.ObjectId(userId),
      course: new Types.ObjectId(courseId),
      status: { $in: ['active', 'completed'] },
    });

    if (existingEnrollment) {
      throw new BadRequestException('User already enrolled in this course');
    }

    const paymentAmount = course.price || 0;
    if (paymentAmount <= 0) {
      throw new BadRequestException('Invalid course price');
    }

    // Convert to cents for Stripe
    const amountInCents = Math.round(paymentAmount * 100);

    // Create payment record
    const payment = new this.paymentModel({
      user: new Types.ObjectId(userId),
      course: new Types.ObjectId(courseId),
      amount: paymentAmount,
      currency: 'usd',
      status: PaymentStatus.PENDING,
      description: `Payment for course: ${course.title}`,
      ...(BookingId && { BookingId: new Types.ObjectId(BookingId) }), // ✅ Add BookingId if provided
      metadata: {
        ...metadata,
        courseName: course.title,
        userName: user.firstName + ' ' + user.lastName,
        userEmail: user.email,
      },
    });

    await payment.save();

    try {
      // Create Stripe checkout session
      const checkoutDto = {
        courseId,
        userId,
        successUrl,
        cancelUrl,
        priceInCents: amountInCents,
      };

      const session = await this.stripeService.createCheckoutSession(
        checkoutDto,
        course.title,
        paymentAmount,
      );

      // Update payment with session ID
      payment.metadata = {
        ...payment.metadata,
        checkoutSessionId: session.sessionId,
      };
      await payment.save();

      this.logger.log(
        `Checkout session created: ${session.sessionId} for user ${userId}`,
      );

      return {
        payment: payment.toObject(),
        sessionId: session.sessionId,
        url: session.url,
      };
    } catch (error) {
      // Update payment status to failed
      payment.status = PaymentStatus.FAILED;
      payment.failureReason = error.message;
      await payment.save();

      this.logger.error(`Failed to create checkout session: ${error.message}`);
      throw new BadRequestException('Failed to create checkout session');
    }
  }

  /**
   * Handle successful payment (called by webhook)
   */
  async handlePaymentSuccess(paymentIntentId: string) {
    const payment = await this.paymentModel
      .findOne({ stripePaymentIntentId: paymentIntentId })
      .populate('userId')
      .populate('courseId');

    if (!payment) {
      this.logger.warn(`Payment not found for intent: ${paymentIntentId}`);
      return;
    }

    // Update payment status
    payment.status = PaymentStatus.SUCCEEDED;
    payment.paidAt = new Date();

    await payment.save();

    try {
      // Create enrollment
      const enrollment = new this.enrollmentModel({
        user: payment.userId,
        course: payment.courseId,
        status: 'active',
        enrolledAt: new Date(),
        paymentStatus: 'paid',
      });

      await enrollment.save();

      // Link enrollment to payment
      payment.enrollment = enrollment._id as any;
      await payment.save();

      this.logger.log(
        `Enrollment created for user ${payment.userId} in course ${payment.courseId}`,
      );

      // Send confirmation email
      const user = payment.userId as any;
      const course = payment.courseId as any;

      try {
        await this.mailService.userRegistered({
          to: user.email,
          data: {
            userName: user.name || 'User',
            userEmail: user.email,
            registrationDate: new Date().toISOString(),
          },
        });

        this.logger.log(`Payment confirmation email sent to ${user.email}`);
      } catch (emailError) {
        this.logger.error(
          `Failed to send payment confirmation email: ${emailError.message}`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to create enrollment for payment ${payment._id}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Handle failed payment (called by webhook)
   */
  async handlePaymentFailed(paymentIntentId: string, reason?: string) {
    const payment = await this.paymentModel.findOne({
      stripePaymentIntentId: paymentIntentId,
    });

    if (!payment) {
      this.logger.warn(`Payment not found for intent: ${paymentIntentId}`);
      return;
    }

    payment.status = PaymentStatus.FAILED;
    payment.failureReason = reason;
    await payment.save();

    this.logger.log(`Payment failed: ${payment._id}, reason: ${reason}`);
  }

  /**
   * Refund a payment
   */
  async refundPayment(refundDto: RefundPaymentDto) {
    const { paymentId, amount, reason } = refundDto;

    const payment = await this.paymentModel
      .findById(paymentId)
      .populate('userId')
      .populate('courseId')
      .populate('enrollment');

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== PaymentStatus.SUCCEEDED) {
      throw new BadRequestException('Only successful payments can be refunded');
    }

    if (!payment.stripePaymentIntentId) {
      throw new BadRequestException('No Stripe payment intent found');
    }

    const refundAmount = amount || payment.amount;

    if (refundAmount > payment.amount) {
      throw new BadRequestException(
        'Refund amount cannot exceed payment amount',
      );
    }

    try {
      // Create refund in Stripe
      const refund = await this.stripeService.createRefund(
        payment.stripePaymentIntentId,
        Math.round(refundAmount * 100), // Convert to cents
      );

      // Update payment
      payment.status = PaymentStatus.REFUNDED;
      payment.refundedAmount = refundAmount;
      payment.refundedAt = new Date();
      payment.metadata = {
        ...payment.metadata,
        refundId: refund.id,
        refundReason: reason,
      };
      await payment.save();

      // Update enrollment if exists
      if (payment.enrollment) {
        await this.enrollmentModel.findByIdAndUpdate(payment.enrollment, {
          status: 'cancelled',
          paymentStatus: 'refunded',
        });
      }

      this.logger.log(
        `Payment refunded: ${payment._id}, amount: ${refundAmount}`,
      );

      // Send refund confirmation email
      const user = payment.userId as any;
      const course = payment.courseId as any;

      try {
        await this.mailService.userRegistered({
          to: user.email,
          data: {
            userName: user.name || 'User',
            userEmail: user.email,
            registrationDate: new Date().toISOString(),
          },
        });
      } catch (emailError) {
        this.logger.error(`Failed to send refund email: ${emailError.message}`);
      }

      return {
        payment: payment.toObject(),
        refund,
      };
    } catch (error) {
      this.logger.error(`Failed to refund payment: ${error.message}`);
      throw new BadRequestException(
        `Failed to process refund: ${error.message}`,
      );
    }
  }

  /**
   * Get payment by ID
   */
  async getPayment(paymentId: string) {
    const payment = await this.paymentModel
      .findById(paymentId)
      .populate('userId', 'firstName lastName email')
      .populate('courseId', 'title description price')
      .populate('enrollment');

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }

  /**
   * Get payment by ID
   */
  async findByUserAndCourse(userId: string, courseId: string) {
    const payment = await this.paymentModel
      .findOne({
        userId: userId,
        courseId: courseId,
      })
      .populate('userId', 'firstName lastName email')
      .populate('courseId', 'title description price')
      .populate('enrollment');

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }
  /**
   * Get user's payment history
   */
  async getUserPayments(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [payments, total] = await Promise.all([
      this.paymentModel
        .find({ userId: new Types.ObjectId(userId) })
        .populate('courseId', 'title description price')
        .populate('enrollment')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.paymentModel.countDocuments({ userId: new Types.ObjectId(userId) }),
    ]);

    return {
      data: payments,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get course payments (admin)
   */
  async getCoursePayments(courseId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [payments, total] = await Promise.all([
      this.paymentModel
        .find({ courseId: new Types.ObjectId(courseId) })
        .populate('userId', 'firstName lastName email')
        .populate('enrollment')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.paymentModel.countDocuments({
        course: new Types.ObjectId(courseId),
      }),
    ]);
    let totalPages = Math.ceil(total / limit);
    return {
      data: payments.map((doc) => this.map(doc)),
      limit,
      totalItems: total,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }

  /**
   * Get all payments (admin)
   */
  async getAllPayments(page = 1, limit = 10, status?: PaymentStatus) {
    const skip = (page - 1) * limit;
    const filter = status ? { status } : {};

    const [payments, total] = await Promise.all([
      this.paymentModel
        .find(filter)
        .populate('userId', 'firstName lastName email')
        .populate('courseId', 'title description price')
        .populate('enrollment')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.paymentModel.countDocuments(filter),
    ]);
    let totalPages = Math.ceil(total / limit);

    return {
      data: payments.map((doc) => this.map(doc)),
      limit,
      totalItems: total,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }

  /**
   * Create payment from approved Purchase Order
   */
  async createPaymentFromPurchaseOrder(
    purchaseOrderId: string,
    userId: string,
    courseId: string,
    amount: number,
    currency: string = 'usd',
  ) {
    // Validate user exists
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Validate course exists
    const course = await this.courseModel.findById(courseId);
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Check if user already enrolled
    const existingEnrollment = await this.enrollmentModel.findOne({
      user: new Types.ObjectId(userId),
      course: new Types.ObjectId(courseId),
      status: { $in: ['active', 'completed'] },
    });

    if (existingEnrollment) {
      throw new BadRequestException('User already enrolled in this course');
    }

    // Create payment record with PO method
    const payment = new this.paymentModel({
      user: new Types.ObjectId(userId),
      course: new Types.ObjectId(courseId),
      amount,
      currency,
      status: PaymentStatus.SUCCEEDED, // PO approved = payment succeeded
      paymentMethod: PaymentMethod.PURCHASE_ORDER,
      purchaseOrderId: new Types.ObjectId(purchaseOrderId),
      description: `Payment via Purchase Order for course: ${course.title}`,
      paidAt: new Date(),
      metadata: {
        courseName: course.title,
        userName: `${user.firstName} ${user.lastName}`,
        userEmail: user.email,
        paymentMethod: 'purchase_order',
      },
    });

    await payment.save();

    try {
      // Create enrollment
      const enrollment = new this.enrollmentModel({
        user: new Types.ObjectId(userId),
        course: new Types.ObjectId(courseId),
        status: 'active',
        enrolledAt: new Date(),
        paymentStatus: 'paid',
      });

      await enrollment.save();

      // Link enrollment to payment
      payment.enrollment = enrollment._id as any;
      await payment.save();

      this.logger.log(
        `Payment and enrollment created from PO ${purchaseOrderId} for user ${userId} in course ${courseId}`,
      );

      return {
        payment: payment.toObject(),
        enrollment: enrollment.toObject(),
      };
    } catch (error) {
      // Rollback payment status if enrollment fails
      payment.status = PaymentStatus.FAILED;
      payment.failureReason = error.message;
      await payment.save();

      this.logger.error(
        `Failed to create enrollment from PO payment: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Get payment statistics
   */
  async getPaymentStats() {
    const [totalRevenue, totalPayments, successfulPayments, failedPayments] =
      await Promise.all([
        this.paymentModel.aggregate([
          { $match: { status: PaymentStatus.SUCCEEDED } },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]),
        this.paymentModel.countDocuments(),
        this.paymentModel.countDocuments({ status: PaymentStatus.SUCCEEDED }),
        this.paymentModel.countDocuments({ status: PaymentStatus.FAILED }),
      ]);

    return {
      totalRevenue: totalRevenue[0]?.total || 0,
      totalPayments,
      successfulPayments,
      failedPayments,
      successRate:
        totalPayments > 0
          ? ((successfulPayments / totalPayments) * 100).toFixed(2)
          : 0,
    };
  }
}
