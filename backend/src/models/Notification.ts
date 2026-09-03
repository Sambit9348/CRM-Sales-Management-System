import mongoose, { Schema, Document } from 'mongoose';

export type NotificationType = 'ASSIGNMENT' | 'CONVERSION' | 'DEAL_STAGE' | 'ACTIVITY_DUE' | 'SYSTEM';

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId;
  sender?: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema: Schema<INotification> = new Schema(
  {
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User' },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['ASSIGNMENT', 'CONVERSION', 'DEAL_STAGE', 'ACTIVITY_DUE', 'SYSTEM'],
      default: 'SYSTEM',
    },
    link: { type: String, default: '' },
    isRead: { type: Boolean, default: false, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
