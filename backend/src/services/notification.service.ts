import mongoose from 'mongoose';
import { Notification, NotificationType } from '../models/Notification';

export const createNotification = async (params: {
  recipient: mongoose.Types.ObjectId | string;
  sender?: mongoose.Types.ObjectId | string;
  title: string;
  message: string;
  type?: NotificationType;
  link?: string;
}) => {
  try {
    await Notification.create({
      recipient: params.recipient,
      sender: params.sender,
      title: params.title,
      message: params.message,
      type: params.type || 'SYSTEM',
      link: params.link || '',
    });
  } catch (err) {
    console.error('Failed to create notification:', err);
  }
};
