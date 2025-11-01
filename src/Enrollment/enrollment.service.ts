﻿import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { Enrollment } from './interfaces/enrollment.interface';
import { EnrollmentSchemaClass } from '../Enrollment/infrastructure/enrollments.schema';

@Injectable()
export class EnrollmentService {
  constructor(
    @InjectModel(EnrollmentSchemaClass.name)
    private readonly enrollmentModel: Model<EnrollmentSchemaClass>,
  ) {}

  private map(doc: any): Enrollment {
    if (!doc) return undefined as any;
    const id = typeof doc.id !== 'undefined' ? doc.id : doc._id?.toString?.();
    return {
      id,
      user: (doc.user as any)?.toString?.() ?? doc.user,
      course: (doc.course as any)?.toString?.() ?? doc.course,
      payment: doc.payment
        ? ((doc.payment as any)?.toString?.() ?? doc.payment)
        : undefined,
      offer: doc.offer
        ? ((doc.offer as any)?.toString?.() ?? doc.offer)
        : undefined,
      progress: doc.progress,
      status: doc.status,
      completionDate: doc.completionDate ?? undefined,
      certificate: doc.certificate
        ? ((doc.certificate as any)?.toString?.() ?? doc.certificate)
        : undefined,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      deletedAt: doc.deletedAt ?? undefined,
    } as Enrollment;
  }

  async create(createEnrollmentDto: CreateEnrollmentDto): Promise<Enrollment> {
    const toCreate = {
      ...createEnrollmentDto,
      progress: createEnrollmentDto.progress ?? 0,
      status: createEnrollmentDto.status ?? 'active',
    };
    const created = await this.enrollmentModel.create(toCreate as any);
    return this.map(created);
  }

  async findAll(): Promise<Enrollment[]> {
    const docs = await this.enrollmentModel.find().lean();
    return docs.map((d: any) => this.map(d));
  }

  async findOne(id: string): Promise<Enrollment | undefined> {
    const doc = await this.enrollmentModel.findById(id).lean();
    return doc ? this.map(doc) : undefined;
  }

  async update(
    id: string,
    updateData: Partial<CreateEnrollmentDto>,
  ): Promise<Enrollment | undefined> {
    const doc = await this.enrollmentModel
      .findByIdAndUpdate(id, { ...updateData }, { new: true })
      .lean();
    return doc ? this.map(doc) : undefined;
  }

  async remove(id: string): Promise<boolean> {
    const res = await this.enrollmentModel.deleteOne({ _id: id });
    return (res as any).deletedCount > 0;
  }
}
