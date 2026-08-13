import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      default: null,
      index: true,
    },

    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      required: true,
      index: true,
    },

    firstName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60,
    },

    lastName: {
      type: String,
      trim: true,
      default: "",
      maxlength: 60,
    },

    fullName: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      trim: true,
      default: "",
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    avatar: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "File",
      default: null,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "SUSPENDED"],
      default: "ACTIVE",
      index: true,
    },

    emailVerified: {
      type: Boolean,
      default: false,
    },

    emailVerifiedAt: {
      type: Date,
      default: null,
    },

    lastLoginAt: {
      type: Date,
      default: null,
    },

    lastLoginIp: {
      type: String,
      default: "",
    },

    failedLoginAttempts: {
      type: Number,
      default: 0,
    },

    lockUntil: {
      type: Date,
      default: null,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },

    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

userSchema.index(
  {
    business: 1,
    email: 1,
  },
  {
    unique: true,
  },
);

userSchema.index({
  role: 1,
});

userSchema.index({
  status: 1,
});

userSchema.index({
  business: 1,
  isDeleted: 1,
});

userSchema.pre("save", async function () {
  this.fullName = `${this.firstName} ${this.lastName}`.trim();

  if (!this.isModified("password")) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.isLocked = function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

const User = mongoose.model("User", userSchema);

export default User;