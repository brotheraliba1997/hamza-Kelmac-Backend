import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { UserSchemaClass } from '../../users/schema/user.schema';

export type NotificationDocument = Notification & Document;

@Schema({ timestamps: true })
export class Notification {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  message: string;

  @Prop({ required: true })
  type: string;

  @Prop({
    type: [Types.ObjectId],
    ref: UserSchemaClass.name,
    required: true,
    index: true,
  })
  receiverIds: Types.ObjectId[];

  @Prop({
    type: [Types.ObjectId],
    ref: UserSchemaClass.name,
  })
  readByIds: Types.ObjectId[];

  @Prop({ type: Object, default: {} })
  meta: Record<string, any>;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
