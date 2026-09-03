import mongoose from 'mongoose';
import { Timeline, EntityType, EventType } from '../models/Timeline';

export const logTimelineEvent = async (params: {
  entityType: EntityType;
  entityId: mongoose.Types.ObjectId | string;
  eventType: EventType;
  title: string;
  description: string;
  performedBy: mongoose.Types.ObjectId | string;
  metadata?: Record<string, any>;
}) => {
  try {
    await Timeline.create({
      entityType: params.entityType,
      entityId: params.entityId,
      eventType: params.eventType,
      title: params.title,
      description: params.description,
      performedBy: params.performedBy,
      metadata: params.metadata || {},
    });
  } catch (err) {
    console.error('Failed to log timeline event:', err);
  }
};
