import mongoose from "mongoose";

const tournamentRecordSchema = new mongoose.Schema(
  {
    tournamentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tournament",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    round: {
      type: Number,
      required: true,
    },
    matchId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    opponentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    opponentUsername: String,
    wpm: {
      type: Number,
      required: true,
    },
    accuracy: {
      type: Number,
      required: true,
    },
    wordsTyped: {
      type: Number,
      required: true,
    },
    totalErrors: {
      type: Number,
      required: true,
    },
    score: {
      type: Number,
      required: true,
    },
    duration: {
      type: Number,
      required: true, // in seconds
    },
    genre: {
      type: String,
      required: true,
    },
    rules: {
      allowBackspace: Boolean,
      numbersOnly: Boolean,
      specialCharacters: Boolean,
      timeLimit: Number,
    },
    result: {
      type: String,
      enum: ["win", "loss", "draw"],
      required: true,
    },
    rank: {
      type: Number,
      required: true,
    },
    isWinner: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
tournamentRecordSchema.index({ tournamentId: 1, userId: 1 });
tournamentRecordSchema.index({ tournamentId: 1, round: 1, rank: 1 });
tournamentRecordSchema.index({ userId: 1, createdAt: -1 });

// Compound index for leaderboard queries
tournamentRecordSchema.index({ tournamentId: 1, result: 1, score: -1 });

export default mongoose.models.TournamentRecord ||
  mongoose.model("TournamentRecord", tournamentRecordSchema);
