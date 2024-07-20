import mongoose from 'mongoose';
import 'dotenv/config';
import { Attendance } from '../models/attendance.model.js';
import { apiResponseErr, apiResponsePagination, apiResponseSuccess } from '../utils/serverError.js';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../models/user.model.js';

export const attendanceCreate = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).send(apiResponseErr(null, false, 400, 'User not found'));
    }

    const { date, entryTime, exitTime, status } = req.body;

    if (!date) {
      return res.status(400).send(apiResponseErr(null, false, 400, 'Date is required'));
    }

    if (entryTime && exitTime) {
      return res.status(400).send(apiResponseErr(null, false, 400, 'Only one of Entry Time or Exit Time can be provided'));
    }

    if (!entryTime && !exitTime) {
      return res.status(400).send(apiResponseErr(null, false, 400, 'Either Entry Time or Exit Time is required'));
    }

    let attendance = await Attendance.findOne({ userId, date });

    if (!attendance) {
      if (entryTime) {
        const entryId = uuidv4();
        attendance = new Attendance({
          entryId,
          userId,
          userName: user.userName,
          date,
          entryTime,
          status,
        });
      } else {
        return res.status(400).send(apiResponseErr(null, false, 400, 'No existing entry found for this date to add exit time'));
      }
    } else {
      if (entryTime) {
        return res.status(400).send(apiResponseErr(null, false, 400, 'Attendance record for this date already exists with entry time'));
      } else {
        attendance.exitTime = exitTime;
        if (status) {
          attendance.status = status;
        }
      }
    }

    await attendance.save();
    return res.status(201).send(apiResponseSuccess(attendance, true, 201, 'Attendance record created or updated successfully'));
  } catch (error) {
    return res.status(500).send(apiResponseErr(null, false, 500, error.message));
  }
};

export const getAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const attendance = await Attendance.findById(id);

    if (!attendance) {
      return res.status(404).send(apiResponseErr(null, false, 404, 'Attendance record not found'));
    }

    return res
      .status(200)
      .send(apiResponseSuccess(attendance, true, 200, 'Attendance record retrieved successfully for Id'));
  } catch (error) {
    return res.status(500).send(apiResponseErr(null, false, 500, 'Internal Server Error'));
  }
};

export const getAllAttendance = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const query = {};
    if (search) {
      query.userName = { $regex: search, $options: 'i' }; 
    }

    const totalItems = await Attendance.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limit);

    const attendances = await Attendance.find(query)
      .populate('userId', 'userName')
      .skip(skip)
      .limit(limit);

    const groupedAttendances = {};

    attendances.forEach(data => {
      const user = data.userId || { _id: null, userName: null };
      const userId = user._id;
      const userName = user.userName;

      if (!groupedAttendances[userId]) {
        groupedAttendances[userId] = {
          _id: userId,
          userId: userId,
          userName: userName,
          attendanceDetails: [],
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        };
      }

      groupedAttendances[userId].attendanceDetails.push({
        entryId: data.entryId,
        date: data.date,
        entryTime: data.entryTime,
        exitTime: data.exitTime,
        status: data.status,
      });
    });

    const transformedAttendances = Object.values(groupedAttendances);
    const pagination = apiResponsePagination(page, totalPages, totalItems);

    return res
      .status(200)
      .send(apiResponseSuccess(transformedAttendances, true, 200, 'Attendance records retrieved successfully', pagination));
  } catch (error) {
    console.error(`Error fetching attendance records: ${error}`);
    return res.status(500).send(apiResponseErr(null, false, 500, 'Internal Server Error'));
  }
};


export const updateAttendance = async (req, res) => {
  try {
    const { entryId } = req.params;
    const { date, entryTime, exitTime, status } = req.body;

    if (!date || !entryTime || !exitTime || !status) {
      return res
        .status(400)
        .send(apiResponseErr(null, false, 400, 'Date, entryTime, exitTime, and status are required fields'));
    }

    const updates = { date, entryTime, exitTime, status };

    const attendance = await Attendance.findOneAndUpdate({ entryId }, updates, {
      new: true,
    });

    if (!attendance) {
      return res
        .status(404)
        .send(apiResponseErr(null, false, 404, 'Attendance record not found for the provided entryId'));
    }
    return res.status(200).send(apiResponseSuccess(attendance, true, 200, 'Attendance record updated successfully'));
  } catch (error) {
    return res.status(500).send(apiResponseErr(null, false, 500, 'Internal Server Error'));
  }
};

export const deleteAttendance = async (req, res) => {
  try {
    const { entryId } = req.params;
    const deletedAttendance = await Attendance.findOneAndDelete({ entryId });

    if (!deletedAttendance) {
      return res
        .status(404)
        .send(apiResponseErr(null, false, 404, 'Attendance record not found for the provided entryId'));
    }
    return res
      .status(200)
      .send(apiResponseSuccess(deletedAttendance, true, 200, 'Attendance record deleted successfully'));
  } catch (error) {
    return res.status(500).send(apiResponseErr(null, false, 500, 'Internal Server Error'));
  }
};

export const getUserAttendanceRecord = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).send(apiResponseErr(null, false, 400, 'Invalid userId'));
    }
    const attendances = await Attendance.find({ userId }).populate('userId', 'userName');

    if (attendances.length === 0) {
      return res.status(404).send(apiResponseErr(null, false, 404, 'No attendance records found for this user'));
    }
    const transformedAttendances = attendances.map((data) => ({
      _id: data._id,
      userId: data.userId._id,
      userName: data.userId.userName,
      date: data.date,
      entryTime: data.entryTime,
      exitTime: data.exitTime,
      status: data.status,
      // createdAt: data.createdAt,
      // updatedAt: data.updatedAt,
    }));

    return res
      .status(200)
      .send(
        apiResponseSuccess(transformedAttendances, true, 200, 'Attendance records retrieved successfully for user'),
      );
  } catch (error) {
    return res.status(500).send(apiResponseErr(null, false, 500, 'Internal Server Error'));
  }
};

export const getAttendanceRecordsByDate = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).send(apiResponseErr(null, false, 400, 'Date parameter is required'));
    }
    const attendanceRecords = await Attendance.find({ date });
    if (attendanceRecords.length === 0) {
      return res
        .status(404)
        .send(apiResponseErr(null, false, 404, 'No attendance records found for the provided date'));
    }
    return res
      .status(200)
      .send(apiResponseSuccess(attendanceRecords, true, 200, 'Attendance records retrieved successfully by date'));
  } catch (error) {
    return res.status(500).send(apiResponseErr(null, false, 500, 'Internal server error'));
  }
};

export const getAttendanceRecordsByStatus = async (req, res) => {
  try {
    const { status } = req.params;

    if (!['Present', 'Absent', 'On Leave'].includes(status)) {
      return res.status(400).send(apiResponseErr(null, false, 400, 'Invalid status value'));
    }

    const attendances = await Attendance.find({ status });

    if (attendances.length === 0) {
      return res.status(404).send(apiResponseErr(null, false, 404, 'No attendance records found for this status'));
    }

    return res
      .status(200)
      .send(apiResponseSuccess(attendances, true, 200, 'Attendance records retrieved successfully'));
  } catch (error) {
    return res.status(500).send(apiResponseErr(null, false, 500, 'Internal Server Error'));
  }
};
