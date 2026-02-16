import {
  HttpStatus,
  Injectable,
  UnprocessableEntityException,
  NotFoundException,
} from '@nestjs/common';
import { FilesService } from '../../files.service';
import { FileType } from '../../domain/file';

@Injectable()
export class FilesS3Service {
  constructor(private readonly filesService: FilesService) {}

  async create(file: Express.MulterS3.File): Promise<{ file: FileType }> {
    if (!file) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          file: 'selectFile',
        },
      });
    }
    const createdFile = await this.filesService.create({
      path: file.key,
    });
    return {
      file: {
        ...createdFile,
        path: `https://s3.sa-east-1.amazonaws.com/kelmac-bucket-latest/${createdFile.path}`,
      },
    };
  }

  async findById(id: string): Promise<{ file: FileType }> {
    const file = await this.filesService.findById(id);

    if (!file) {
      throw new NotFoundException({
        status: HttpStatus.NOT_FOUND,
        errors: {
          file: 'fileNotFound',
        },
      });
    }
    return {
      file: {
        ...file,
        path: `https://s3.sa-east-1.amazonaws.com/kelmac-bucket-latest/${file.path}`,
      },
    };
  }
}
