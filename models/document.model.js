import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userName: {
      type: String,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['AadharCard', '10th_Marksheet', '12th_Marksheet', 'Graduation_Marksheet', 'Joining_Letter'],
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    uploadDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

export const Document = mongoose.model('Document', documentSchema);
