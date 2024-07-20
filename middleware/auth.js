import jwt from 'jsonwebtoken';
import { Admin } from '../models/admin.model.js';
import { User } from '../models/user.model.js';
import { apiResponseErr, apiResponseSuccess } from '../utils/serverError.js';

export const Authorize = (roles) => {
  return async (req, res, next) => {
    try {
      const authToken = req?.headers?.authorization;

      if (!authToken) {
        return res.status(401).send(apiResponseErr(null, false, 401, 'Unauthorized access'));
      }

      const tokenParts = authToken.split(' ');
      if (tokenParts.length !== 2 || !(tokenParts[0] === 'Bearer' && tokenParts[1])) {
        return res.status(401).send(apiResponseErr(null, false, 401, 'Unauthorized access'));
      }

      const user = jwt.verify(tokenParts[1], process.env.JWT_SECRET_KEY);
      if (!user) {
        return res.status(401).send(apiResponseErr(null, false, 401, 'Unauthorized access'));
      }

      let existingUser;
      if (roles.includes('Admin')) {
        existingUser = await Admin.findById(user.id).exec();
        if (!existingUser) {
          return res.status(401).send(apiResponseErr(null, false, 401, 'Unauthorized access'));
        }
      }

      if (roles.includes('User')) {
        existingUser = await User.findById(user.id).exec();
        if (!existingUser) {
          return res.status(401).send(apiResponseErr(null, false, 401, 'Unauthorized access'));
        }
      }
      if (roles && roles.length > 0) {
        let userHasRequiredRole = false;
        roles.forEach((role) => {
          const rolesArray = existingUser.roles;
          for (const element of rolesArray) {
            if (role === element) {
              userHasRequiredRole = true;
            }
          }
        });
        if (!userHasRequiredRole) return res.status(401).send(apiResponseErr(null, false, 401, 'Unauthorized access'));
      }

      req.user = existingUser;
      next();
    } catch (err) {
      console.error('Authorization Error:', err.message);
      return res.status(401).send(apiResponseErr(null, false, 401, 'Unauthorized access'));
    }
  };
};
