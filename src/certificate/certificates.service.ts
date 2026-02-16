// certificates.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Certificate,
  CertificateDocument,
} from '../schema/Certificate/certificate.schema';
import { CreateCertificateDto } from './dto/create-certificate.dto';
import { UpdateCertificateDto } from './dto/update-certificate.dto';
@Injectable()
export class CertificatesService {
  constructor(
    @InjectModel(Certificate.name) private model: Model<CertificateDocument>,
  ) {}

  async create(dto: CreateCertificateDto) {
    const certificate = new this.model(dto);
    return certificate.save();
  }

  async findAll() {
    return this.model
      .find()
      .populate('user', 'name email')
      .populate('course', 'title')
      .lean();
  }

  async findOne(id: string) {
    return this.model
      .findById(id)
      .populate('user', 'name email')
      .populate('course', 'title')
      .lean();
  }

  async update(id: string, dto: UpdateCertificateDto) {
    return this.model.findByIdAndUpdate(id, dto, { new: true }).lean();
  }

  async remove(id: string) {
    return this.model.findByIdAndDelete(id);
  }
}
