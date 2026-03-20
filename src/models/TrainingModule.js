import mongoose from "mongoose";

const trainingModuleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      maxlength: 500,
    },
    category: {
      type: String,
      enum: ["beginner", "advanced", "specialized", "daily"],
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard", "expert"],
      required: true,
    },
    estimatedDuration: {
      type: Number,
      required: true, // in minutes
    },
    prerequisites: [
      {
        moduleId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "TrainingModule",
        },
        requiredScore: { type: Number, default: 80 }, // minimum score to unlock
      },
    ],
    lessons: [
      {
        lessonId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "TrainingLesson",
        },
        order: { type: Number, required: true },
      },
    ],
    totalLessons: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    tags: [{ type: String }], // e.g., ["finger-placement", "speed", "accuracy"]
    icon: {
      type: String,
      default: "🎯",
    },
    color: {
      type: String,
      default: "blue",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
trainingModuleSchema.index({ category: 1, difficulty: 1 });
trainingModuleSchema.index({ isActive: 1 });
trainingModuleSchema.index({ isActive: 1, category: 1, difficulty: 1, createdAt: 1 });
trainingModuleSchema.index({ tags: 1 });

// Virtual for completion rate (will be calculated from user progress)
trainingModuleSchema.virtual("completionRate").get(function () {
  return 0; // This will be calculated dynamically
});

export default mongoose.models.TrainingModule ||
  mongoose.model("TrainingModule", trainingModuleSchema);
