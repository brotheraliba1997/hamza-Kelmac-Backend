import { CourseSchemaClass } from '../entities/course.schema';
import {
  LessonSchemaClass,
  ModuleSchemaClass,
} from '../entities/course.schema';
// import {
//   CourseEntity,
//   ModuleEntity,
//   LessonEntity,
// } from '../../../domain/entities/course.entity';
import { UserMapper } from '../../../../../users/infrastructure/persistence/document/mappers/user.mapper';
import { UserSchemaClass } from '../../../../../users/infrastructure/persistence/document/entities/user.schema';
import {
  CourseEntity,
  ModuleEntity,
  LessonEntity,
} from '../../../../domain/course';

export class CourseMapper {
  static toDomain(raw: CourseSchemaClass): CourseEntity {
    const domainEntity = new CourseEntity({
      id: raw._id?.toString(),
      title: raw.title,
      description: raw.description,
      price: raw.price,
      enrolledCount: raw.enrolledCount,
      isPublished: raw.isPublished,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      deletedAt: raw.deletedAt ?? null,
      instructor:
        raw.instructor && typeof raw.instructor === 'object'
          ? UserMapper.toDomain(raw.instructor as unknown as UserSchemaClass)
          : raw.instructor, // handle populated or ObjectId
      modules: (raw.modules ?? []).map((module) => this.moduleToDomain(module)),
    });

    return domainEntity;
  }

  static toPersistence(domainEntity: CourseEntity): CourseSchemaClass {
    const persistenceSchema = new CourseSchemaClass();

    if (domainEntity.id && typeof domainEntity.id === 'string') {
      persistenceSchema._id = domainEntity.id;
    }

    persistenceSchema.title = domainEntity.title;
    persistenceSchema.description = domainEntity.description;
    persistenceSchema.price = domainEntity.price;
    persistenceSchema.enrolledCount = domainEntity.enrolledCount;
    persistenceSchema.isPublished = domainEntity.isPublished;
    persistenceSchema.createdAt = domainEntity.createdAt;
    persistenceSchema.updatedAt = domainEntity.updatedAt;
    persistenceSchema.deletedAt = domainEntity.deletedAt;

    // instructor reference
    persistenceSchema.instructor =
      typeof domainEntity.instructor === 'object'
        ? (domainEntity.instructor as any).id
        : domainEntity.instructor;

    // nested modules
    persistenceSchema.modules = (domainEntity.modules ?? []).map((m) =>
      this.moduleToPersistence(m),
    );

    return persistenceSchema;
  }

  private static moduleToDomain(raw: ModuleSchemaClass): ModuleEntity {
    return {
      title: raw.title,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      lessons: (raw.lessons ?? []).map((lesson) => this.lessonToDomain(lesson)),
    };
  }

  private static moduleToPersistence(
    domainEntity: ModuleEntity,
  ): ModuleSchemaClass {
    const moduleSchema = new ModuleSchemaClass();
    moduleSchema.title = domainEntity.title;
    moduleSchema.createdAt = domainEntity.createdAt;
    moduleSchema.updatedAt = domainEntity.updatedAt;
    moduleSchema.lessons = (domainEntity.lessons ?? []).map((l) =>
      this.lessonToPersistence(l),
    );
    return moduleSchema;
  }

  private static lessonToDomain(raw: LessonSchemaClass): LessonEntity {
    return {
      title: raw.title,
      videoUrl: raw.videoUrl,
      content: raw.content,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }

  private static lessonToPersistence(
    domainEntity: LessonEntity,
  ): LessonSchemaClass {
    const lessonSchema = new LessonSchemaClass();
    lessonSchema.title = domainEntity.title;
    lessonSchema.videoUrl = domainEntity.videoUrl;
    lessonSchema.content = domainEntity.content;
    lessonSchema.createdAt = domainEntity.createdAt;
    lessonSchema.updatedAt = domainEntity.updatedAt;
    return lessonSchema;
  }
}
