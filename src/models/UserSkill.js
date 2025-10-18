import mongoose from "mongoose";

const userSkillSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    skillName: {
      type: String,
      required: true,
      trim: true,
    },
    skillCategory: {
      type: String,
      enum: [
        "typing",
        "accuracy",
        "speed",
        "endurance",
        "special-characters",
        "numbers",
      ],
      required: true,
    },
    currentLevel: {
      type: String,
      enum: ["beginner", "intermediate", "advanced", "expert"],
      default: "beginner",
    },
    score: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    averageWPM: {
      type: Number,
      default: 0,
    },
    averageAccuracy: {
      type: Number,
      default: 0,
    },
    totalPracticeTime: {
      type: Number,
      default: 0, // in seconds
    },
    sessionsCompleted: {
      type: Number,
      default: 0,
    },
    weaknesses: [
      {
        area: { type: String, required: true },
        frequency: { type: Number, default: 1 },
        lastOccurred: { type: Date, default: Date.now },
      },
    ],
    strengths: [
      {
        area: { type: String, required: true },
        score: { type: Number, default: 0 },
      },
    ],
    lastPracticed: {
      type: Date,
      default: Date.now,
    },
    nextRecommendedLesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TrainingLesson",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
userSkillSchema.index({ userId: 1, skillName: 1 }, { unique: true });
userSkillSchema.index({ userId: 1, skillCategory: 1 });
userSkillSchema.index({ userId: 1, score: -1 });
userSkillSchema.index({ skillCategory: 1, score: -1 });

// Virtual for skill level based on score
userSkillSchema.virtual("skillLevel").get(function () {
  if (this.score >= 90) return "expert";
  if (this.score >= 75) return "advanced";
  if (this.score >= 50) return "intermediate";
  return "beginner";
});

// Virtual for improvement needed
userSkillSchema.virtual("needsImprovement").get(function () {
  return this.score < 70;
});

export default mongoose.models.UserSkill ||
  mongoose.model("UserSkill", userSkillSchema);
