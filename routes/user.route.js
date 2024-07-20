import express from 'express';
import { upload } from '../middleware/multer.js';
import { Authorize } from '../middleware/auth.js';
import { createUser, deleteUser, getAllUsers, getUser, loginUser, userPasswordReset, userUpdate } from '../controllers/user.controller.js';
import { userValidationRules, validateDeleteUser, validateGetAllUsers, validateGetUser, validateLogin, validateUserPasswordReset, validateUserUpdate } from '../schema/commonSchema.js';
import customErrorHandler from '../middleware/customErrorHandler.js';


export const UserRoute = express();
UserRoute.post('/admin/createUser', upload.single('avatar'),Authorize(['Admin']), userValidationRules,customErrorHandler,createUser);
UserRoute.post('/user-login',validateLogin, customErrorHandler,loginUser);
UserRoute.get('/user/:id',validateGetUser,customErrorHandler, getUser);
UserRoute.get('/admin/users', Authorize(['Admin']),validateGetAllUsers,customErrorHandler, getAllUsers);
UserRoute.put('/admin/update-user/:userId', Authorize(['Admin']),validateUserUpdate,customErrorHandler, userUpdate);
UserRoute.delete('/admin/delete-user/:id', Authorize(['Admin']),validateDeleteUser,customErrorHandler, deleteUser);
UserRoute.post('/reset-password', Authorize(['Admin']),validateUserPasswordReset,customErrorHandler, userPasswordReset);
