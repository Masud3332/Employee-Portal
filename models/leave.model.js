import mongoose from 'mongoose';
import 'dotenv/config';

const userLeaveSchema = new mongoose.Schema(
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
    leaveType: {
      type: String,
      required: true,
    },
    totalDay: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    requestDate: {
      type: Date,
      default: Date.now,
      required: true,
    },
    status: {
      type: String,
      default: 'Pending',
      enum: ['Pending', 'Approved', 'Rejected'],
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: function () {
        return this.status === 'Approved';
      },
    },
  },
  { timestamps: true },
);

export const Leave = mongoose.model('Leave', userLeaveSchema);
