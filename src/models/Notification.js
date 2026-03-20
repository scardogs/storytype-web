import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 140,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    type: {
      type: String,
      enum: ["training", "tournament", "system", "achievement"],
      default: "system",
    },
    audience: {
      type: String,
      enum: ["all", "user"],
      default: "all",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    actionUrl: {
      type: String,
      default: "",
    },
    entityType: {
      type: String,
      default: "",
    },
    entityId: {
      type: String,
      default: "",
    },
    createdByAdmin: {
      adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin",
        default: null,
      },
      username: {
        type: String,
        default: "",
      },
    },
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ audience: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.Notification ||
  mongoose.model("Notification", notificationSchema);
