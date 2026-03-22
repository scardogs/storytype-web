import mongoose from "mongoose";

const suggestionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1200,
    },
    category: {
      type: String,
      enum: ["feature", "ui", "training", "tournament", "chat", "bugfix"],
      default: "feature",
    },
    status: {
      type: String,
      enum: ["open", "planned", "in_progress", "done"],
      default: "open",
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    authorName: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

suggestionSchema.index({ createdAt: -1 });
suggestionSchema.index({ status: 1, createdAt: -1 });
suggestionSchema.index({ category: 1, createdAt: -1 });

export default mongoose.models.Suggestion ||
  mongoose.model("Suggestion", suggestionSchema);
