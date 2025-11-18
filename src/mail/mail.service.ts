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
}
