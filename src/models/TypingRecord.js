import mongoose from "mongoose";

const TypingRecordSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    wpm: {
      type: Number,
      required: true,
      min: 0,
    },
    accuracy: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    wordsTyped: {
      type: Number,
      required: true,
      min: 0,
    },
    totalErrors: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    totalCharsTyped: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    testDuration: {
      type: Number,
      required: true,
      min: 0,
    },
    genre: {
      type: String,
      enum: ["Fantasy", "Mystery", "Sci-Fi", "Romance"],
      default: "Fantasy",
    },
    mistakeChars: [
      {
        key: {
          type: String,
          trim: true,
          maxlength: 16,
        },
        count: {
          type: Number,
          min: 0,
          default: 0,
        },
      },
    ],
    mistakePatterns: [
      {
        key: {
          type: String,
          trim: true,
          maxlength: 32,
        },
        count: {
          type: Number,
          min: 0,
          default: 0,
        },
      },
    ],
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
TypingRecordSchema.index({ userId: 1, timestamp: -1 });
TypingRecordSchema.index({ userId: 1, genre: 1, timestamp: -1 });
TypingRecordSchema.index({ userId: 1, genre: 1, testDuration: 1, timestamp: -1 });
TypingRecordSchema.index({ timestamp: -1, wpm: -1 });

export default mongoose.models.TypingRecord ||
  mongoose.model("TypingRecord", TypingRecordSchema);
