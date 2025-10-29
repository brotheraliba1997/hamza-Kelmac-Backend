import { User } from '../../users/domain/user';

export class BlogEntity {
  constructor(
    public id: string,
    public title: string,
    public content: string,
    public author: string | User, // ObjectId string or populated UserEntity
    public comments: string[],
    public isPublished: boolean,
    public createdAt: Date,
    public updatedAt: Date,
    public deletedAt: Date | null,
  ) {}
}
