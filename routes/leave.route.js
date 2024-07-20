import express from 'express';
import { Authorize } from '../middleware/auth.js';
import {
  createUserLeave,
  deleteLeaveRequestById,
  getAllLeaveRequests,
  getLeaveRequestById,
  updateLeaveRequest,
  updateLeaveStatus,
  userLeave,
} from '../controllers/leave.controller.js';
import customErrorHandler from '../middleware/customErrorHandler.js';
import { validateLeaveRequestId, validateUpdateLeaveRequest, validateUpdateLeaveStatus, validateUserId, validateUserLeave } from '../schema/commonSchema.js';


export const LeaveRoute = express();
LeaveRoute.post('/user/createLeaves/:userId',validateUserLeave,customErrorHandler, createUserLeave);
LeaveRoute.get('/user/leaveRequest/:id',validateLeaveRequestId,customErrorHandler, getLeaveRequestById);
LeaveRoute.get('/user/getAllLeaveRequests', Authorize(['Admin']),validateLeaveRequestId,customErrorHandler, getAllLeaveRequests);
LeaveRoute.get('/user/getAllLeaveRequests', Authorize(['Admin']),validateLeaveRequestId,customErrorHandler, getAllLeaveRequests);
LeaveRoute.get('/user/getAllLeaveRequests', Authorize(['Admin']),validateLeaveRequestId,customErrorHandler, getAllLeaveRequests);
LeaveRoute.put('/user/updateLeaveRequest/:id', Authorize(['Admin']),validateUpdateLeaveRequest,customErrorHandler,updateLeaveRequest);
LeaveRoute.delete('/user/deleteLeaveRequest/:id',Authorize(['Admin']),validateLeaveRequestId,customErrorHandler, deleteLeaveRequestById);
LeaveRoute.put('/user/leaveStatus/:leaveId', Authorize(['Admin']),validateUpdateLeaveStatus,customErrorHandler, updateLeaveStatus);
LeaveRoute.get('/leaves/:userId',validateUserId,customErrorHandler, userLeave);

