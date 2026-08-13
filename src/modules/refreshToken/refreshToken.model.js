import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    tokenHash: {
      type: String,
      required: true,
      unique: true,
      select: false,
    },

    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },

    isRevoked: {
      type: Boolean,
      default: false,
      index: true,
    },

    revokedAt: {
      type: Date,
      default: null,
    },

    deviceType: {
      type: String,
      trim: true,
      default: "",
    },

    ipAddress: {
      type: String,
      trim: true,
      default: "",
    },

    userAgent: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

/*
 * Automatically remove expired refresh tokens
 * from MongoDB.
 */
refreshTokenSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

refreshTokenSchema.index({
  user: 1,
  isRevoked: 1,
});

const RefreshToken = mongoose.model(
  "RefreshToken",
  refreshTokenSchema
);

export default RefreshToken;