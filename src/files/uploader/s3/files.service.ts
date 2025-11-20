import {
  HttpStatus,
  Injectable,
  UnprocessableEntityException,
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

    return {
      file: await this.filesService.create({
        path: file.key,
      }),
    };
  }
}
