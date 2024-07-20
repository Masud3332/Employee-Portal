import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import 'dotenv/config';
const adminSchema = new mongoose.Schema(
  {
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
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    roles: [
      {
        type: String,
        required: true,
        default: 'Admin',
      },
    ],
  },
  { timestamps: true },
);

adminSchema.pre('save', async function (next) {
  if (this.isModified('password') || this.isNew) {
    try {
      const salt = await bcrypt.genSalt();
      this.password = await bcrypt.hash(this.password, salt);
    } catch (err) {
      return next(err);
    }
  }
  next();
});

adminSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

// Method to generate JWT access token
adminSchema.methods.generateAccessToken = function () {
  const accessTokenResponse = {
    id: this._id,
    userName: this.userName,
    UserType: this.userType || 'Admin',
  };

  return jwt.sign(accessTokenResponse, process.env.JWT_SECRET_KEY, {
    expiresIn: '1d',
  });
};

export const Admin = mongoose.model('Admin', adminSchema);
