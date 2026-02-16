// users.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schema/User/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private model: Model<UserDocument>) {}

  async create(dto: CreateUserDto) {
    return new this.model(dto).save();
  }

  async findAll() {
    return this.model.find().lean();
  }

  async findOne(id: string) {
    return this.model.findById(id).lean();
  }

  async update(id: string, dto: UpdateUserDto) {
    return this.model.findByIdAndUpdate(id, dto, { new: true }).lean();
  }

  async remove(id: string) {
    return this.model.findByIdAndDelete(id);
  }
}
