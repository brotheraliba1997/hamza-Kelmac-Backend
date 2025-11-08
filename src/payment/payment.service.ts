import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Payment,
  PaymentDocument,
  PaymentStatus,
} from './schema/payment.schema';
import { StripeService } from '../stripe/stripe.service';
import { MailService } from '../mail/mail.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { RefundPaymentDto } from './dto/refund-payment.dto';

import { User } from '../schema/User/user.schema';
import { EnrollmentSchemaClass } from '../Enrollment/infrastructure/enrollments.schema';
import {
  CourseSchemaClass,
  CourseSchema,
} from '../course/schema/course.schema';
import { Course } from '../schema/Course/course.schema';
import { UserSchemaClass } from '../users/schema/user.schema';

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
    @InjectModel(EnrollmentSchemaClass.name)
    private enrollmentModel: Model<EnrollmentSchemaClass>,
    private stripeService: StripeService,
    private mailService: MailService,
  ) {}

  /**
   * Create a payment intent for a course purchase
   */
  async createPayment(userId: string, createPaymentDto: CreatePaymentDto) {
    const { courseId, amount, currency = 'usd', metadata } = createPaymentDto;
    console.log('user', userId);
    // const course = courseId;
    // const user = userId;

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
      metadata: {
        ...metadata,
        courseName: course.title,
        userName: user.firstName + ' ' + user.lastName,
        userEmail: user.email,
      },
    });

   

    await payment.save();


     console.log('user found', user, course);

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
      payment.status = PaymentStatus.PROCESSING;
      await payment.save();

      this.logger.log(
        `Payment intent created: ${paymentIntent.paymentIntentId} for user ${userId}`,
      );

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

  /**
   * Create a checkout session for a course purchase
   */
  async createCheckout(userId: string, createCheckoutDto: CreateCheckoutDto) {
    const { courseId, successUrl, cancelUrl, metadata } = createCheckoutDto;

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
      .populate('user')
      .populate('course');

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
      .populate('user')
      .populate('course')
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
      .populate('user', 'firstName lastName email')
      .populate('course', 'title description price')
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
        .find({ user: new Types.ObjectId(userId) })
        .populate('course', 'title description price')
        .populate('enrollment')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.paymentModel.countDocuments({ user: new Types.ObjectId(userId) }),
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
        .find({ course: new Types.ObjectId(courseId) })
        .populate('user', 'firstName lastName email')
        .populate('enrollment')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.paymentModel.countDocuments({
        course: new Types.ObjectId(courseId),
      }),
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
   * Get all payments (admin)
   */
  async getAllPayments(page = 1, limit = 10, status?: PaymentStatus) {
    const skip = (page - 1) * limit;
    const filter = status ? { status } : {};

    const [payments, total] = await Promise.all([
      this.paymentModel
        .find(filter)
        .populate('user', 'firstName lastName email')
        .populate('course', 'title description price')
        .populate('enrollment')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.paymentModel.countDocuments(filter),
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
