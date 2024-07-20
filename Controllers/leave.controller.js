import mongoose from 'mongoose';
import 'dotenv/config';
import { Leave } from '../models/leave.model.js';
import { apiResponseErr, apiResponsePagination, apiResponseSuccess } from '../utils/serverError.js';
import { User } from '../models/user.model.js';

export const createUserLeave = async (req, res) => {
  const { userId } = req.params;
  const { leaveType, totalDay, startDate, endDate, reason, status, role } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send(apiResponseErr(null, false, 404, 'User not found'));
    }

    const newUserLeave = new Leave({
      userId,
      userName: user.userName,
      leaveType,
      totalDay,
      startDate,
      endDate,
      reason,
      status,
      role,
    });

    const savedLeave = await newUserLeave.save();

    return res.status(201).send(apiResponseSuccess(savedLeave, true, 201, 'Leave request created successfully'));
  } catch (error) {
    res
      .status(500)
      .send(apiResponseErr(error.data ?? null, false, error.responseCode ?? 500, error.errMessage ?? error.message));
  }
};

export const getAllLeaveRequests = async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 10;
    const status = req.query.status;

    const statusFilter = {};
    if (status) {
      if (!['Pending', 'Approved', 'Rejected'].includes(status)) {
        return res.status(400).send(apiResponseErr(null, false, 400, 'Invalid status parameter'));
      }
      statusFilter.status = status;
    }

    const leaveRequests = await Leave.find({ ...statusFilter, leaveType: { $exists: true } });

    if (leaveRequests.length === 0) {
      return res.status(404).send(apiResponseErr(null, false, 404, 'No leave requests found'));
    }

    const totalItems = leaveRequests.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const paginatedLeaveRequests = leaveRequests.slice((page - 1) * pageSize, page * pageSize);
    const paginationData = apiResponsePagination(page, totalPages, totalItems);

    return res
      .status(200)
      .send(
        apiResponseSuccess(paginatedLeaveRequests, true, 200, 'Leave requests retrieved successfully', paginationData),
      );
  } catch (error) {
    return res.status(500).send(apiResponseErr(null, false, 500, error.message));
  }
};


export const getLeaveRequestById = async (req, res) => {
  const { id } = req.params;

  try {
    const leaveRequest = await Leave.findById(id);
    if (!leaveRequest) {
      return res.status(404).send(apiResponseErr(null, false, 404, 'Leave request not found'));
    }

    return res.status(200).send(apiResponseSuccess(leaveRequest, true, 200, 'Leave request retrieved successfully'));
  } catch (error) {
    return res.status(500).send(apiResponseErr(null, false, 500, error.message));
  }
};

export const updateLeaveRequest = async (req, res) => {
  const { id } = req.params;
  const { leaveType, totalDay, startDate, endDate, reason } = req.body;

  try {
    const leaveRequest = await Leave.findById(id);
    if (!leaveRequest) {
      return res.status(404).send(apiResponseErr(null, false, 404, 'Leave request not found'));
    }
    if (leaveType) leaveRequest.leaveType = leaveType;
    if (totalDay) leaveRequest.totalDay = totalDay;
    if (startDate) leaveRequest.startDate = startDate;
    if (endDate) leaveRequest.endDate = endDate;
    if (reason) leaveRequest.reason = reason;

    await leaveRequest.save();

    return res.status(200).send(apiResponseSuccess(leaveRequest, true, 200, 'Leave request updated successfully'));
  } catch (error) {
    return res.status(500).send(apiResponseErr(null, false, 500, error.message));
  }
};

export const deleteLeaveRequestById = async (req, res) => {
  const { id } = req.params;

  try {
    const leaveRequest = await Leave.findByIdAndDelete(id);
    if (!leaveRequest) {
      return res.status(404).send(apiResponseErr(null, false, 404, 'Leave request not found'));
    }

    return res.status(200).send(apiResponseSuccess(leaveRequest, true, 200, 'Leave request deleted successfully'));
  } catch (error) {
    return res.status(500).send(apiResponseErr(null, false, 500, error.message));
  }
};

export const updateLeaveStatus = async (req, res) => {
  const { leaveId } = req.params;
  const { status, approvedBy } = req.body; 

  try {
    const leaveRequest = await Leave.findById(leaveId);
    if (!leaveRequest) {
      return res.status(404).send(apiResponseErr(null, false, 404, 'Leave request not found'));
    }

    leaveRequest.status = status;
    if (status === 'Approved') {
      leaveRequest.approvedBy = approvedBy;
    }
    await leaveRequest.save();

    // Fetch the updated leave request to ensure it is properly updated
    const updatedLeaveRequest = await Leave.findById(leaveId).populate('approvedBy');

    return res.status(200).send(apiResponseSuccess(updatedLeaveRequest, true, 200, 'Leave request updated successfully'));
  } catch (error) {
    return res.status(500).send(apiResponseErr(null, false, 500, `Internal Server Error: ${error.message}`));
  }
};

export const userLeave = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).send(apiResponseErr(null, false, 400, 'Invalid user ID format.'));
    }
    const leaveCount = await Leave.countDocuments({ userId });

    if (leaveCount === 0) {
      return res
        .status(200)
        .send(apiResponseSuccess(leaveCount, true, 200, `No leave applications found for user with ID ${userId}`));
    }
    const leaves = await Leave.find({ userId });
    return res
      .status(200)
      .send(
        apiResponseSuccess(leaves, true, 200, `Found ${leaveCount} leave applications for user with ID ${userId}`),
      );
  } catch (error) {
    return res.status(500).send(apiResponseErr(null, false, 500, error.message));
  }
};

