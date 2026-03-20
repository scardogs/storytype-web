import mongoose from "mongoose";

const trainingLessonSchema = new mongoose.Schema(
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
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TrainingModule",
      required: true,
    },
    lessonType: {
      type: String,
      enum: ["theory", "practice", "drill", "assessment"],
      required: true,
    },
    content: {
      instruction: {
        type: String,
        required: true,
      },
      practiceText: {
        type: String,
        required: function () {
          return this.lessonType === "practice" || this.lessonType === "drill";
        },
      },
      expectedWPM: {
        type: Number,
        default: 30,
      },
      timeLimit: {
        type: Number,
        default: 60, // in seconds
      },
      targetAccuracy: {
        type: Number,
        default: 95, // percentage
      },
      specialRules: {
        allowBackspace: { type: Boolean, default: true },
        numbersOnly: { type: Boolean, default: false },
        symbolsOnly: { type: Boolean, default: false },
        caseSensitive: { type: Boolean, default: true },
        highlightErrors: { type: Boolean, default: true },
      },
      hints: [
        {
          type: String,
        },
      ],
      tips: [
        {
          type: String,
        },
      ],
    },
    order: {
      type: Number,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: true,
    },
    skills: [{ type: String }], // e.g., ["home-row", "index-finger", "accuracy"]
    prerequisites: [
      {
        skill: { type: String, required: true },
        minScore: { type: Number, default: 70 },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
trainingLessonSchema.index({ moduleId: 1, order: 1 });
trainingLessonSchema.index({ lessonType: 1, difficulty: 1 });
trainingLessonSchema.index({ isActive: 1 });
trainingLessonSchema.index({ isActive: 1, moduleId: 1, order: 1 });
trainingLessonSchema.index({ isActive: 1, lessonType: 1, difficulty: 1 });
trainingLessonSchema.index({ skills: 1 });

export default mongoose.models.TrainingLesson ||
  mongoose.model("TrainingLesson", trainingLessonSchema);
