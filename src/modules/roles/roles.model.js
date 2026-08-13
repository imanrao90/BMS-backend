import mongoose from "mongoose";

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },

    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      default: null,
      index: true,
    },

    permissions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Permission",
      },
    ],

    isSystem: {
      type: Boolean,
      default: false,
      immutable: true,
    },

    isDefault: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
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

    deletedAt: {
      type: Date,
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
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

roleSchema.index(
  {
    business: 1,
    slug: 1,
  },
  {
    unique: true,
  },
);

roleSchema.index({
  business: 1,
  isDeleted: 1,
});

roleSchema.index({
  business: 1,
  isDefault: 1,
});

roleSchema.index({
  permissions: 1,
});

const Role = mongoose.model("Role", roleSchema);

export default Role;