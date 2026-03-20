import mongoose from "mongoose";

const userDailyChallengeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    challengeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DailyChallenge",
      required: true,
    },
    dateKey: {
      type: String,
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    bestWpm: {
      type: Number,
      default: 0,
    },
    bestAccuracy: {
      type: Number,
      default: 0,
    },
    bestScore: {
      type: Number,
      default: 0,
    },
    metTarget: {
      type: Boolean,
      default: false,
    },
    streakAfterCompletion: {
      type: Number,
      default: 0,
    },
    lastAttemptAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

userDailyChallengeSchema.index({ challengeId: 1, bestScore: -1, bestAccuracy: -1 });
userDailyChallengeSchema.index({ userId: 1, dateKey: -1 });
userDailyChallengeSchema.index({ userId: 1, challengeId: 1 }, { unique: true });

export default mongoose.models.UserDailyChallenge ||
  mongoose.model("UserDailyChallenge", userDailyChallengeSchema);
