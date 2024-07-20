import express from 'express';
import 'dotenv/config';
import { UserRoute } from './routes/user.route.js';
import { AdminRoute } from './routes/admin.route.js';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';
import { LeaveRoute } from './routes/leave.route.js';
import { AttendanceRoute } from './routes/attendance.route.js';
import { DocumentRoute } from './routes/document.route.js';

const app = express();
app.use(express.json());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.urlencoded({ extended: true }));
const allowedOrigins = process.env.FRONTEND_URI.split(',');
app.use(cors({ origin: allowedOrigins }));


app.use('/api',UserRoute);
app.use('/api',AdminRoute);
app.use('/api',LeaveRoute);
app.use('/api',AttendanceRoute);
app.use('/api',DocumentRoute);


(async function dbConnect() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.MONGODB_NAME });
    console.log('Connected to MongoDB successfully!');

    app.listen(process.env.PORT, () => {
      console.log(`App is running on http://localhost:${process.env.PORT || 8080}`);
    });
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    throw error;
  }
})();
