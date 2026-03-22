import mongoose from "mongoose";

const friendRequestSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    respondedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

friendRequestSchema.index({ senderId: 1, recipientId: 1 }, { unique: true });
friendRequestSchema.index({ recipientId: 1, status: 1, createdAt: -1 });
friendRequestSchema.index({ senderId: 1, status: 1, createdAt: -1 });

export default mongoose.models.FriendRequest ||
  mongoose.model("FriendRequest", friendRequestSchema);
