import mongoose from "mongoose";

const directConversationSchema = new mongoose.Schema(
  {
    participantA: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    participantB: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    pairKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

directConversationSchema.index({ participantA: 1, lastMessageAt: -1 });
directConversationSchema.index({ participantB: 1, lastMessageAt: -1 });

export default mongoose.models.DirectConversation ||
  mongoose.model("DirectConversation", directConversationSchema);
