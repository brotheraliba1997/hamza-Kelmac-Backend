import { UserMapper } from '../../../../../users/infrastructure/persistence/document/mappers/user.mapper';
import { UserSchemaClass } from '../../../../../users/infrastructure/persistence/document/entities/user.schema';
import { CourseSchemaClass } from '../../../../../course/infrastructure/persistence/document/entities/course.schema';
import { CourseMapper } from '../../../../../course/infrastructure/persistence/document/mapper/courses.mapper';
import { ClassScheduleSchemaClass } from '../entities/class-schedule.schema';
import { ClassScheduleEntity } from '../../../../doman/class-scheduleEntity';

export class ClassScheduleMapper {
  /**
   * Converts raw MongoDB document -> Domain Entity
   */
  static toDomain(raw: ClassScheduleSchemaClass): ClassScheduleEntity {
    const domainEntity = new ClassScheduleEntity({
      id: raw._id?.toString(),
      course:
        raw.course && typeof raw.course === 'object'
          ? CourseMapper.toDomain(raw.course as unknown as CourseSchemaClass)
          : raw.course,
      instructor:
        raw.instructor && typeof raw.instructor === 'object'
          ? UserMapper.toDomain(raw.instructor as unknown as UserSchemaClass)
          : raw.instructor,
      students: (raw.students ?? []).map((student) =>
        typeof student === 'object'
          ? UserMapper.toDomain(student as unknown as UserSchemaClass)
          : student,
      ),
      date: raw.date,
      time: raw.time,
      googleMeetLink: raw.googleMeetLink,
      securityKey: raw.securityKey,
      status: raw.status,
      progress: raw.progress,
      startedAt: raw.startedAt,
      endedAt: raw.endedAt,
      attendedAt: raw.attendedAt,
      certificateLink: raw.certificateLink,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      deletedAt: raw.deletedAt ?? null,
    });

    return domainEntity;
  }

  /**
   * Converts Domain Entity -> Persistence Schema
   */
  static toPersistence(
    domainEntity: ClassScheduleEntity,
  ): ClassScheduleSchemaClass {
    const persistence = new ClassScheduleSchemaClass();

    if (domainEntity.id && typeof domainEntity.id === 'string') {
      persistence._id = domainEntity.id;
    }

    // Course reference
    persistence.course =
      typeof domainEntity.course === 'object'
        ? (domainEntity.course as any).id
        : domainEntity.course;

    // Instructor reference
    persistence.instructor =
      typeof domainEntity.instructor === 'object'
        ? (domainEntity.instructor as any).id
        : domainEntity.instructor;

    // Students array
    persistence.students = (domainEntity.students ?? []).map((student) =>
      typeof student === 'object' ? (student as any).id : student,
    );

    persistence.date = domainEntity.date;
    persistence.time = domainEntity.time;
    persistence.googleMeetLink = domainEntity.googleMeetLink;
    persistence.securityKey = domainEntity.securityKey;
    persistence.status = domainEntity.status;
    persistence.progress = domainEntity.progress ?? 0;
    persistence.startedAt = domainEntity.startedAt;
    persistence.endedAt = domainEntity.endedAt;
    persistence.attendedAt = domainEntity.attendedAt;
    persistence.certificateLink = domainEntity.certificateLink;
    persistence.createdAt = domainEntity.createdAt;
    persistence.updatedAt = domainEntity.updatedAt;
    persistence.deletedAt = domainEntity.deletedAt ?? null;

    return persistence;
  }
}
