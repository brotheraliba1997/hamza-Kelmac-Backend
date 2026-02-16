import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { I18nContext } from 'nestjs-i18n';
import { MailData } from './interfaces/mail-data.interface';

import { MaybeType } from '../utils/types/maybe.type';
import { MailerService } from '../mailer/mailer.service';
import path from 'path';
import { AllConfigType } from '../config/config.type';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService<AllConfigType>,
  ) {}

  async userSignUp(mailData: MailData<{ hash: string }>): Promise<void> {
    const i18n = I18nContext.current();
    let emailConfirmTitle: MaybeType<string>;
    let text1: MaybeType<string>;
    let text2: MaybeType<string>;
    let text3: MaybeType<string>;

    if (i18n) {
      [emailConfirmTitle, text1, text2, text3] = await Promise.all([
        i18n.t('common.confirmEmail'),
        i18n.t('confirm-email.text1'),
        i18n.t('confirm-email.text2'),
        i18n.t('confirm-email.text3'),
      ]);
    }

    const url = new URL(
      this.configService.getOrThrow('app.frontendDomain', {
        infer: true,
      }) + '/confirm-email',
    );
    url.searchParams.set('hash', mailData.data.hash);

    await this.mailerService.sendMail({
      to: mailData.to,
      subject: emailConfirmTitle,
      text: `${url.toString()} ${emailConfirmTitle}`,
      templatePath: path.join(
        this.configService.getOrThrow('app.workingDirectory', {
          infer: true,
        }),
        'src',
        'mail',
        'mail-templates',
        'activation.hbs',
      ),
      context: {
        title: emailConfirmTitle,
        url: url.toString(),
        actionTitle: emailConfirmTitle,
        app_name: this.configService.get('app.name', { infer: true }),
        text1,
        text2,
        text3,
      },
    });
  }

  async forgotPassword(
    mailData: MailData<{ hash: string; tokenExpires: number }>,
  ): Promise<void> {
    const i18n = I18nContext.current();
    let resetPasswordTitle: MaybeType<string>;
    let text1: MaybeType<string>;
    let text2: MaybeType<string>;
    let text3: MaybeType<string>;
    let text4: MaybeType<string>;

    if (i18n) {
      [resetPasswordTitle, text1, text2, text3, text4] = await Promise.all([
        i18n.t('common.resetPassword'),
        i18n.t('reset-password.text1'),
        i18n.t('reset-password.text2'),
        i18n.t('reset-password.text3'),
        i18n.t('reset-password.text4'),
      ]);
    }

    const url = new URL(
      this.configService.getOrThrow('app.frontendDomain', {
        infer: true,
      }) + '/password-change',
    );
    url.searchParams.set('hash', mailData.data.hash);
    url.searchParams.set('expires', mailData.data.tokenExpires.toString());

    await this.mailerService.sendMail({
      to: mailData.to,
      subject: resetPasswordTitle,
      text: `${url.toString()} ${resetPasswordTitle}`,
      templatePath: path.join(
        this.configService.getOrThrow('app.workingDirectory', {
          infer: true,
        }),
        'src',
        'mail',
        'mail-templates',
        'reset-password.hbs',
      ),
      context: {
        title: resetPasswordTitle,
        url: url.toString(),
        actionTitle: resetPasswordTitle,
        app_name: this.configService.get('app.name', {
          infer: true,
        }),
        text1,
        text2,
        text3,
        text4,
      },
    });
  }

  async confirmNewEmail(mailData: MailData<{ hash: string }>): Promise<void> {
    const i18n = I18nContext.current();
    let emailConfirmTitle: MaybeType<string>;
    let text1: MaybeType<string>;
    let text2: MaybeType<string>;
    let text3: MaybeType<string>;

    if (i18n) {
      [emailConfirmTitle, text1, text2, text3] = await Promise.all([
        i18n.t('common.confirmEmail'),
        i18n.t('confirm-new-email.text1'),
        i18n.t('confirm-new-email.text2'),
        i18n.t('confirm-new-email.text3'),
      ]);
    }

    const url = new URL(
      this.configService.getOrThrow('app.frontendDomain', {
        infer: true,
      }) + '/confirm-new-email',
    );
    url.searchParams.set('hash', mailData.data.hash);

    await this.mailerService.sendMail({
      to: mailData.to,
      subject: emailConfirmTitle,
      text: `${url.toString()} ${emailConfirmTitle}`,
      templatePath: path.join(
        this.configService.getOrThrow('app.workingDirectory', {
          infer: true,
        }),
        'src',
        'mail',
        'mail-templates',
        'confirm-new-email.hbs',
      ),
      context: {
        title: emailConfirmTitle,
        url: url.toString(),
        actionTitle: emailConfirmTitle,
        app_name: this.configService.get('app.name', { infer: true }),
        text1,
        text2,
        text3,
      },
    });
  }

  async lessonScheduled(
    mailData: MailData<{
      courseName: string;
      instructorName: string;
      lessonDate: string;
      lessonTime: string;
      duration: number;
      googleMeetLink?: string;
    }>,
  ): Promise<void> {
    const i18n = I18nContext.current();
    let title: MaybeType<string>;
    let text1: MaybeType<string>;
    let text2: MaybeType<string>;
    let text3: MaybeType<string>;

    if (i18n) {
      [title, text1, text2, text3] = await Promise.all([
        i18n.t('lesson-scheduled.title'),
        i18n.t('lesson-scheduled.text1'),
        i18n.t('lesson-scheduled.text2'),
        i18n.t('lesson-scheduled.text3'),
      ]);
    }

    if (!title) title = 'New Lesson Scheduled';
    if (!text1) text1 = 'A new lesson has been scheduled for your course.';
    if (!text2)
      text2 =
        'Please make sure to join the session at the scheduled time. You can join using the Google Meet link below.';
    if (!text3)
      text3 =
        'If you have any questions or need to reschedule, please contact your instructor.';

    await this.mailerService.sendMail({
      to: mailData.to,
      subject: title,
      text: `${title} - ${mailData.data.courseName} on ${mailData.data.lessonDate} at ${mailData.data.lessonTime}`,
      templatePath: path.join(
        this.configService.getOrThrow('app.workingDirectory', {
          infer: true,
        }),
        'src',
        'mail',
        'mail-templates',
        'lesson-scheduled.hbs',
      ),
      context: {
        title,
        text1,
        text2,
        text3,
        courseName: mailData.data.courseName,
        instructorName: mailData.data.instructorName,
        lessonDate: mailData.data.lessonDate,
        lessonTime: mailData.data.lessonTime,
        duration: mailData.data.duration,
        googleMeetLink: mailData.data.googleMeetLink,
        app_name: this.configService.get('app.name', { infer: true }),
      },
    });
  }

  async courseCreated(
    mailData: MailData<{
      courseTitle: string;
      instructorName: string;
      description?: string;
      price?: number;
      courseUrl?: string;
    }>,
  ): Promise<void> {
    const i18n = I18nContext.current();
    let title: MaybeType<string>;
    let text1: MaybeType<string>;
    let text2: MaybeType<string>;
    let text3: MaybeType<string>;

    if (i18n) {
      [title, text1, text2, text3] = await Promise.all([
        i18n.t('course-created.title'),
        i18n.t('course-created.text1'),
        i18n.t('course-created.text2'),
        i18n.t('course-created.text3'),
      ]);
    }

    if (!title) title = 'New Course Created';
    if (!text1)
      text1 = 'Congratulations! Your course has been successfully created.';
    if (!text2)
      text2 =
        'Students can now enroll in your course. You can start adding modules and lessons to make it even better.';
    if (!text3)
      text3 =
        'Thank you for contributing to our learning platform. If you need any assistance, feel free to contact us.';

    const url = mailData.data.courseUrl
      ? mailData.data.courseUrl
      : `${this.configService.getOrThrow('app.frontendDomain', { infer: true })}/courses`;

    await this.mailerService.sendMail({
      to: mailData.to,
      subject: title,
      text: `${title} - ${mailData.data.courseTitle}`,
      templatePath: path.join(
        this.configService.getOrThrow('app.workingDirectory', {
          infer: true,
        }),
        'src',
        'mail',
        'mail-templates',
        'course-created.hbs',
      ),
      context: {
        title,
        text1,
        text2,
        text3,
        courseTitle: mailData.data.courseTitle,
        instructorName: mailData.data.instructorName,
        description: mailData.data.description,
        price: mailData.data.price,
        url,
        app_name: this.configService.get('app.name', { infer: true }),
      },
    });
  }

  async courseUpdated(
    mailData: MailData<{
      courseTitle: string;
      instructorName: string;
      description?: string;
      price?: number;
      courseUrl?: string;
    }>,
  ): Promise<void> {
    const i18n = I18nContext.current();
    let title: MaybeType<string>;
    let text1: MaybeType<string>;
    let text2: MaybeType<string>;
    let text3: MaybeType<string>;

    if (i18n) {
      [title, text1, text2, text3] = await Promise.all([
        i18n.t('course-updated.title'),
        i18n.t('course-updated.text1'),
        i18n.t('course-updated.text2'),
        i18n.t('course-updated.text3'),
      ]);
    }

    if (!title) title = 'Course Successfully Updated';
    if (!text1)
      text1 = 'Congratulations! Your course has been successfully updated.';
    if (!text2)
      text2 =
        'Students can now discover and enroll in your updated course. You can continue to enhance it by adding modules, lessons, and learning materials.';
    if (!text3)
      text3 =
        'Thank you for contributing to our learning community. If you need any assistance or have questions, our support team is here to help.';

    const url = mailData.data.courseUrl
      ? mailData.data.courseUrl
      : `${this.configService.getOrThrow('app.frontendDomain', { infer: true })}/courses`;

    await this.mailerService.sendMail({
      to: mailData.to,
      subject: title,
      text: `${title} - ${mailData.data.courseTitle}`,
      templatePath: path.join(
        this.configService.getOrThrow('app.workingDirectory', {
          infer: true,
        }),
        'src',
        'mail',
        'mail-templates',
        'course-updated.hbs',
      ),
      context: {
        title,
        text1,
        text2,
        text3,
        courseTitle: mailData.data.courseTitle,
        instructorName: mailData.data.instructorName,
        description: mailData.data.description,
        price: mailData.data.price,
        url,
        app_name: this.configService.get('app.name', { infer: true }),
      },
    });
  }

  async userRegistered(
    mailData: MailData<{
      userName: string;
      userEmail: string;
      userRole?: string;
      registrationDate: string;
    }>,
  ): Promise<void> {
    const i18n = I18nContext.current();
    let title: MaybeType<string>;
    let text1: MaybeType<string>;
    let text2: MaybeType<string>;

    if (i18n) {
      [title, text1, text2] = await Promise.all([
        i18n.t('user-registered.title'),
        i18n.t('user-registered.text1'),
        i18n.t('user-registered.text2'),
      ]);
    }

    if (!title) title = 'New User Registration';
    if (!text1)
      text1 =
        'A new user has registered on the platform. Here are the details:';
    if (!text2)
      text2 = 'Please review the user account and take any necessary actions.';

    await this.mailerService.sendMail({
      to: mailData.to,
      subject: title,
      text: `${title} - ${mailData.data.userName} (${mailData.data.userEmail})`,
      templatePath: path.join(
        this.configService.getOrThrow('app.workingDirectory', {
          infer: true,
        }),
        'src',
        'mail',
        'mail-templates',
        'user-registered.hbs',
      ),
      context: {
        title,
        text1,
        text2,
        userName: mailData.data.userName,
        userEmail: mailData.data.userEmail,
        userRole: mailData.data.userRole,
        registrationDate: mailData.data.registrationDate,
        app_name: this.configService.get('app.name', { infer: true }),
      },
    });
  }

  async classScheduleCreated(
    mailData: MailData<{
      studentName?: string;
      courseTitle?: string;
      instructorName?: string;
      date?: string;
      time?: string;
      duration?: number;
      googleMeetLink?: string;
      googleCalendarEventLink?: string;
      securityKey?: string;
      sessionId?: string;
    }>,
  ): Promise<void> {
    const subject = 'New Class Schedule Created';

    const lines = [
      `Dear ${mailData.data.studentName || 'Student'},`,
      '',
      'A new class schedule has been created for you.',
      '',
      mailData.data.courseTitle
        ? `Course: ${mailData.data.courseTitle}`
        : undefined,
      mailData.data.instructorName
        ? `Instructor: ${mailData.data.instructorName}`
        : undefined,
      mailData.data.date ? `Date: ${mailData.data.date}` : undefined,
      mailData.data.time ? `Time: ${mailData.data.time}` : undefined,
      mailData.data.duration
        ? `Duration: ${mailData.data.duration} minutes`
        : undefined,
      mailData.data.sessionId
        ? `Session ID: ${mailData.data.sessionId}`
        : undefined,
      '',
      mailData.data.googleMeetLink
        ? `Google Meet Link: ${mailData.data.googleMeetLink}`
        : undefined,
      mailData.data.googleCalendarEventLink
        ? `Add to Calendar: ${mailData.data.googleCalendarEventLink}`
        : undefined,
      mailData.data.securityKey
        ? `Security Key: ${mailData.data.securityKey}`
        : undefined,
      '',
      'Please mark your calendar and join the class on time.',
      '',
      'Best regards,',
      `${this.configService.get('app.name', { infer: true }) || 'Kelmac Team'}`,
    ].filter(Boolean);

    const text = lines.join('\n');

    await this.mailerService.sendMail({
      to: mailData.to,
      subject,
      text,
    });
  }

  async purchaseOrderSubmitted(
    mailData: MailData<{
      poNumber: string;
      studentName?: string;
      courseTitle?: string;
      bankSlipUrl?: string;
      submittedAt?: string;
    }>,
  ): Promise<void> {
    const subject = `Purchase Order ${mailData.data.poNumber} submitted`;

    const lines = [
      `Purchase Order Number: ${mailData.data.poNumber}`,
      mailData.data.studentName
        ? `Student: ${mailData.data.studentName}`
        : undefined,
      mailData.data.courseTitle
        ? `Course: ${mailData.data.courseTitle}`
        : undefined,
      mailData.data.submittedAt
        ? `Submitted At: ${mailData.data.submittedAt}`
        : undefined,
      mailData.data.bankSlipUrl
        ? `Bank Slip: ${mailData.data.bankSlipUrl}`
        : undefined,
    ].filter(Boolean);

    const text = lines.join('\n');

    await this.mailerService.sendMail({
      to: mailData.to,
      subject,
      text,
    });
  }

  async purchaseOrderDecision(
    mailData: MailData<{
      poNumber: string;
      courseTitle?: string;
      status: string;
      decisionNotes?: string;
      reviewedBy?: string;
    }>,
  ): Promise<void> {
    const subject = `Purchase Order ${mailData.data.poNumber} ${mailData.data.status}`;

    const lines = [
      `Purchase Order Number: ${mailData.data.poNumber}`,
      mailData.data.courseTitle
        ? `Course: ${mailData.data.courseTitle}`
        : undefined,
      `Status: ${mailData.data.status}`,
      mailData.data.reviewedBy
        ? `Reviewed By: ${mailData.data.reviewedBy}`
        : undefined,
      mailData.data.decisionNotes
        ? `Notes: ${mailData.data.decisionNotes}`
        : undefined,
    ].filter(Boolean);

    const text = lines.join('\n');

    await this.mailerService.sendMail({
      to: mailData.to,
      subject,
      text,
    });
  }

  async paymentConfirmation(
    mailData: MailData<{
      paymentId: string;
      paymentIntentId?: string;
      studentName?: string;
      studentEmail?: string;
      courseTitle?: string;
      amount: number;
      currency?: string;
      paymentMethod?: string;
      createdAt?: string;
    }>,
  ): Promise<void> {
    const subject = `Payment Confirmation - ${mailData.data.paymentId}`;

    const lines = [
      `Payment ID: ${mailData.data.paymentId}`,
      mailData.data.paymentIntentId
        ? `Payment Intent ID: ${mailData.data.paymentIntentId}`
        : undefined,
      mailData.data.studentName
        ? `Student: ${mailData.data.studentName}`
        : undefined,
      mailData.data.studentEmail
        ? `Student Email: ${mailData.data.studentEmail}`
        : undefined,
      mailData.data.courseTitle
        ? `Course: ${mailData.data.courseTitle}`
        : undefined,
      `Amount: ${mailData.data.amount} ${mailData.data.currency || 'USD'}`,
      mailData.data.paymentMethod
        ? `Payment Method: ${mailData.data.paymentMethod}`
        : undefined,
      mailData.data.createdAt
        ? `Payment Date: ${mailData.data.createdAt}`
        : undefined,
    ].filter(Boolean);

    const text = lines.join('\n');

    await this.mailerService.sendMail({
      to: mailData.to,
      subject,
      text,
    });
  }

  async studentPaymentConfirmation(
    mailData: MailData<{
      studentName: string;
      courseTitle: string;
      courseMaterialLink: string;
      courseMaterials?: Array<{
        name: string;
        type: string;
        link?: string;
      }>;
      amount: number;
      currency?: string;
      paymentDate: string;
    }>,
  ): Promise<void> {
    const subject = `Payment Confirmed - Access Your Course Materials`;

    const frontendDomain = this.configService.getOrThrow('app.frontendDomain', {
      infer: true,
    });

    const courseMaterialsList =
      mailData.data.courseMaterials
        ?.map(
          (material) =>
            `- ${material.name} (${material.type})${material.link ? ` - ${material.link}` : ''}`,
        )
        .join('\n') || 'Course materials will be available in your dashboard.';

    const text = `
Dear ${mailData.data.studentName},

Your payment has been successfully confirmed!

Course: ${mailData.data.courseTitle}
Amount: ${mailData.data.amount} ${mailData.data.currency || 'USD'}
Payment Date: ${mailData.data.paymentDate}

Access Your Course Materials:
${mailData.data.courseMaterialLink}

Course Materials:
${courseMaterialsList}

You can now access all course content, sessions, and materials through the link above.

Thank you for your purchase!

Best regards,
${this.configService.get('app.name', { infer: true }) || 'Kelmac Team'}
    `.trim();

    await this.mailerService.sendMail({
      to: mailData.to,
      subject,
      text,
    });
  }

  async enquirySubmitted(
    mailData: MailData<{
      subject: string;
      name: string;
      email: string;
      phone?: string;
      company?: string;
      designation?: string;
      industry?: string;
      trainingType?: string;
    }>,
  ): Promise<void> {
    const subject = `New Enquiry: ${mailData.data.subject}`;

    const lines = [
      `Subject: ${mailData.data.subject}`,
      `Name: ${mailData.data.name}`,
      `Email: ${mailData.data.email}`,
      mailData.data.phone ? `Phone: ${mailData.data.phone}` : undefined,
      mailData.data.company ? `Company: ${mailData.data.company}` : undefined,
      mailData.data.designation
        ? `Designation: ${mailData.data.designation}`
        : undefined,
      mailData.data.industry
        ? `Industry: ${mailData.data.industry}`
        : undefined,
      mailData.data.trainingType
        ? `Training Type: ${mailData.data.trainingType}`
        : undefined,
    ].filter(Boolean);

    const text = lines.join('\n');

    await this.mailerService.sendMail({
      to: mailData.to,
      subject,
      text,
    });
  }

  async studentPassFailResult(
    mailData: MailData<{
      studentName?: string;
      courseTitle?: string;
      passFailStatus: number;
      isPass: boolean;
      studentMarks: number;
      totalMarks: number;
    }>,
  ): Promise<void> {
    const subject = mailData.data.isPass
      ? 'Congratulations! You Have Passed'
      : 'Assessment Result - You Have Failed';

    const statusMessage = mailData.data.isPass
      ? 'You are Pass'
      : 'You are Fail';

    const text = `
Dear ${mailData.data.studentName || 'Student'},

${statusMessage}

${mailData.data.courseTitle ? `Course: ${mailData.data.courseTitle}` : ''}
Your Score: ${mailData.data.studentMarks} out of ${mailData.data.totalMarks}
Percentage: ${mailData.data.passFailStatus}%

${
  mailData.data.isPass
    ? 'Congratulations on passing the assessment! Keep up the excellent work.'
    : 'We encourage you to review the course materials and try again. If you need assistance, please contact your instructor.'
}

Best regards,
${this.configService.get('app.name', { infer: true }) || 'Kelmac Team'}
    `.trim();

    await this.mailerService.sendMail({
      to: mailData.to,
      subject,
      text,
    });
  }

  async bookingPending(
    mailData: MailData<{
      studentName?: string;
      courseTitle?: string;
      sessionId?: string;
      paymentMethod?: string;
      status: string;
    }>,
  ): Promise<void> {
    const subject = 'Booking Confirmation';

    const text = `
Dear ${mailData.data.studentName || 'Student'},

Your booking has been confirmed.

${mailData.data.courseTitle ? `Course: ${mailData.data.courseTitle}` : ''}
${mailData.data.sessionId ? `Session ID: ${mailData.data.sessionId}` : ''}
${mailData.data.paymentMethod ? `Payment Method: ${mailData.data.paymentMethod}` : ''}
Status: ${mailData.data.status}

Thank you for your booking. We look forward to seeing you.

Best regards,
${this.configService.get('app.name', { infer: true }) || 'Kelmac Team'}
    `.trim();

    await this.mailerService.sendMail({
      to: mailData.to,
      subject,
      text,
    });
  }

  async attendanceMarked(
    mailData: MailData<{
      studentName?: string;
      courseTitle?: string;
      sessionId?: string;
      status: string;
    }>,
  ): Promise<void> {
    const subject = 'Attendance Marked';

    const lines = [
      `Dear ${mailData.data.studentName || 'Student'},`,
      '',
      'Your attendance has been recorded for the following session:',
      '',
      mailData.data.courseTitle
        ? `Course: ${mailData.data.courseTitle}`
        : undefined,
      mailData.data.sessionId
        ? `Session ID: ${mailData.data.sessionId}`
        : undefined,
      `Status: ${mailData.data.status}`,
      '',
      'If you believe this is incorrect, please contact your instructor or support team.',
      '',
      'Best regards,',
      `${this.configService.get('app.name', { infer: true }) || 'Kelmac Team'}`,
    ].filter(Boolean);

    const text = lines.join('\n');

    await this.mailerService.sendMail({
      to: mailData.to,
      subject,
      text,
    });
  }
}
