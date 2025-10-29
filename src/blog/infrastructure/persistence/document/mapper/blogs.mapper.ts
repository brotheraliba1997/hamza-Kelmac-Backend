import { BlogSchemaClass } from '../entities/blogs.schema';
import { UserMapper } from '../../../../../users/infrastructure/persistence/document/mappers/user.mapper';
import { UserSchemaClass } from '../../../../../users/infrastructure/persistence/document/entities/user.schema';
import { BlogEntity } from '../../../../domain/blog';

export class BlogMapper {
  static toDomain(raw: BlogSchemaClass): BlogEntity {
    const domainEntity = new BlogEntity(
      raw._id?.toString(),
      raw.title,
      raw.content,
      raw.author && typeof raw.author === 'object'
        ? UserMapper.toDomain(raw.author as unknown as UserSchemaClass)
        : raw.author?.toString(), // handle populated or ObjectId
      raw.comments || [],
      raw.isPublished,
      raw.createdAt,
      raw.updatedAt,
      raw.deletedAt ?? null,
    );

    return domainEntity;
  }

  static toPersistence(domainEntity: BlogEntity): BlogSchemaClass {
    const persistenceSchema = new BlogSchemaClass();

    if (domainEntity.id && typeof domainEntity.id === 'string') {
      persistenceSchema._id = domainEntity.id;
    }

    persistenceSchema.title = domainEntity.title;
    persistenceSchema.content = domainEntity.content;
    persistenceSchema.isPublished = domainEntity.isPublished;
    persistenceSchema.createdAt = domainEntity.createdAt;
    persistenceSchema.updatedAt = domainEntity.updatedAt;
    persistenceSchema.deletedAt = domainEntity.deletedAt;
    persistenceSchema.comments = domainEntity.comments;

    // author reference
    persistenceSchema.author =
      typeof domainEntity.author === 'object'
        ? (domainEntity.author as any).id
        : domainEntity.author;

    return persistenceSchema;
  }
}
