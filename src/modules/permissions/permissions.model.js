import mongoose from "mongoose";

const permissionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      immutable: true,
    },

    module: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },

    action: {
      type: String,
      required: true,
      enum: ["create", "read", "update", "delete", "manage"],
      index: true,
    },

    description: {
      type: String,
      default: "",
      maxlength: 500,
      trim: true,
    },

    isSystem: {
      type: Boolean,
      default: true,
      immutable: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

permissionSchema.index(
  {
    module: 1,
    action: 1,
  },
  {
    unique: true,
  },
);

permissionSchema.index({
  module: 1,
  isActive: 1,
});

const Permission = mongoose.model("Permission", permissionSchema);

export default Permission;