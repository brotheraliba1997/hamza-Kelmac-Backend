import {
  HttpStatus,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { NullableType } from '../utils/types/nullable.type';
import { FilterUserDto, SortUserDto } from './dto/query-user.dto';
import { User } from './domain/user';
import bcrypt from 'bcryptjs';
import { AuthProvidersEnum } from '../auth/auth-providers.enum';
import { FilesService } from '../files/files.service';
import { RoleEnum } from '../roles/roles.enum';
import { StatusEnum } from '../statuses/statuses.enum';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { FileType } from '../files/domain/file';
import { Role } from '../roles/domain/role';
import { Status } from '../statuses/domain/status';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserSchemaClass } from './schema/user.schema';
import {
  buildMongooseQuery,
  FilterQueryBuilder,
  PaginationResult,
} from '../utils/mongoose-query-builder';
import { sanitizeMongooseDocument } from '../utils/convert-id';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(UserSchemaClass.name) private readonly userModel: Model<UserSchemaClass>,
    private readonly filesService: FilesService,
  ) {}

  private map(doc: any): User {
    if (!doc) return undefined as any;
    const id = typeof doc.id !== 'undefined' ? doc.id : doc._id?.toString?.();
    // Sanitize the document to convert all IDs and nested objects
    const sanitized = sanitizeMongooseDocument(doc);

    // Double-check sanitized is not null
    if (!sanitized) return undefined as any;
    return {
      id,
      email: sanitized.email,
      password: sanitized.password,
      provider: sanitized.provider || AuthProvidersEnum.email,
      socialId: sanitized.socialId,
      firstName: sanitized.firstName,
      lastName: sanitized.lastName,
      photo: sanitized.photo,
      role: sanitized.role,
      status: sanitized.status,
      createdAt: sanitized.createdAt,
      updatedAt: sanitized.updatedAt,
      deletedAt: sanitized.deletedAt,
    };
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Do not remove comment below.
    // <creating-property />

    let password: string | undefined = undefined;

    if (createUserDto.password) {
      const salt = await bcrypt.genSalt();
      password = await bcrypt.hash(createUserDto.password, salt);
    }

    let email: string | null = null;

    if (createUserDto.email) {
      const existingUser = await this.userModel
        .findOne({ email: createUserDto.email })
        .lean();
      if (existingUser) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            email: 'emailAlreadyExists',
          },
        });
      }
      email = createUserDto.email;
    }

    let photo: FileType | null | undefined = undefined;

    if (createUserDto.photo?.id) {
      const fileObject = await this.filesService.findById(
        createUserDto.photo.id,
      );
      if (!fileObject) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            photo: 'imageNotExists',
          },
        });
      }
      photo = fileObject;
    } else if (createUserDto.photo === null) {
      photo = null;
    }

    let role: Role | undefined = undefined;

    if (createUserDto.role?.id) {
      const roleObject = Object.values(RoleEnum)
        .map(String)
        .includes(String(createUserDto.role.id));
      if (!roleObject) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            role: 'roleNotExists',
          },
        });
      }

      role = {
        id: createUserDto.role.id,
      };
    }

    let status: Status | undefined = undefined;

    if (createUserDto.status?.id) {
      const statusObject = Object.values(StatusEnum)
        .map(String)
        .includes(String(createUserDto.status.id));
      if (!statusObject) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            status: 'statusNotExists',
          },
        });
      }

      status = {
        id: createUserDto.status.id,
      };
    }

    const created = await this.userModel.create({
      // Do not remove comment below.
      // <creating-property-payload />
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      email: email,
      password: password,
      photo: photo,
      role: role,
      status: status,
      provider: createUserDto.provider ?? AuthProvidersEnum.email,
      socialId: createUserDto.socialId,
    });
    return this.map(created);
  }

  async findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterUserDto | null;
    sortOptions?: SortUserDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<PaginationResult<User>> {
    // Build filter query
    const filterQuery = new FilterQueryBuilder<UserSchemaClass>()
      .addCustom(
        'role._id' as any,
        filterOptions?.roles?.length
          ? { $in: filterOptions.roles.map((role) => role.id.toString()) }
          : undefined,
      )
      .build();

    // Convert sort options to match expected type
    const mappedSortOptions = sortOptions?.map((s) => ({
      orderBy: s.orderBy as string,
      order: (s.order?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC') as
        | 'ASC'
        | 'DESC',
    }));

    return buildMongooseQuery({
      model: this.userModel,
      filterQuery,
      sortOptions: mappedSortOptions,
      paginationOptions,
      mapper: (doc) => this.map(doc),
    });
  }

  async findById(id: User['id']): Promise<NullableType<User>> {
    const doc = await this.userModel.findById(id).lean();
    return doc ? this.map(doc) : null;
  }

  async findByIds(ids: User['id'][]): Promise<User[]> {
    const docs = await this.userModel.find({ _id: { $in: ids } }).lean();
    return docs.map((doc: any) => this.map(doc));
  }

  async findByEmail(email: User['email']): Promise<NullableType<User>> {
    if (!email) return null;
    const doc = await this.userModel.findOne({ email }).lean();
    return doc ? this.map(doc) : null;
  }

  async findBySocialIdAndProvider({
    socialId,
    provider,
  }: {
    socialId: User['socialId'];
    provider: User['provider'];
  }): Promise<NullableType<User>> {
    if (!socialId || !provider) return null;
    const doc = await this.userModel.findOne({ socialId, provider }).lean();
    return doc ? this.map(doc) : null;
  }

  async update(
    id: User['id'],
    updateUserDto: UpdateUserDto,
  ): Promise<User | null> {
    // Do not remove comment below.
    // <updating-property />

    let password: string | undefined = undefined;

    if (updateUserDto.password) {
      const userDoc = await this.userModel.findById(id).lean();

      if (userDoc && userDoc?.password !== updateUserDto.password) {
        const salt = await bcrypt.genSalt();
        password = await bcrypt.hash(updateUserDto.password, salt);
      }
    }

    let email: string | null | undefined = undefined;

    if (updateUserDto.email) {
      const existingUser = await this.userModel
        .findOne({ email: updateUserDto.email })
        .lean();

      if (existingUser && existingUser._id.toString() !== id.toString()) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            email: 'emailAlreadyExists',
          },
        });
      }

      email = updateUserDto.email;
    } else if (updateUserDto.email === null) {
      email = null;
    }

    let photo: FileType | null | undefined = undefined;

    if (updateUserDto.photo?.id) {
      const fileObject = await this.filesService.findById(
        updateUserDto.photo.id,
      );
      if (!fileObject) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            photo: 'imageNotExists',
          },
        });
      }
      photo = fileObject;
    } else if (updateUserDto.photo === null) {
      photo = null;
    }

    let role: Role | undefined = undefined;

    if (updateUserDto.role?.id) {
      const roleObject = Object.values(RoleEnum)
        .map(String)
        .includes(String(updateUserDto.role.id));
      if (!roleObject) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            role: 'roleNotExists',
          },
        });
      }

      role = {
        id: updateUserDto.role.id,
      };
    }

    let status: Status | undefined = undefined;

    if (updateUserDto.status?.id) {
      const statusObject = Object.values(StatusEnum)
        .map(String)
        .includes(String(updateUserDto.status.id));
      if (!statusObject) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            status: 'statusNotExists',
          },
        });
      }

      status = {
        id: updateUserDto.status.id,
      };
    }

    const updated = await this.userModel
      .findByIdAndUpdate(
        id,
        {
          // Do not remove comment below.
          // <updating-property-payload />
          firstName: updateUserDto.firstName,
          lastName: updateUserDto.lastName,
          email,
          password,
          photo,
          role,
          status,
          provider: updateUserDto.provider,
          socialId: updateUserDto.socialId,
        },
        { new: true },
      )
      .lean();
    return updated ? this.map(updated) : null;
  }

  async remove(id: User['id']): Promise<void> {
    await this.userModel.deleteOne({ _id: id });
  }
}
