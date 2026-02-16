import {
  // common
  Module,
} from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { FilesModule } from '../files/files.module';
import { UserSchema, UserSchemaClass } from './schema/user.schema';

@Module({
  imports: [
    // import modules, etc.
    MongooseModule.forFeature([
      { name: UserSchemaClass.name, schema: UserSchema },
    ]),
    FilesModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
