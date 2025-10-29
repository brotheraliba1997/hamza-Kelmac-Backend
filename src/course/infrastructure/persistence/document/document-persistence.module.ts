import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CourseSchema, CourseSchemaClass } from './entities/course.schema';
import { Course } from '../../../../schema/Course/course.schema';
import { CourseRepository } from '../courses.repository';
import { CoursesDocumentRepository } from './repositories/courses.repository';
// import { UserSchema, UserSchemaClass } from './entities/user.schema';
// import { UserRepository } from '../user.repository';
// import { UsersDocumentRepository } from './repositories/user.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CourseSchemaClass.name, schema: CourseSchema },
    ]),
  ],
  providers: [
    {
      provide: CourseRepository,
      useClass: CoursesDocumentRepository,
    },
  ],
  exports: [CourseRepository],
})
export class DocumentCoursesPersistenceModule {}
