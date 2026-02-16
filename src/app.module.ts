import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { FilesModule } from './files/files.module';
import { AuthModule } from './auth/auth.module';
import databaseConfig from './database/config/database.config';
import authConfig from './auth/config/auth.config';
import appConfig from './config/app.config';
import mailConfig from './mail/config/mail.config';
import fileConfig from './files/config/file.config';
import facebookConfig from './auth-facebook/config/facebook.config';
import googleConfig from './auth-google/config/google.config';
import appleConfig from './auth-apple/config/apple.config';
import path from 'path';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthAppleModule } from './auth-apple/auth-apple.module';
import { AuthFacebookModule } from './auth-facebook/auth-facebook.module';
import { AuthGoogleModule } from './auth-google/auth-google.module';
import { HeaderResolver, I18nModule } from 'nestjs-i18n';
import { TypeOrmConfigService } from './database/typeorm-config.service';
import { MailModule } from './mail/mail.module';
import { HomeModule } from './home/home.module';
import { DataSource, DataSourceOptions } from 'typeorm';
import { AllConfigType } from './config/config.type';
import { SessionModule } from './session/session.module';
import { MailerModule } from './mailer/mailer.module';
import { MongooseModule } from '@nestjs/mongoose';
import { MongooseConfigService } from './database/mongoose-config.service';
import { DatabaseConfig } from './database/config/database-config.type';
import { CertificatesModule } from './certificate/certificates.module';
import { CoursesModule } from './course/courses.module';
import { CategoriesModule } from './category/categories.module';
import { BlogsModule } from './blog/blogs.module';
import { ClassScheduleModule } from './classSchedule/class-schedule.module';
import { EnrollmentModule } from './Enrollment/enrollment.module';
import { StripeModule } from './stripe/stripe.module';
import stripeConfig from './stripe/config/stripe.config';
import { PaymentModule } from './payment/payment.module';
import { GoogleModule } from './googleService/google.module';
import { BookingsModule } from './booking/booking.module';
import { PurchaseOrderModule } from './purchaseOrder/purchase.module';
import { AttendanceModule } from './attendance/attendence.module';
import { LocationModule } from './location/location.module';
import { NotificationModule } from './notification/notification.module';
import { EnquiriesModule } from './enquiry/enquiries.module';
import { AssigmentModule } from './assigment/assigment.module';
import { AssessmentItemModule } from './assessment-Items/assessmentItem.module';
import { StudentItemGradeModule } from './student-item-Grade/student-item-grade.module';
import { CorporateScheduleModule } from './corporate/corporateSchedule.module';
import { BookingListModule } from './bookinglist/bookingList.module';
import { FeedbackModule } from './feedback-Question/feedback.module';
import { FeedbackAnswerModule } from './feedback-answer/feedback-answer.module';
import { BundleOfferModule } from './bundle-offer/bundle-offer.module';

// <database-block>
const infrastructureDatabaseModule = (databaseConfig() as DatabaseConfig)
  .isDocumentDatabase
  ? MongooseModule.forRootAsync({
      useClass: MongooseConfigService,
    })
  : TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
      dataSourceFactory: async (options: DataSourceOptions) => {
        return new DataSource(options).initialize();
      },
    });
// </database-block>

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        databaseConfig,
        authConfig,
        appConfig,
        mailConfig,
        fileConfig,
        facebookConfig,
        googleConfig,
        appleConfig,
        stripeConfig,
      ],
      envFilePath: ['.env'],
    }),
    infrastructureDatabaseModule,
    I18nModule.forRootAsync({
      useFactory: (configService: ConfigService<AllConfigType>) => ({
        fallbackLanguage: configService.getOrThrow('app.fallbackLanguage', {
          infer: true,
        }),
        loaderOptions: { path: path.join(__dirname, '/i18n/'), watch: true },
      }),
      resolvers: [
        {
          use: HeaderResolver,
          useFactory: (configService: ConfigService<AllConfigType>) => {
            return [
              configService.get('app.headerLanguage', {
                infer: true,
              }),
            ];
          },
          inject: [ConfigService],
        },
      ],
      imports: [ConfigModule],
      inject: [ConfigService],
    }),
    UsersModule,
    FilesModule,
    AuthModule,
    AuthFacebookModule,
    AuthGoogleModule,
    AuthAppleModule,
    SessionModule,
    MailModule,
    MailerModule,
    HomeModule,
    CertificatesModule,
    CoursesModule,
    CategoriesModule,
    EnrollmentModule,
    BlogsModule,
    ClassScheduleModule,
    GoogleModule,
    StripeModule,
    PaymentModule,
    BookingsModule,
    PurchaseOrderModule,
    AttendanceModule,
    LocationModule,
    NotificationModule,
    EnquiriesModule,
    AssigmentModule,
    AssessmentItemModule,
    StudentItemGradeModule,
    BookingListModule,
    CorporateScheduleModule,
    FeedbackModule,
    FeedbackAnswerModule,
    BundleOfferModule,
  ],
})
export class AppModule {}
