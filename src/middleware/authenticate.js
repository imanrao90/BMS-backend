import User from "../modules/user/user.model.js";
import AppError from '../utils/AppError.js'
import { verifyAccessToken } from "../utils/jwt.js";
import Permission from "../modules/permissions/permissions.model.js";
import Role from "../modules/roles/roles.model.js";

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // 1. Check Authorization header
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(new AppError("Authentication required", 401));
    }

    // 2. Extract token
    const token = authHeader.split(" ")[1];

    if (!token) {
      return next(new AppError("Authentication token missing", 401));
    }

    // 3. Verify access token
    const decoded = verifyAccessToken(token);

    // 4. Find user
    const user = await User.findOne({
      _id: decoded.userId,
      isDeleted: false,
      status: "ACTIVE",
    }).populate({
      path: "role",
      populate: {
        path: "permissions",
        select: "name slug module action isActive",
      },
    });

    if (!user) {
      return next(new AppError("User not found", 401));
    }

    // 5. Attach authenticated user to request
    req.user = user;

    // 6. Continue
    next();
  } catch (error) {
    next(error);
  }
};

export default authenticate;