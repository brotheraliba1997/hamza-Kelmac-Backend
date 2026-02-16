import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BundleOffer } from './schema/bundle-offer.schema';
import { CreateBundleOfferDto } from './dto/create-bundle-offer.dto';
import { UpdateBundleOfferDto } from './dto/update-bundle-offer.dto';
import { sanitizeMongooseDocument } from '../utils/convert-id';

@Injectable()
export class BundleOfferService {
  constructor(
    @InjectModel(BundleOffer.name)
    private readonly bundleOfferModel: Model<BundleOffer>,
  ) {}

  async create(dto: CreateBundleOfferDto) {
    const payload = {
      title: dto.title,
      description: dto.description,
      courses: dto.courses.map((id) => new Types.ObjectId(id)),
      originalPrice: dto.originalPrice,
      bundlePrice: dto.bundlePrice,
      isActive: dto.isActive ?? true,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
    };
    const created = await this.bundleOfferModel.create(payload);
    return this.map(created.toObject());
  }

  async findAll() {
    const items = await this.bundleOfferModel
      .find()
      .populate('courses', 'title slug price')
      .lean();
    return items.map((doc) => this.map(doc));
  }

  async findOne(id: string) {
    const item = await this.bundleOfferModel
      .findById(id)
      .populate('courses', 'title slug price')
      .lean();
    if (!item) {
      throw new NotFoundException(`Bundle offer with id ${id} not found`);
    }
    return this.map(item);
  }

  async update(id: string, dto: UpdateBundleOfferDto) {
    const payload: Record<string, unknown> = {};
    if (dto.title !== undefined) payload.title = dto.title;
    if (dto.description !== undefined) payload.description = dto.description;
    if (dto.courses !== undefined) {
      payload.courses = dto.courses.map((id) => new Types.ObjectId(id));
    }
    if (dto.originalPrice !== undefined)
      payload.originalPrice = dto.originalPrice;
    if (dto.bundlePrice !== undefined) payload.bundlePrice = dto.bundlePrice;
    if (dto.isActive !== undefined) payload.isActive = dto.isActive;
    if (dto.expiresAt !== undefined) {
      payload.expiresAt = dto.expiresAt ? new Date(dto.expiresAt) : null;
    }
    const item = await this.bundleOfferModel
      .findByIdAndUpdate(id, payload, { new: true })
      .populate('courses', 'title slug price')
      .lean();
    if (!item) {
      throw new NotFoundException(`Bundle offer with id ${id} not found`);
    }
    return this.map(item);
  }

  async remove(id: string) {
    const item = await this.bundleOfferModel.findByIdAndDelete(id).lean();
    if (!item) {
      throw new NotFoundException(`Bundle offer with id ${id} not found`);
    }
    return this.map(item);
  }

  private map(raw: any) {
    if (!raw) return undefined;
    const sanitized = sanitizeMongooseDocument(raw) as any;
    return {
      id: sanitized?.id,
      title: sanitized?.title,
      description: sanitized?.description,
      courses: sanitized?.courses,
      originalPrice: sanitized?.originalPrice,
      bundlePrice: sanitized?.bundlePrice,
      isActive: sanitized?.isActive,
      expiresAt: sanitized?.expiresAt,
      createdAt: sanitized?.createdAt,
      updatedAt: sanitized?.updatedAt,
    };
  }
}
