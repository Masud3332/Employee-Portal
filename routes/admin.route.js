import express from "express";
import { createAdmin, loginAdmin } from "../Controllers/admin.controller.js";
import customErrorHandler from "../middleware/customErrorHandler.js";
import {
  validateCreateAdmin,
  validateLoginAdmin,
  validateUserPasswordReset,
} from "../schema/commonSchema.js";

export const AdminRoute = express();
AdminRoute.post(
  "/admin-create",
  validateCreateAdmin,
  customErrorHandler,
  createAdmin
);
AdminRoute.post(
  "/admin/login",
  validateLoginAdmin,
  customErrorHandler,
  loginAdmin
);
