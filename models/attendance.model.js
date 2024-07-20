import mongoose from 'mongoose';
import 'dotenv/config';

const userAttendanceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    entryId: {
      type: String,
    },
    userName: {
      type: String,
      ref: 'User',
      required: true,
    },
    date: {
      type: String,
      required: true,
    },

    entryTime: {
      type: String,
      required: true,
    },
    exitTime: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      enum: ['Present', 'Absent', 'On Leave', 'Holiday'],
      default: 'Present',
    },
  },
  { timestamps: true },
);

export const Attendance = mongoose.model('Attendance', userAttendanceSchema);
