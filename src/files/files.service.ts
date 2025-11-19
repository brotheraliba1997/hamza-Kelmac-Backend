import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FileSchemaClass } from './schema/file.schema';
import { FileType } from './domain/file';
import { NullableType } from '../utils/types/nullable.type';

@Injectable()
export class FilesService {
  constructor(
    @InjectModel(FileSchemaClass.name)
    private readonly fileModel: Model<FileSchemaClass>,
  ) {}

  async create(data: { path: string }): Promise<FileType> {
    const file = await this.fileModel.create(data);
    return {
      id: file._id.toString(),
      path: file.path,
    };
  }

  async findById(id: FileType['id']): Promise<NullableType<FileType>> {
    const file = await this.fileModel.findById(id).lean();
    if (!file) return null;

    return {
      id: file._id.toString(),
      path: file.path,
    };
  }

  async findByIds(ids: FileType['id'][]): Promise<FileType[]> {
    const files = await this.fileModel.find({ _id: { $in: ids } }).lean();
    return files.map((file) => ({
      id: file._id.toString(),
      path: file.path,
    }));
  }
}
