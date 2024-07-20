import express from "express";
import {
  attendanceCreate,
  deleteAttendance,
  getAllAttendance,
  getAttendance,
  getAttendanceRecordsByDate,
  getAttendanceRecordsByStatus,
  getUserAttendanceRecord,
  updateAttendance,
} from "../Controllers/attendance.controller.js";
import { Authorize } from "../middleware/auth.js";
import customErrorHandler from "../middleware/customErrorHandler.js";
import {
  validateAttendance,
  validateAttendanceId,
  validateDeleteAttendance,
  validateGetAllAttendance,
  validateGetAttendanceRecordsByDate,
  validateGetAttendanceRecordsByStatus,
  validateUpdateAttendance,
  validateUserAttendanceRecord,
} from "../schema/commonSchema.js";

export const AttendanceRoute = express();
AttendanceRoute.post(
  "/user/createAttendance-record/:userId",
  validateAttendance,
  customErrorHandler,
  attendanceCreate
);
AttendanceRoute.get(
  "/getAttendance/:id",
  validateAttendanceId,
  customErrorHandler,
  getAttendance
);
AttendanceRoute.get(
  "/user/getAllAttendance",
  Authorize(["Admin"]),
  validateGetAllAttendance,
  customErrorHandler,
  getAllAttendance
);
AttendanceRoute.put(
  "/user/updateAttendance/:entryId",
  Authorize(["Admin"]),
  validateUpdateAttendance,
  customErrorHandler,
  updateAttendance
);
AttendanceRoute.delete(
  "/user/deleteAttendance/:entryId",
  Authorize(["Admin"]),
  validateDeleteAttendance,
  customErrorHandler,
  deleteAttendance
);
AttendanceRoute.get(
  "/user-getAttendance/:userId",
  validateUserAttendanceRecord,
  customErrorHandler,
  getUserAttendanceRecord
);
AttendanceRoute.get(
  "/attendance/date",
  Authorize(["Admin"]),
  validateGetAttendanceRecordsByDate,
  customErrorHandler,
  getAttendanceRecordsByDate
);
AttendanceRoute.get(
  "/attendance/status/:status",
  Authorize(["Admin"]),
  validateGetAttendanceRecordsByStatus,
  customErrorHandler,
  getAttendanceRecordsByStatus
);
