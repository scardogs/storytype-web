import mongoose from "mongoose";

const tournamentSchema = new mongoose.Schema(
  {
    name: {
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
    type: {
      type: String,
      enum: ["weekly", "bracket", "team", "special"],
      required: true,
    },
    theme: {
      type: String,
      enum: ["speed", "accuracy", "endurance", "mixed"],
      required: true,
    },
    status: {
      type: String,
      enum: ["upcoming", "active", "completed", "cancelled"],
      default: "upcoming",
    },
    rules: {
      allowBackspace: { type: Boolean, default: true },
      numbersOnly: { type: Boolean, default: false },
      specialCharacters: { type: Boolean, default: false },
      timeLimit: { type: Number, default: 60 }, // in seconds
      maxParticipants: { type: Number, default: 100 },
    },
    prizes: {
      firstPlace: { type: String, default: "Gold Trophy" },
      secondPlace: { type: String, default: "Silver Trophy" },
      thirdPlace: { type: String, default: "Bronze Trophy" },
      badges: [{ type: String }],
    },
    participants: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        username: String,
        joinedAt: { type: Date, default: Date.now },
        score: { type: Number, default: 0 },
        wpm: { type: Number, default: 0 },
        accuracy: { type: Number, default: 0 },
        rank: { type: Number, default: 0 },
      },
    ],
    brackets: [
      {
        round: { type: Number, required: true },
        matches: [
          {
            player1: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            player2: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            player1Score: { type: Number, default: 0 },
            player2Score: { type: Number, default: 0 },
            winner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            status: {
              type: String,
              enum: ["pending", "completed"],
              default: "pending",
            },
            completedAt: Date,
          },
        ],
      },
    ],
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    registrationDeadline: {
      type: Date,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    winners: {
      first: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      second: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      third: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
tournamentSchema.index({ status: 1, startDate: 1 });
tournamentSchema.index({ type: 1, theme: 1 });
tournamentSchema.index({ "participants.userId": 1 });

// Virtual for participant count
tournamentSchema.virtual("participantCount").get(function () {
  return this.participants.length;
});

// Virtual for registration status
tournamentSchema.virtual("canRegister").get(function () {
  const now = new Date();
  return (
    this.status === "upcoming" &&
    now < this.registrationDeadline &&
    this.participants.length < this.rules.maxParticipants
  );
});

export default mongoose.models.Tournament ||
  mongoose.model("Tournament", tournamentSchema);
