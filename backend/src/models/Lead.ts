import mongoose, { Schema, Document } from 'mongoose';

export type LeadSource = 'Website' | 'Referral' | 'Social Media' | 'Email' | 'Phone';
export type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'UNQUALIFIED' | 'LOST';
export type LeadPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface INote {
  _id?: mongoose.Types.ObjectId;
  text: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

export interface ILead extends Document {
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  company: string;
  source: LeadSource;
  status: LeadStatus;
  priority: LeadPriority;
  assignedTo?: mongoose.Types.ObjectId;
  notes: INote[];
  isConverted: boolean;
  convertedCustomerId?: mongoose.Types.ObjectId;
  convertedDealId?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const NoteSchema = new Schema(
  {
    text: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const LeadSchema: Schema<ILead> = new Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    phone: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true, index: true },
    source: {
      type: String,
      enum: ['Website', 'Referral', 'Social Media', 'Email', 'Phone'],
      default: 'Website',
      index: true,
    },
    status: {
      type: String,
      enum: ['NEW', 'CONTACTED', 'QUALIFIED', 'UNQUALIFIED', 'LOST'],
      default: 'NEW',
      index: true,
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH'],
      default: 'MEDIUM',
      index: true,
    },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    notes: [NoteSchema],
    isConverted: { type: Boolean, default: false, index: true },
    convertedCustomerId: { type: Schema.Types.ObjectId, ref: 'Customer' },
    convertedDealId: { type: Schema.Types.ObjectId, ref: 'Deal' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

LeadSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`.trim();
});

LeadSchema.set('toJSON', { virtuals: true });
LeadSchema.set('toObject', { virtuals: true });

LeadSchema.index({ firstName: 'text', lastName: 'text', email: 'text', company: 'text' });

export const Lead = mongoose.model<ILead>('Lead', LeadSchema);
