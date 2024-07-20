import { Admin } from '../models/admin.model.js';
import 'dotenv/config';

import { apiResponseErr, apiResponseSuccess } from '../utils/serverError.js';


export const createAdmin = async (req, res) => {
  const { firstName, lastName, userName, password, roles } = req.body;
  try {
    const existingAdmin = await Admin.findOne({ userName });
    if (existingAdmin) {
      return res.status(400).json(apiResponseErr(null, false, 400, 'Admin Already Exists'));
    }

    const newAdmin = new Admin({
      firstName,
      lastName,
      userName,
      password,
      roles,
    });

    await newAdmin.save();

    return res.status(201).send({
      data: newAdmin,
      success: true,
      message: 'Admin created successfully',
    });
  } catch (error) {
    return res.status(500).send(apiResponseErr(error.data ?? null, false, error.responseCode ?? 500, error.errMessage ?? error.message));
  }
};

export const loginAdmin = async (req, res) => {
  const { userName, password } = req.body;

  try {
    const existingUser = await Admin.findOne({ userName });
    

    if (!existingUser) {
      return res.status(400).send(apiResponseErr(null, false, 400, 'Admin Does Not Exist'));
    }

    const isPasswordValid = await existingUser.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).send(apiResponseErr(null, false, 400, 'Invalid username or password'));
    }

    const accessToken = existingUser.generateAccessToken();


    return res.status(200).send(
      apiResponseSuccess(
        {
          id: existingUser._id,
          accessToken,
          userName: existingUser.userName,
          UserType: existingUser.userType || 'Admin',
        },
        true,
        200,
        'Admin login successfully',
      ),
    );
  } catch (error) {
    return res.status(500).send(apiResponseErr(null, false, 500, 'Internal Server Error'));
  }
};


