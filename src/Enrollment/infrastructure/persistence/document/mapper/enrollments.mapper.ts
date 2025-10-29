import { UserMapper } from '../../../../../users/infrastructure/persistence/document/mappers/user.mapper';
import { UserSchemaClass } from '../../../../../users/infrastructure/persistence/document/entities/user.schema';
import { CourseSchemaClass } from '../../../../../course/infrastructure/persistence/document/entities/course.schema';
import { EnrollmentEntity } from '../../../../domain/enrollment';
import { EnrollmentSchemaClass } from '../entities/enrollments.schema';
import { CourseMapper } from '../../../../../course/infrastructure/persistence/document/mapper/courses.mapper';

export class EnrollmentMapper {
  static toDomain(raw: EnrollmentSchemaClass): EnrollmentEntity {
    const domainEntity = new EnrollmentEntity();

    return domainEntity;
  }

  static toPersistence(domainEntity: EnrollmentEntity): EnrollmentSchemaClass {
    const persistenceSchema = new EnrollmentSchemaClass();

    if (domainEntity.id && typeof domainEntity.id === 'string') {
      persistenceSchema._id = domainEntity.id;
    }
    console.log('domainEntity.user:', domainEntity.user);
    persistenceSchema.user =
      typeof domainEntity.user === 'object'
        ? (domainEntity.user as any).id
        : domainEntity.user;

    persistenceSchema.course =
      typeof domainEntity.course === 'object'
        ? (domainEntity.course as any).id
        : domainEntity.course;

    persistenceSchema.payment =
      typeof domainEntity.payment === 'object'
        ? (domainEntity.payment as any).id
        : domainEntity.payment;

    persistenceSchema.offer =
      typeof domainEntity.offer === 'object'
        ? (domainEntity.offer as any).id
        : domainEntity.offer;

    persistenceSchema.certificate =
      typeof domainEntity.certificate === 'object'
        ? (domainEntity.certificate as any).id
        : domainEntity.certificate;
    // persistenceSchema.payment = domainEntity.payment;
    // persistenceSchema.offer = domainEntity.offer;
    //     persistenceSchema.certificate = domainEntity.certificate;

    persistenceSchema.progress = domainEntity.progress;
    persistenceSchema.status = domainEntity.status;
    persistenceSchema.completionDate = domainEntity.completionDate;
    persistenceSchema.createdAt = domainEntity.createdAt;
    persistenceSchema.updatedAt = domainEntity.updatedAt;
    persistenceSchema.deletedAt = domainEntity.deletedAt;

    return persistenceSchema;
  }
}
