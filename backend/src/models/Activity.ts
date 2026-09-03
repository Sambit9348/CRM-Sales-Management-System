import mongoose, { Schema, Document } from 'mongoose';

export type ActivityType = 'CALL' | 'EMAIL' | 'MEETING' | 'DEMO' | 'REMINDER';
export type ActivityStatus = 'PENDING' | 'COMPLETED' | 'OVERDUE';

export interface IActivity extends Document {
  type: ActivityType;
  title: string;
  description?: string;
  relatedLead?: mongoose.Types.ObjectId;
  relatedCustomer?: mongoose.Types.ObjectId;
  relatedDeal?: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId;
  dueDate: Date;
  status: ActivityStatus;
  completedAt?: Date;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ActivitySchema: Schema<IActivity> = new Schema(
  {
    type: {
      type: String,
      enum: ['CALL', 'EMAIL', 'MEETING', 'DEMO', 'REMINDER'],
      required: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    relatedLead: { type: Schema.Types.ObjectId, ref: 'Lead', index: true },
    relatedCustomer: { type: Schema.Types.ObjectId, ref: 'Customer', index: true },
    relatedDeal: { type: Schema.Types.ObjectId, ref: 'Deal', index: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    dueDate: { type: Date, required: true, index: true },
    status: {
      type: String,
      enum: ['PENDING', 'COMPLETED', 'OVERDUE'],
      default: 'PENDING',
      index: true,
    },
    completedAt: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

ActivitySchema.index({ title: 'text' });

export const Activity = mongoose.model<IActivity>('Activity', ActivitySchema);
