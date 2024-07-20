import { body, param, query } from "express-validator";

export const validateCreateAdmin = [
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    body('userName').notEmpty().withMessage('Username is required')
      .isLength({ min: 4 }).withMessage('Username must be at least 4 characters long'),
    body('password').notEmpty().withMessage('Password is required')
      .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('roles').isArray().withMessage('Roles must be an array'),
  ];

  export const validateLoginAdmin = [
    body('userName').notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ];

  export const  userValidationRules = [
    body('empId').notEmpty().withMessage('Employee ID is required'),
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    body('userName').notEmpty().withMessage('Username is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('phone').isMobilePhone().withMessage('Phone number is not valid'),
    body('address').isLength({ min: 10, max: 80 }).withMessage('Address should be between 10 and 80 characters'),
    body('dateOfJoining').notEmpty().withMessage('Date of joining is required'),
    body('bloodGroup').notEmpty().withMessage('Blood group is required'),
    body('dateOfBirth').notEmpty().withMessage('Date of birth is required'),
    body('team').notEmpty().withMessage('Team is required'),
    body('designation').notEmpty().withMessage('Designation is required'),
    body('avatar').notEmpty().withMessage('Avatar URL is required'),
    body('roles').notEmpty().withMessage('Roles are required')
  ];

  export const validateLogin = [
    body('userName').notEmpty().withMessage('userName is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ];

  export const validateGetUser = [
    param('id').isMongoId().withMessage('Invalid user ID format'),
  ];

  export const validateGetAllUsers = [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('pageSize').optional().isInt({ min: 1 }).withMessage('Page size must be a positive integer'),
    query('search').optional().isString().withMessage('Search must be a string'),
  ];

  export const validateUserUpdate = [
    param('userId').isMongoId().withMessage('Invalid User ID'),
    body('empId').optional().isString().withMessage('Employee ID must be a string'),
    body('firstName').optional().isString().withMessage('First Name must be a string'),
    body('lastName').optional().isString().withMessage('Last Name must be a string'),
    body('userName').optional().isString().withMessage('Username must be a string'),
    body('phone').optional().isMobilePhone().withMessage('Invalid phone number'),
    body('address').optional().isString().withMessage('Address must be a string'),
    body('dateOfJoining').optional().isISO8601().withMessage('Invalid Date of Joining'),
    body('bloodGroup').optional().isString().withMessage('Blood Group must be a string'),
    body('dateOfBirth').optional().isISO8601().withMessage('Invalid Date of Birth'),
    body('team').optional().isString().withMessage('Team must be a string'),
    body('designation').optional().isString().withMessage('Designation must be a string'),
  ];

  export const validateDeleteUser = [
    param('id').isMongoId().withMessage('Invalid User ID'),
  ];

  export const validateUserPasswordReset = [
    body('userId').notEmpty().withMessage('userId is required').isMongoId().withMessage('Invalid userId format'),
    body('oldPassword').notEmpty().withMessage('Old password is required'),
    body('password').notEmpty().withMessage('New password is required').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('confirmPassword').notEmpty().withMessage('Confirm password is required').custom((value, { req }) => value === req.body.password).withMessage('Passwords do not match'),
  ];

  export const validateUserLeave = [
    body('leaveType').not().isEmpty().withMessage('Leave type is required'),
    body('totalDay').isInt({ min: 1 }).withMessage('Total day must be a positive integer'),
    body('startDate').isISO8601().toDate().withMessage('Invalid start date'),
    body('endDate').isISO8601().toDate().withMessage('Invalid end date'),
    body('reason').not().isEmpty().withMessage('Reason is required'),
    body('status').isIn(['pending', 'approved', 'rejected']).withMessage('Invalid status'),
  ];

  export const validateLeaveRequestId = [
    body('id').isMongoId().withMessage('Invalid leave request ID'),
  ];

  export const validateUpdateLeaveRequest = [
    body('leaveType').optional().notEmpty().withMessage('Leave type must not be empty'),
    body('totalDay').optional().isInt({ min: 1 }).withMessage('Total day must be a positive integer'),
    body('startDate').optional().isISO8601().toDate().withMessage('Invalid start date'),
    body('endDate').optional().isISO8601().toDate().withMessage('Invalid end date'),
    body('reason').optional().notEmpty().withMessage('Reason must not be empty'),
  ];

  export const validateUpdateLeaveStatus = [
    body('status').isIn(['Approved', 'Rejected']).withMessage('Invalid status value'),
    body('approvedBy').if(body('status').equals('Approved')).notEmpty().withMessage('ApprovedBy is required when status is Approved'),
  ];

  export const validateUserId = [
    param('userId').isMongoId().withMessage('Invalid user ID format'),
  ];

  export const validateUploadDocuments = [
    body('userId').isMongoId().withMessage('Invalid user ID format'),
    body('type').trim().notEmpty().withMessage('Type is required'),
    body('file').notEmpty().withMessage('File is required'),
  ];

  export const validateGetDocuments = [
    param('userId').isMongoId().withMessage('Invalid user ID format'),
  ];

  export const validateUpdateDocument = [
    param('documentId').isMongoId().withMessage('Invalid document ID format'),
    param('userId').isMongoId().withMessage('Invalid user ID format'),
  ];

  export const validateDeleteDocument = [
    param('documentId').isMongoId().withMessage('Invalid document ID format'),
  ];

 
  export const validateAttendance = [
    param('userId').isMongoId().withMessage('Invalid user ID'),
    body('date').notEmpty().withMessage('Date is required'),
    body('entryTime').custom((value, { req }) => {
      if (!value && !req.body.exitTime) {
        throw new Error('Either Entry Time or Exit Time is required');
      }
      if (value && req.body.exitTime) {
        throw new Error('Only one of Entry Time or Exit Time can be provided');
      }
      return true;
    }),
  ]  

  export const validateAttendanceId = [
    param('id').isMongoId().withMessage('Invalid attendance ID'),
    
  ];

  export const validateGetAllAttendance = [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1 }).withMessage('Limit must be a positive integer'),
    query('search').optional().isString().withMessage('Search must be a string'),
  ]

  export const validateUpdateAttendance = [
    param('entryId').isUUID().withMessage('Invalid entry ID'),
    body('date').notEmpty().withMessage('Date is required'),
    body('entryTime').notEmpty().withMessage('Entry Time is required'),
    body('exitTime').notEmpty().withMessage('Exit Time is required'),
    body('status').notEmpty().withMessage('Status is required'),
  ]

  export const validateDeleteAttendance = [
    param('entryId').isUUID().withMessage('Invalid entry ID'),
  ]

  export const validateUserAttendanceRecord = [
    param('userId').custom(value => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid userId');
      }
      return true;
    }),
  ]

  export const validateGetAttendanceRecordsByDate = [
    query('date').notEmpty().withMessage('Date parameter is required')
                 .isISO8601().withMessage('Invalid date format, expected YYYY-MM-DD'),
  ]

  export const validateGetAttendanceRecordsByStatus = [
    param('status').isIn(['Present', 'Absent', 'On Leave']).withMessage('Invalid status value'),
  ]