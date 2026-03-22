import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Please provide a username"],
      unique: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [20, "Username cannot exceed 20 characters"],
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Don't return password by default
    },
    profilePicture: {
      type: String,
      default:
        "https://res.cloudinary.com/demo/image/upload/v1/default-avatar.png",
    },
    cloudinaryId: {
      type: String,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
      select: false,
    },
    emailVerificationExpires: {
      type: Date,
      select: false,
    },
    lastActiveAt: {
      type: Date,
      default: null,
      index: true,
    },
    plan: {
      type: String,
      enum: ["free", "pro"],
      default: "free",
      index: true,
    },
    proStatus: {
      type: String,
      enum: ["active", "inactive"],
      default: "inactive",
    },
    proGrantedAt: {
      type: Date,
      default: null,
    },
    proSource: {
      type: String,
      enum: ["admin", "code", "stripe", ""],
      default: "",
    },
    stats: {
      totalGamesPlayed: { type: Number, default: 0 },
      bestWPM: { type: Number, default: 0 },
      averageWPM: { type: Number, default: 0 },
      bestAccuracy: { type: Number, default: 0 },
      totalWordsTyped: { type: Number, default: 0 },
      dailyChallengeStreak: { type: Number, default: 0 },
      longestDailyChallengeStreak: { type: Number, default: 0 },
      totalDailyChallengesCompleted: { type: Number, default: 0 },
      lastDailyChallengeDateKey: { type: String, default: "" },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for auth, leaderboard, and admin queries
UserSchema.index({ createdAt: -1 });
UserSchema.index({ emailVerified: 1, createdAt: -1 });
UserSchema.index({ plan: 1, proStatus: 1, createdAt: -1 });
UserSchema.index({ "stats.totalGamesPlayed": 1, "stats.bestWPM": -1 });
UserSchema.index({ "stats.totalGamesPlayed": 1, "stats.averageWPM": -1 });
UserSchema.index({ "stats.totalGamesPlayed": 1, "stats.bestAccuracy": -1 });
UserSchema.index({ "stats.totalGamesPlayed": 1, "stats.totalWordsTyped": -1 });

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare password
UserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.models.User || mongoose.model("User", UserSchema);
