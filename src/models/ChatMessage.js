import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
  },
  {
    timestamps: true,
  }
);

chatMessageSchema.index({ createdAt: -1 });

export default mongoose.models.ChatMessage ||
  mongoose.model("ChatMessage", chatMessageSchema);
