import mongoose from 'mongoose';
import 'dotenv/config';
const userSchema = new mongoose.Schema(
  {
    empId: {
      type: String,
      required: true,
      unique: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    phone: {
      type: Number,
      required: true,
      minlength: 10,
      maxLength: 13,
      unique: true,
    },
    address: {
      type: String,
      required: true, 
      minLength: 10,
      maxLength: 80,
    },
    dateOfJoining: {
      type: Date,
      required: true,
    },
    bloodGroup: {
      type: String,
      required: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    team: {
      type: String,
      required: true,
    },
    designation: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
    },
    roles: [
      {
        type: String,
        enum: ['User', 'Admin'],
        default: 'User',
        required: true,
      },
    ],
  },
  { timestamps: true },
);

export const User = mongoose.model('User', userSchema);
