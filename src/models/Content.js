import mongoose from "mongoose";

const contentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    content: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["story", "quote", "article", "practice_text", "poem", "code"],
      required: true,
    },
    genre: {
      type: String,
      enum: [
        "fantasy",
        "mystery",
        "sci-fi",
        "romance",
        "horror",
        "adventure",
        "comedy",
        "drama",
        "general",
      ],
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced", "expert"],
      required: true,
    },
    wordCount: {
      type: Number,
      required: true,
    },
    characterCount: {
      type: Number,
      required: true,
    },
    estimatedTime: {
      type: Number, // in seconds
      required: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    author: {
      type: String,
      default: "Anonymous",
    },
    source: {
      type: String,
      default: "Original",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    usageCount: {
      type: Number,
      default: 0,
    },
    averageWPM: {
      type: Number,
      default: 0,
    },
    averageAccuracy: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    lastModifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
contentSchema.index({ type: 1, genre: 1 });
contentSchema.index({ difficulty: 1, isActive: 1 });
contentSchema.index({ tags: 1 });
contentSchema.index({ isFeatured: 1, isActive: 1 });
contentSchema.index({ usageCount: -1 });
contentSchema.index({ createdAt: -1 });

// Virtual for estimated reading time in minutes
contentSchema.virtual("estimatedReadingTimeMinutes").get(function () {
  return Math.ceil(this.estimatedTime / 60);
});

// Pre-save middleware to calculate word and character counts
contentSchema.pre("save", function (next) {
  if (this.isModified("content")) {
    this.wordCount = this.content.trim().split(/\s+/).length;
    this.characterCount = this.content.length;
    this.estimatedTime = Math.round((this.wordCount / 5) * 60); // Assuming 5 words per minute average
  }
  next();
});

// Method to increment usage count
contentSchema.methods.incrementUsage = function () {
  this.usageCount += 1;
  return this.save();
};

// Method to update performance metrics
contentSchema.methods.updatePerformanceMetrics = function (wpm, accuracy) {
  // Update average WPM and accuracy using weighted average
  const totalUses = this.usageCount;
  if (totalUses > 0) {
    this.averageWPM = Math.round(
      (this.averageWPM * (totalUses - 1) + wpm) / totalUses
    );
    this.averageAccuracy = Math.round(
      (this.averageAccuracy * (totalUses - 1) + accuracy) / totalUses
    );
  } else {
    this.averageWPM = wpm;
    this.averageAccuracy = accuracy;
  }
  return this.save();
};

export default mongoose.models.Content ||
  mongoose.model("Content", contentSchema);
