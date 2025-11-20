import {
  Controller,
  Get,
  Param,
  Post,
  Response,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiExcludeEndpoint,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { FilesLocalService } from './files.service';
import { FileResponseDto } from './dto/file-response.dto';
import * as fs from 'fs';
import * as path from 'path';

@ApiTags('Files')
@Controller({
  path: 'files',
  version: '1',
})
export class FilesLocalController {
  constructor(private readonly filesService: FilesLocalService) {}

  @ApiCreatedResponse({
    type: FileResponseDto,
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      dest: '/tmp', // ✅ Use /tmp (only writable directory in serverless)
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<FileResponseDto> {
    return this.filesService.create(file);
  }

  @Get(':path')
  @ApiExcludeEndpoint()
  download(@Param('path') pathParam: string, @Response() response) {
    const filePath = path.join('/tmp', pathParam); // ✅ point to /tmp
    if (!fs.existsSync(filePath)) {
      return response.status(404).send('File not found');
    }
    return response.sendFile(filePath);
  }
}
