import mongoose from "mongoose";

const dailyChallengeSchema = new mongoose.Schema(
  {
    dateKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
    },
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
      maxlength: 320,
    },
    genre: {
      type: String,
      enum: ["Fantasy", "Mystery", "Sci-Fi", "Romance"],
      required: true,
    },
    duration: {
      type: Number,
      required: true,
      min: 15,
    },
    targetWpm: {
      type: Number,
      required: true,
      min: 0,
    },
    targetAccuracy: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    rewardLabel: {
      type: String,
      default: "",
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    notificationSent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

dailyChallengeSchema.index({ createdAt: -1 });

export default mongoose.models.DailyChallenge ||
  mongoose.model("DailyChallenge", dailyChallengeSchema);
