import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { NotificationGateway } from './notification.gateway';
import {
  Notification,
  NotificationDocument,
} from './schema/notification.schema';
import { CreateNotificationDto } from './dto/notification.dto';
import {
  sanitizeMongooseDocument,
  convertIdToString,
} from '../utils/convert-id';

@Injectable()
export class NotificationService {
  constructor(
    private readonly gateway: NotificationGateway,
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
  ) {}

  private map(doc: any): any {
    if (!doc) return undefined as any;

    const sanitized = sanitizeMongooseDocument(doc);
    if (!sanitized) return undefined as any;
    return {
      id: sanitized.id || convertIdToString(doc),
      title: sanitized.title,
      message: sanitized.message,
      type: sanitized.type,
      receiverIds: sanitized.receiverIds,
      meta: sanitized.meta,
      isRead: sanitized.isRead,
      createdAt: sanitized.createdAt,
      updatedAt: sanitized.updatedAt,
    } as any;
  }

  async create(dto: CreateNotificationDto) {
    const receiverIds = dto.receiverIds.map((id) => new Types.ObjectId(id));

    const notification = await this.notificationModel.create({
      title: dto.title,
      message: dto.message,
      type: dto.type,
      receiverIds,
      meta: dto.meta || {},
    });

    // Emit notification to all receivers via WebSocket
    const populated = await this.notificationModel
      .findById(notification._id)
      .populate('receiverIds')
      .lean();

    const populatedAny = populated as any;

    receiverIds.forEach((receiverId) => {
      this.gateway.server.emit(`notification:${receiverId.toString()}`, {
        id: populatedAny._id.toString(),
        title: populatedAny.title,
        message: populatedAny.message,
        type: populatedAny.type,
        isRead: populatedAny.isRead,
        createdAt: populatedAny.createdAt,
      });
    });

    return this.map(populated);
  }

  async findAll() {
    const notifications = await this.notificationModel
      .find()
      .populate('receiverIds')
      .sort({ createdAt: -1 })
      .lean();
    return notifications.map((notification) => this.map(notification));
  }

  async findAllForUser(userId: string) {
    const notifications = await this.notificationModel
      .find({ receiverIds: new Types.ObjectId(userId) })
      .populate('receiverIds')
      .sort({ createdAt: -1 })
      .lean();
    return notifications.map((notification) => this.map(notification));
  }

  async findOne(id: string) {
    const notification = await this.notificationModel
      .findById(id)
      .populate('receiverIds')
      .lean();

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return this.map(notification);
  }

  async markAsRead(notificationId: string, userId: string) {
    const notification = await this.notificationModel.findById(notificationId);

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    // Check if user is a receiver
    const isReceiver = notification.receiverIds.some(
      (id) => id.toString() === userId,
    );

    if (!isReceiver) {
      throw new NotFoundException(
        'You are not authorized to mark this notification as read',
      );
    }

    const updated = await this.notificationModel
      .findByIdAndUpdate(notificationId, { isRead: true }, { new: true })
      .populate('receiverIds')
      .lean();

    return this.map(updated);
  }

  async markAllAsRead(userId: string) {
    const result = await this.notificationModel.updateMany(
      {
        receiverIds: new Types.ObjectId(userId),
        isRead: false,
      },
      { isRead: true },
    );

    return {
      message: 'All notifications marked as read',
      modifiedCount: result.modifiedCount,
    };
  }

  async remove(id: string, userId: string) {
    const notification = await this.notificationModel.findById(id);

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    // Check if user is a receiver
    const isReceiver = notification.receiverIds.some(
      (id) => id.toString() === userId,
    );

    if (!isReceiver) {
      throw new NotFoundException(
        'You are not authorized to delete this notification',
      );
    }

    await this.notificationModel.findByIdAndDelete(id);
    return { message: 'Notification deleted successfully' };
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationModel.countDocuments({
      receiverIds: new Types.ObjectId(userId),
      isRead: false,
    });
  }

  sendWelcome(data: any) {
    this.gateway.server.emit('welcome', data);
  }
}
