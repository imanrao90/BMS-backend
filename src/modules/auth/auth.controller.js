import { loginUser, refreshAccessToken, registerUser, logoutUser, logoutAllSessions, getUserSessions, revokeSession } from "../../services/auth.service.js";
import asyncHandler from "../../utils/asyncHandler.js";

export const register = asyncHandler(async (req, res) => {
  console.log("🔥 REGISTER CONTROLLER HIT");
  const {
    firstName,
    lastName,
    email,
    phone,
    password,
  } = req.body;

  const result = await registerUser({
    firstName,
    lastName,
    email,
    phone,
    password,
  });

  return res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: result,
  });
});

export const login = asyncHandler(async (req, res) => {
   console.log("🔥 LOGIN CONTROLLER HIT");
  const {
    email,
    password,
  } = req.body;

  const result = await loginUser({
    email,
    password,
  });

  return res.status(200).json({
    success: true,
    message: "Login successful",
    data: result,
  });
});

export const getMe = asyncHandler(async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Current user fetched successfully",
    data: {
      user: {
        id: req.user._id,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        fullName: req.user.fullName,
        email: req.user.email,
        phone: req.user.phone,
        business: req.user.business,
      },

      role: {
        id: req.user.role?._id,
        name: req.user.role?.name,
        slug: req.user.role?.slug,
      },

      permissions:
        req.user.role?.permissions
          ?.filter((permission) => permission.isActive)
          .map((permission) => permission.slug) || [],
    },
  });
});

export const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  await logoutUser(refreshToken);

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

export const logoutAll = asyncHandler(async (req, res) => {
  const result = await logoutAllSessions(req.user._id);

  return res.status(200).json({
    success: true,
    message: "All sessions logged out successfully",
    data: result,
  });
});

export const getSessions = asyncHandler(async (req, res) => {
  const sessions = await getUserSessions(req.user._id);

  return res.status(200).json({
    success: true,
    message: "Sessions fetched successfully",
    data: {
      sessions,
    },
  });
});

export const revoke = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await revokeSession(req.user._id, id);

  return res.status(200).json({
    success: true,
    message: "Session revoked successfully",
  });
});

export const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  const result = await refreshAccessToken(refreshToken);

  return res.status(200).json({
    success: true,
    message: "Token refreshed successfully",
    data: result,
  });
});