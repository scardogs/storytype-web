import mongoose from "mongoose";

const trainingProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TrainingModule",
      required: true,
    },
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TrainingLesson",
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    bestScore: {
      wpm: { type: Number, default: 0 },
      accuracy: { type: Number, default: 0 },
      timeCompleted: { type: Number, default: 0 }, // in seconds
    },
    lastScore: {
      wpm: { type: Number, default: 0 },
      accuracy: { type: Number, default: 0 },
      timeCompleted: { type: Number, default: 0 },
      errors: { type: Number, default: 0 },
      wordsTyped: { type: Number, default: 0 },
    },
    status: {
      type: String,
      enum: ["not_started", "in_progress", "completed", "mastered"],
      default: "not_started",
    },
    completedAt: {
      type: Date,
    },
    timeSpent: {
      type: Number,
      default: 0, // total time spent in seconds
    },
    skillsImproved: [
      {
        skill: { type: String, required: true },
        improvement: { type: Number, required: true }, // percentage improvement
      },
    ],
    notes: {
      type: String,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
trainingProgressSchema.index({ userId: 1, moduleId: 1 });
trainingProgressSchema.index({ userId: 1, lessonId: 1 });
trainingProgressSchema.index({ userId: 1, status: 1 });
trainingProgressSchema.index({ moduleId: 1, status: 1 });
trainingProgressSchema.index({ userId: 1, updatedAt: -1 });
trainingProgressSchema.index(
  { userId: 1, moduleId: 1, lessonId: 1 },
  { unique: true }
);

// Compound index for user progress queries
trainingProgressSchema.index({ userId: 1, completedAt: -1 });

export default mongoose.models.TrainingProgress ||
  mongoose.model("TrainingProgress", trainingProgressSchema);
