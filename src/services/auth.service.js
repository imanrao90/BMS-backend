import User from "../modules/user/user.model.js";
import Role from "../modules/roles/roles.model.js";
import RefreshToken from "../modules/refreshToken/refreshToken.model.js";

import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";

import { hashToken } from "../utils/token.js";

import AppError from "../utils/AppError.js";
import { ROLES } from "../constants/roles.js";

export const registerUser = async ({
  firstName,
  lastName,
  email,
  phone,
  password,
}) => {
  // 1. Normalize input
  const normalizedEmail = email.trim().toLowerCase();

  // 2. Check if user already exists
  const existingUser = await User.findOne({
    email: normalizedEmail,
    isDeleted: false,
  });

  if (existingUser) {
    throw new AppError(
      "An account with this email already exists",
      409
    );
  }

  // 3. Find Owner role
  const ownerRole = await Role.findOne({
    slug: ROLES.OWNER,
    business: null,
    isSystem: true,
    isActive: true,
    isDeleted: false,
  });

  if (!ownerRole) {
    throw new AppError(
      "Owner role is not configured",
      500
    );
  }

  // 4. Create user
  const user = await User.create({
    business: null,
    role: ownerRole._id,
    firstName,
    lastName,
    email: normalizedEmail,
    phone,
    password,
  });

  // 5. Generate tokens
  const accessToken = generateAccessToken({
    userId: user._id.toString(),
  });

  const refreshToken = generateRefreshToken({
    userId: user._id.toString(),
  });

  // 6. Hash refresh token before storing
  const tokenHash = hashToken(refreshToken);

  // 7. Calculate refresh token expiry
  const refreshTokenExpiresAt = new Date(
    Date.now() +
    parseExpiryToMilliseconds(
      process.env.JWT_REFRESH_EXPIRES_IN
    )
  );

  // 8. Save refresh token
  await RefreshToken.create({
    user: user._id,
    tokenHash,
    expiresAt: refreshTokenExpiresAt,
  });

  return {
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: ownerRole.slug,
    },
    accessToken,
    refreshToken,
  };
};

export const loginUser = async ({
  email,
  password
}) => {
  const normalizedEmail = email.trim().toLowerCase()

  const user = await User.findOne({
    email: normalizedEmail,
    isDeleted: false
  }).select("+password")

  if (!user) {
    throw new AppError(
      "Invalid email or password",
      401
    );
  }

  // 2. Check account status
  if (user.status !== "ACTIVE") {
    throw new AppError(
      "Your account is not active",
      403
    );
  }

  // 3. Check account lock
  if (user.isLocked()) {
    throw new AppError(
      "Your account is temporarily locked",
      423
    );
  }

  // 4. Compare password
  const isPasswordValid =
    await user.comparePassword(password);

  if (!isPasswordValid) {
    user.failedLoginAttempts += 1;

    await user.save();

    throw new AppError(
      "Invalid email or password",
      401
    );
  }

  // 5. Reset failed login attempts
  user.failedLoginAttempts = 0;
  user.lockUntil = null;
  user.lastLoginAt = new Date();

  await user.save();

  // 6. Generate tokens
  const accessToken = generateAccessToken({
    userId: user._id.toString(),
  });

  const refreshToken = generateRefreshToken({
    userId: user._id.toString(),
  });

  // 7. Hash refresh token
  const tokenHash = hashToken(refreshToken);

  // 8. Calculate expiry
  const refreshTokenExpiresAt = new Date(
    Date.now() +
    parseExpiryToMilliseconds(
      process.env.JWT_REFRESH_EXPIRES_IN
    )
  );

  // 9. Save refresh token
  await RefreshToken.create({
    user: user._id,
    tokenHash,
    expiresAt: refreshTokenExpiresAt,
  });

  return {
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      business: user.business,
    },
    accessToken,
    refreshToken,
  };
}

export const logoutUser = async (refreshToken) => {
  if (!refreshToken) {
    throw new AppError("Refresh token is required", 400);
  }

  const tokenHash = hashToken(refreshToken);

  const storedToken = await RefreshToken.findOne({
    tokenHash,
    isRevoked: false,
  });

  if (!storedToken) {
    throw new AppError("Invalid or already revoked refresh token", 401);
  }

  storedToken.isRevoked = true;
  storedToken.revokedAt = new Date();

  await storedToken.save();

  return true;
};

export const logoutAllSessions = async (userId) => {
  const result = await RefreshToken.updateMany(
    {
      user: userId,
      isRevoked: false,
    },
    {
      $set: {
        isRevoked: true,
        revokedAt: new Date(),
      },
    }
  );

  return {
    revokedSessions: result.modifiedCount,
  };
};

export const getUserSessions = async (userId) => {
  const sessions = await RefreshToken.find({
    user: userId,
    isRevoked: false,
    expiresAt: { $gt: new Date() },
  })
    .select("-tokenHash")
    .sort({ createdAt: -1 });

  return sessions;
};

export const revokeSession = async (userId, sessionId) => {
  const session = await RefreshToken.findOne({
    _id: sessionId,
    user: userId,
    isRevoked: false,
  });

  if (!session) {
    throw new AppError("Session not found", 404);
  }

  session.isRevoked = true;
  session.revokedAt = new Date();

  await session.save();

  return true;
};

export const refreshAccessToken = async (refreshToken) => {
  if (!refreshToken) {
    throw new AppError("Refresh token is required", 400);
  }

  // 1. Verify JWT refresh token
  let decoded;

  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch (error) {
    throw new AppError("Invalid or expired refresh token", 401);
  }

  // 2. Hash incoming token
  const tokenHash = hashToken(refreshToken);

  // 3. Find stored refresh token
  const storedToken = await RefreshToken.findOne({
    tokenHash,
    user: decoded.userId,
    isRevoked: false,
  }).select("+tokenHash");

  if (!storedToken) {
    throw new AppError("Invalid or revoked refresh token", 401);
  }

  // 4. Check expiration
  if (storedToken.expiresAt < new Date()) {
    throw new AppError("Refresh token has expired", 401);
  }

  // 5. Find user
  const user = await User.findOne({
    _id: decoded.userId,
    isDeleted: false,
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (user.status !== "ACTIVE") {
    throw new AppError("Your account is not active", 403);
  }

  // 6. Generate new tokens
  const newAccessToken = generateAccessToken({
    userId: user._id.toString(),
  });

  const newRefreshToken = generateRefreshToken({
    userId: user._id.toString(),
  });

  // 7. Revoke old refresh token
  storedToken.isRevoked = true;
  storedToken.revokedAt = new Date();

  await storedToken.save();

  // 8. Store new refresh token
  const newTokenHash = hashToken(newRefreshToken);

  const newExpiresAt = new Date(
    Date.now() +
      parseExpiryToMilliseconds(
        process.env.JWT_REFRESH_EXPIRES_IN
      )
  );

  await RefreshToken.create({
    user: user._id,
    tokenHash: newTokenHash,
    expiresAt: newExpiresAt,
  });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

const parseExpiryToMilliseconds = (value) => {
  if (!value) {
    throw new Error(
      "JWT_REFRESH_EXPIRES_IN is not configured"
    );
  }

  const match = value.match(/^(\d+)([smhd])$/);

  if (!match) {
    throw new Error(
      "Invalid JWT_REFRESH_EXPIRES_IN format"
    );
  }

  const amount = Number(match[1]);
  const unit = match[2];

  const multipliers = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return amount * multipliers[unit];
};

