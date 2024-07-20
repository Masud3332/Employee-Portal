import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import { User } from '../models/user.model.js';
import { apiResponseErr, apiResponsePagination, apiResponseSuccess } from '../utils/serverError.js';
import mongoose from 'mongoose';
import { Leave } from '../models/leave.model.js';
import { Attendance } from '../models/attendance.model.js';
import { Document } from '../models/document.model.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';

 export const createUser = async (req, res) => {
  const {
    empId,
    firstName,
    lastName,
    userName,
    password,
    phone,
    address,
    dateOfJoining,
    bloodGroup,
    dateOfBirth,
    team,
    designation,
    avatar,
    roles
  } = req.body;

  try {
    const existingUser = await User.findOne({ userName });
    if (existingUser) {
      return res.status(400).send(apiResponseErr(null, false, 400, 'Username already exists'));
    }
    const existingEmpId = await User.findOne({ empId });
    if (existingEmpId) {
      return res.status(400).send(apiResponseErr(null, false, 400, 'Employee ID already exists'));
    }
    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return res.status(400).send(apiResponseErr(null, false, 400, 'Phone number already exists'));
    }

    const cloudinaryResponse = await uploadOnCloudinary(avatar);
    if (!cloudinaryResponse || !cloudinaryResponse.url) {
      return res.status(500).send(apiResponseErr(null, false, 500, 'Failed to upload file to Cloudinary'));
    }

    const passwordSalt = await bcrypt.genSalt();
    const encryptedPassword = await bcrypt.hash(password, passwordSalt);

    const newUser = new User({
      empId,
      firstName,
      lastName,
      userName,
      password: encryptedPassword,
      phone,
      address,
      dateOfJoining,
      bloodGroup,
      dateOfBirth,
      team,
      designation,
      avatar: cloudinaryResponse.url,
      roles
    });

    await newUser.save();
    return res.status(201).send(apiResponseSuccess(newUser, true, 201, 'User created successfully'));
  } catch (error) {
    return res.status(500).send(apiResponseErr(null, false, 500, 'Internal Server Error'));
  }
};

export const loginUser = async (req, res) => {
  try {
    const { userName, password } = req.body;
    const existingUser = await User.findOne({ userName });
    if (!existingUser) {
      throw apiResponseErr(null, false, 400, 'Invalid userName or Password');
    }

    const isPasswordValid = await bcrypt.compare(password, existingUser.password);
    if (!isPasswordValid) {
      throw apiResponseErr(null, false, 400, 'Invalid userName or Password');
    }

    const accessTokenResponse = {
      id: existingUser._id,
      userName: existingUser.userName,
      isEighteen: existingUser.eligibilityCheck,
      UserType: existingUser.userType || 'User',
    };
    const accessToken = jwt.sign(accessTokenResponse, process.env.JWT_SECRET_KEY, {
      expiresIn: '1d',
    });
    return res.status(200).send(
      apiResponseSuccess(
        {
          id: existingUser._id,
          userName: existingUser.userName,
          accessToken: accessToken,
          UserType: existingUser.userType || 'user',
        },
        true,
        200,
        'User login successfully',
      ),
    );
  } catch (error) {
    res
      .status(500)
      .send(apiResponseErr(error.data ?? null, false, error.responseCode ?? 500, error.errMessage ?? error.message));
  }
};

export const getUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(400).send(apiResponseErr(null, false, 400, 'User not found'));
    }

    const leaveData = await Leave.find({ userId: id });
    const attendanceData = await Attendance.find({ userId: id });
    const documentData = await Document.find({ userId: id });

    return res
      .status(200)
      .send(
        apiResponseSuccess(
          { user, leaveData, attendanceData, documentData },
          true,
          200,
          'User and leave data fetched successfully',
        ),
      );
  } catch (error) {
    console.log(error);
    return res.status(500).send(apiResponseErr(null, false, 500, 'Server error'));
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 10;
    const search = req.query.search || '';

    const query = {};

    if (search) {
      query.userName = { $regex: search, $options: 'i' };
    }

    const totalItems = await User.countDocuments(query);
    const totalPages = Math.ceil(totalItems / pageSize);

    const users = await User.find(query)
      .skip((page - 1) * pageSize)
      .limit(pageSize);

    if (!users || users.length === 0) {
      return res.status(400).send(apiResponseErr(null, false, 400, 'No users found'));
    }

    const paginationData = apiResponsePagination(page, totalPages, totalItems);

    return res.status(200).send(apiResponseSuccess(users, true, 200, paginationData));
  } catch (error) {
    return res.status(500).send(apiResponseErr(null, false, 500, 'Internal Server Error'));
  }
};


export const userUpdate = async (req, res) => {
  const { userId } = req.params;
  const {
    empId,
    firstName,
    lastName,
    userName,
    phone,
    address,
    dateOfJoining,
    bloodGroup,
    dateOfBirth,
    team,
    designation,
    avatar,
  } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).send(apiResponseErr(null, false, 400, 'Invalid User ID'));
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).send(apiResponseErr(null, false, 400, 'User Not Found'));
    }

    // Check for uniqueness constraints
    if (userName) {
      const existingUserName = await User.findOne({ userName, _id: { $ne: userId } });
      if (existingUserName) {
        return res.status(400).send(apiResponseErr(null, false, 400, 'Username already exists'));
      }
    }

    if (phone) {
      const existingPhone = await User.findOne({ phone, _id: { $ne: userId } });
      if (existingPhone) {
        return res.status(400).send(apiResponseErr(null, false, 400, 'Phone number already exists'));
      }
    }

    if (empId) {
      const existingEmpId = await User.findOne({ empId, _id: { $ne: userId } });
      if (existingEmpId) {
        return res.status(400).send(apiResponseErr(null, false, 400, 'Employee ID already exists'));
      }
    }

    // Handle avatar upload
    let avatarUrl = user.avatar;
    if (avatar) {
      const cloudinaryResponse = await uploadOnCloudinary(avatar);
      if (!cloudinaryResponse || !cloudinaryResponse.url) {
        return res.status(500).send(apiResponseErr(null, false, 500, 'Failed to upload file to Cloudinary'));
      }
      avatarUrl = cloudinaryResponse.url;
    }

    // Update fields
    if (empId !== undefined) user.empId = empId;
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (userName !== undefined) user.userName = userName;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;
    if (dateOfJoining !== undefined) user.dateOfJoining = dateOfJoining;
    if (bloodGroup !== undefined) user.bloodGroup = bloodGroup;
    if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth;
    if (team !== undefined) user.team = team;
    if (designation !== undefined) user.designation = designation;
    if (avatarUrl !== user.avatar) user.avatar = avatarUrl;

    const updatedUser = await user.save();
    return res.status(200).send(apiResponseSuccess(updatedUser, true, 200, 'User updated successfully'));
  } catch (error) {
    return res.status(500).send(apiResponseErr(null, false, 500, 'Internal Server Error'));
  }
};


export const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).send(apiResponseErr(null, false, 404, 'User not found'));
    }

    const userDeleted = await User.findByIdAndDelete(id);
    const leaveDeleteResult = await Leave.deleteMany({ userId: id });
    const attendanceDeleteResult = await Attendance.deleteMany({ userId: id });
    const documentDeleteResult = await Document.deleteMany({ userId: id });

    return res.status(200).send(
      apiResponseSuccess(
        {
          userDeleted,
          leaveDeleteResult,
          attendanceDeleteResult,
          documentDeleteResult,
        },
        true,
        200,
        'User and associated data deleted successfully',
      ),
    );
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).send(apiResponseErr(null, false, 500, 'Internal Server Error: Unable to delete user and associated data'));
  }
};

export const userPasswordReset = async (req, res) => {
  try {
    const { userId, oldPassword, password, confirmPassword } = req.body;
    if (!userId) {
      throw apiResponseErr(null, false, 400, 'userId Not Found');
    }
    if (!oldPassword || !password || !confirmPassword) {
      throw apiResponseErr(null, false, 400, 'All Fields are Required');
    }
    const existingUser = await User.findById(userId);
    if (password !== confirmPassword) {
      throw apiResponseErr(null, false, 400, 'New password and confirm password do not match');
    }
    if (!existingUser) {
      throw apiResponseErr(null, false, 400, 'User Not Found');
    }

    const oldPasswordIsCorrect = await bcrypt.compare(oldPassword, existingUser.password);
    if (!oldPasswordIsCorrect) {
      throw apiResponseErr(null, false, 400, 'Invalid old password');
    }

    const passwordSalt = await bcrypt.genSalt();
    const encryptedPassword = await bcrypt.hash(password, passwordSalt);
    existingUser.password = encryptedPassword;
    await existingUser.save();
    res.status(200).send(apiResponseSuccess(null, true, 200, 'Password Reset Successfully'));
  } catch (error) {
    res.status(500).send(apiResponseErr(error.data ?? null, false, error.responseCode ?? 500, error.errMessage ?? error.message));
  }
};
