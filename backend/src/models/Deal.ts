import mongoose, { Schema, Document } from 'mongoose';

export type DealStage = 'Qualification' | 'Discovery' | 'Proposal' | 'Negotiation' | 'Won' | 'Lost';

export interface IDeal extends Document {
  title: string;
  customer: mongoose.Types.ObjectId;
  originalLead?: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId;
  dealValue: number;
  probability: number; // percentage (0 - 100)
  expectedRevenue: number; // computed
  expectedClosingDate?: Date;
  stage: DealStage;
  closedAt?: Date;
  lossReason?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const DealSchema: Schema<IDeal> = new Schema(
  {
    title: { type: String, required: true, trim: true },
    customer: { type: Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
    originalLead: { type: Schema.Types.ObjectId, ref: 'Lead', index: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    dealValue: { type: Number, required: true, min: 0 },
    probability: { type: Number, required: true, min: 0, max: 100, default: 20 },
    expectedRevenue: { type: Number, required: true, min: 0 },
    expectedClosingDate: { type: Date, index: true },
    stage: {
      type: String,
      enum: ['Qualification', 'Discovery', 'Proposal', 'Negotiation', 'Won', 'Lost'],
      default: 'Qualification',
      index: true,
    },
    closedAt: { type: Date },
    lossReason: { type: String, default: '' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

DealSchema.pre('save', function (next) {
  if (this.isModified('dealValue') || this.isModified('probability')) {
    const probDecimal = (this.probability || 0) / 100;
    this.expectedRevenue = Math.round((this.dealValue || 0) * probDecimal * 100) / 100;
  }
  next();
});

DealSchema.index({ title: 'text' });

export const Deal = mongoose.model<IDeal>('Deal', DealSchema);
