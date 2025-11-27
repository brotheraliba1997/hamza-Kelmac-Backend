import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import {
  PurchaseOrderSchemaClass,
  PurchaseOrderStatusEnum,
} from './schema/purchase.schema';
import { CreatePurchaseOrderDto } from './dto/create-purchase.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase.dto';
import {
  sanitizeMongooseDocument,
  convertIdToString,
} from '../utils/convert-id';
import { PurchaseOrderEntity } from './domain/purchase-order.entity';
import { MailService } from '../mail/mail.service';
import { PaymentService } from '../payment/payment.service';
import { AllConfigType } from '../config/config.type';
import { CourseSchemaClass } from '../course/schema/course.schema';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { PaginationResult } from '../utils/mongoose-query-builder';
import { Types } from 'mongoose';
import {
  BookingStatus,
  PaymentMethod as BookingPaymentMethod,
} from '../booking/dto/create-booking.dto';
import { Booking, BookingDocument } from '../booking/schema/booking.schema';
import { ClassScheduleHelperService } from '../utils/class-schedule/class-schedule-helper.service';

@Injectable()
export class PurchaseOrderService {
  constructor(
    @InjectModel(PurchaseOrderSchemaClass.name)
    private readonly purchaseOrderModel: Model<PurchaseOrderSchemaClass>,
    private readonly mailService: MailService,
    private readonly paymentService: PaymentService,
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
    private readonly configService: ConfigService<AllConfigType>,
    @InjectModel(CourseSchemaClass.name)
    private readonly courseModel: Model<CourseSchemaClass>,
    private readonly classScheduleHelper: ClassScheduleHelperService, // ✅ Inject
  ) {}

  private readonly purchaseOrderPopulate = [
    { path: 'student', select: 'firstName lastName email' },
    { path: 'financialContact', select: 'firstName lastName email' },
    { path: 'course', select: 'title slug price currency sessions details' },
  ];

  private map(doc: any): PurchaseOrderEntity {
    if (!doc) return undefined as any;

    const sanitized = sanitizeMongooseDocument(doc);
    if (!sanitized) return undefined as any;

    return new PurchaseOrderEntity({
      ...sanitized,
      id: sanitized.id || convertIdToString(doc),
      // course:
      //   typeof sanitized.course === 'string'
      //     ? sanitized.course
      //     : (convertIdToString(sanitized.course) ??
      //       convertIdToString(doc?.course)),
      // student:
      //   typeof sanitized.student === 'string'
      //     ? sanitized.student
      //     : (convertIdToString(sanitized.student) ??
      //       convertIdToString(doc?.student)),
      // financialContact:
      //   typeof sanitized.financialContact === 'string'
      //     ? sanitized.financialContact
      //     : (convertIdToString(sanitized.financialContact) ??
      //       convertIdToString(doc?.financialContact)),
      // reviewedBy:
      //   typeof sanitized.reviewedBy === 'string'
      //     ? sanitized.reviewedBy
      //     : convertIdToString(sanitized.reviewedBy),
    });
  }

  private getUserFullName(user?: any): string | undefined {
    if (!user) return undefined;
    const first = (user.firstName || '').trim();
    const last = (user.lastName || '').trim();
    const combined = `${first} ${last}`.trim();
    return combined || user.email || undefined;
  }

  private getUserEmail(user?: any): string | undefined {
    return user?.email;
  }

  private getCourseTitle(course?: any): string | undefined {
    if (!course) return undefined;
    if (typeof course === 'string') {
      return course;
    }
    return course.title || undefined;
  }

  private async sendSubmissionEmail(po: any): Promise<void> {
    if (!po) return;
    const financeEmail = this.getUserEmail(po.financialContact);
    if (!financeEmail) {
      return;
    }

    await this.mailService.purchaseOrderSubmitted({
      to: financeEmail,
      data: {
        poNumber: po.poNumber,
        studentName: this.getUserFullName(po.student),
        courseTitle: this.getCourseTitle(po.course),
        bankSlipUrl: po.bankSlipUrl,
        submittedAt: po.submittedAt
          ? new Date(po.submittedAt).toISOString()
          : undefined,
      },
    });
  }

  private async sendDecisionEmail(po: any): Promise<void> {
    if (!po) return;
    const studentEmail = this.getUserEmail(po.student);
    if (!studentEmail) {
      return;
    }

    // Send general decision email
    await this.mailService.purchaseOrderDecision({
      to: studentEmail,
      data: {
        poNumber: po.poNumber,
        courseTitle: this.getCourseTitle(po.course),
        status: po.status,
        decisionNotes: po.decisionNotes,
        reviewedBy: this.getUserFullName(po.financialContact),
      },
    });

    // If approved, send course materials email
    if (po.status === PurchaseOrderStatusEnum.APPROVED) {
      try {
        let course = po.course as any;
        const student = po.student as any;

        // If course is not populated properly, fetch it
        if (!course?.sessions) {
          const courseId =
            course?._id?.toString() ||
            (typeof course === 'string' ? course : null) ||
            po.course?.toString();

          if (courseId) {
            const fetchedCourse = await this.courseModel
              .findById(courseId)
              .select('title slug sessions details price currency')
              .lean();

            if (fetchedCourse) {
              course = fetchedCourse;
            }
          }
        }

        // Generate course material link
        const frontendDomain = this.configService.getOrThrow(
          'app.frontendDomain',
          { infer: true },
        );
        const courseMaterialLink = course?.slug
          ? `${frontendDomain}/courses/${course.slug}/materials`
          : `${frontendDomain}/courses/${course?._id?.toString() || po.course}/materials`;

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

        // Send course materials email
        const studentName = this.getUserFullName(student) || 'Student';
        const courseTitle = this.getCourseTitle(course) || 'Course';
        const amount = course?.price || 0;
        const currency = course?.currency?.toUpperCase() || 'USD';

        await this.mailService.studentPaymentConfirmation({
          to: studentEmail,
          data: {
            studentName,
            courseTitle,
            courseMaterialLink,
            courseMaterials,
            amount,
            currency,
            paymentDate: new Date().toISOString(),
          },
        });
      } catch (error) {
        // Log error but don't fail the email sending
        console.error(
          'Failed to send course materials email for approved PO:',
          error.message,
        );
      }
    }
  }

  async create(dto: CreatePurchaseOrderDto) {
    try {
      const created = await this.purchaseOrderModel.create({
        poNumber: dto.poNumber,
        student: dto.studentId,
        course: dto.courseId,
        financialContact: dto.financialContactId,
        bankSlipUrl: dto.bankSlipUrl,
        submittedAt: dto.submittedAt ? new Date(dto.submittedAt) : new Date(),
        status: PurchaseOrderStatusEnum.PENDING,
        ...(dto.BookingId && { BookingId: new Types.ObjectId(dto.BookingId) }), // ✅ Add BookingId if provided
      });

      const existingpurchaseOrder = await this.purchaseOrderModel.findOne({
        student: dto.studentId,
        course: dto.courseId,
        status: PurchaseOrderStatusEnum.PENDING,
      });

      if (existingpurchaseOrder) {
        throw new BadRequestException('You have already paid for this course');
      }

      const booking = await this.bookingModel.findOne({
        studentId: new Types.ObjectId(dto.studentId),
        courseId: new Types.ObjectId(dto.courseId),
      });

      if (booking) {
        booking.status = BookingStatus.PENDING;
        await booking.save();

        // ✅ Student ko class schedule mein add karo
      }

      const populated = await this.purchaseOrderModel
        .findById(created._id)
        .populate(this.purchaseOrderPopulate)
        .lean()
        .exec();

      if (populated) {
        await this.sendSubmissionEmail(populated);
        return this.map(populated);
      }

      return this.map(created.toObject());
    } catch (error) {
      if (error?.code === 11000) {
        throw new BadRequestException('Purchase order number already exists');
      }
      throw error;
    }
  }

  async findAll(
    status?: PurchaseOrderStatusEnum,
    paginationOptions?: IPaginationOptions,
  ): Promise<PaginationResult<PurchaseOrderEntity>> {
    const filter = status ? { status } : {};

    const page = paginationOptions?.page ?? 1;
    const limit = paginationOptions?.limit ?? 10;
    const skip = (page - 1) * limit;

    const [docs, total] = await Promise.all([
      this.purchaseOrderModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate(this.purchaseOrderPopulate)
        .lean()
        .exec(),
      this.purchaseOrderModel.countDocuments(filter).exec(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: docs.map((doc) => this.map(doc)),
      totalItems: total,
      totalPages,
      currentPage: page,
      limit,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }

  async findOne(id: string) {
    const po = await this.purchaseOrderModel
      .findById(id)
      .populate(this.purchaseOrderPopulate)
      .lean()
      .exec();

    if (!po) {
      throw new NotFoundException('Purchase order not found');
    }
    return this.map(po);
  }

  async update(id: string, dto: UpdatePurchaseOrderDto) {
    const payload: Record<string, unknown> = {};

    if (dto.poNumber !== undefined) {
      payload.poNumber = dto.poNumber;
    }

    if (dto.studentId !== undefined) {
      payload.student = dto.studentId;
    }

    if (dto.courseId !== undefined) {
      payload.course = dto.courseId;
    }

    if (dto.financialContactId !== undefined) {
      payload.financialContact = dto.financialContactId;
    }

    if (dto.bankSlipUrl !== undefined) {
      payload.bankSlipUrl = dto.bankSlipUrl;
    }

    if (dto.submittedAt !== undefined) {
      payload.submittedAt = new Date(dto.submittedAt);
    }

    if (dto.status !== undefined) {
      payload.status = dto.status;
      if (dto.status !== PurchaseOrderStatusEnum.PENDING) {
        payload.reviewedAt = dto.reviewedAt
          ? new Date(dto.reviewedAt)
          : new Date();
      }
    }

    if (dto.reviewedBy !== undefined) {
      payload.reviewedBy = dto.reviewedBy;
    }

    if (dto.reviewedAt !== undefined) {
      payload.reviewedAt = new Date(dto.reviewedAt);
    }

    if (dto.decisionNotes !== undefined) {
      payload.decisionNotes = dto.decisionNotes;
    }

    try {
      const updated = await this.purchaseOrderModel
        .findByIdAndUpdate(id, payload, { new: true })
        .populate(this.purchaseOrderPopulate)
        .lean()
        .exec();

      if (!updated) {
        throw new NotFoundException('Purchase order not found');
      }

      // else {
      //   const course = updated.course as any;
      //   const student = updated.student as any;
      //   await this.classScheduleService.updateUserStatus(
      //     course._id,
      //     student._id,
      //     'enrolled',
      //   );
      // }

      if (dto.status && dto.status !== PurchaseOrderStatusEnum.PENDING) {
        await this.sendDecisionEmail(updated);

        // If PO is approved, create payment and enrollment
        if (dto.status === PurchaseOrderStatusEnum.APPROVED) {
          try {
            const course = updated.course as any;
            const student = updated.student as any;
            const courseId =
              convertIdToString(course) || course?._id?.toString();
            const studentId =
              convertIdToString(student) || student?._id?.toString();
            const poId = convertIdToString(updated) || updated._id?.toString();

            if (courseId && studentId && poId) {
              const amount = course?.price || 0;
              const currency = course?.currency || 'usd';

              await this.paymentService.createPaymentFromPurchaseOrder(
                poId,
                studentId,
                courseId,
                amount,
                currency,
              );

              const booking = await this.bookingModel.findOne({
                studentId: new Types.ObjectId(dto.studentId),
                courseId: new Types.ObjectId(dto.courseId),
              });

              if (!booking) {
                return {
                  statusCode: 400,
                  message: 'Booking not found',
                  error: 'Bad Request',
                };
              }

              if (booking) {
                booking.status = BookingStatus.CONFIRMED;
                booking.paymentMethod = BookingPaymentMethod.PURCHASEORDER;
                await booking.save();
              }

              try {
                for (const session of course?.sessions) {
                  if (session.timeBlocks && session.timeBlocks.length > 0) {
                    const firstTimeBlock = session.timeBlocks[0];

                    await this.classScheduleHelper.addStudentToSchedule(
                      booking.courseId.toString(),
                      booking.studentId.toString(),
                      {
                        sessionId: booking.SessionId,
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
                console.warn(
                  `Failed to add student to schedule: ${error.message}`,
                );
              }
            }
          } catch (error) {
            // Log error but don't fail the PO update
            console.error(
              'Failed to create payment from approved PO:',
              error.message,
            );
          }
        }
      }

      return this.map(updated);
    } catch (error) {
      if (error?.code === 11000) {
        throw new BadRequestException('Purchase order number already exists');
      }
      throw error;
    }
  }

  async remove(id: string) {
    const result = await this.purchaseOrderModel
      .findByIdAndDelete(id)
      .lean()
      .exec();

    if (!result) {
      throw new NotFoundException('Purchase order not found');
    }

    return { deleted: true };
  }
}
