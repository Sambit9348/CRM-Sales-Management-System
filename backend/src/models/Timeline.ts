import mongoose, { Schema, Document } from 'mongoose';

export type EntityType = 'LEAD' | 'CUSTOMER' | 'DEAL';
export type EventType =
  | 'CREATED'
  | 'UPDATED'
  | 'ASSIGNED'
  | 'REASSIGNED'
  | 'STATUS_CHANGED'
  | 'PRIORITY_CHANGED'
  | 'NOTE_ADDED'
  | 'CONVERTED'
  | 'DEAL_STAGE_CHANGED'
  | 'DEAL_CLOSED'
  | 'ACTIVITY_ADDED'
  | 'ACTIVITY_COMPLETED';

export interface ITimeline extends Document {
  entityType: EntityType;
  entityId: mongoose.Types.ObjectId;
  eventType: EventType;
  title: string;
  description: string;
  metadata?: Record<string, any>;
  performedBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const TimelineSchema: Schema<ITimeline> = new Schema(
  {
    entityType: {
      type: String,
      enum: ['LEAD', 'CUSTOMER', 'DEAL'],
      required: true,
      index: true,
    },
    entityId: { type: Schema.Types.ObjectId, required: true, index: true },
    eventType: {
      type: String,
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed },
    performedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Timeline = mongoose.model<ITimeline>('Timeline', TimelineSchema);
