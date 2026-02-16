import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  StudentItemGrade,
  StudentItemGradeSchema,
} from './schema/student-item-grade.schema';
import { StudentItemGradeController } from './student-item-grade.controller';
import { StudentItemGradeService } from './student-item-grade.service';
import { UserSchemaClass, UserSchema } from '../users/schema/user.schema';
import {
  AssignmentSchemaClass,
  AssigmentSchema,
} from '../assigment/schema/assigment.schema';
import {
  AssessmentItem,
  AssessmentItemSchema,
} from '../assessment-Items/schema/assessmentItem.schema';
import {
  Notification,
  NotificationSchema,
} from '../notification/schema/notification.schema';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: StudentItemGrade.name, schema: StudentItemGradeSchema },
      { name: UserSchemaClass.name, schema: UserSchema },
      { name: AssignmentSchemaClass.name, schema: AssigmentSchema },
      { name: AssessmentItem.name, schema: AssessmentItemSchema },
      { name: Notification.name, schema: NotificationSchema },
    ]),
    MailModule,
  ],
  controllers: [StudentItemGradeController],
  providers: [StudentItemGradeService],
  exports: [StudentItemGradeService],
})
export class StudentItemGradeModule {}
