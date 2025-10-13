import { withAuth } from "../../../lib/withAuth";
import User from "../../../models/User";
import TypingRecord from "../../../models/TypingRecord";

/**
 * Protected API route for saving game scores
 * POST /api/game/save-score
 *
 * Body: {
 *   wpm: number,
 *   accuracy: number,
 *   wordsTyped: number,
 *   totalErrors: number,
 *   totalCharsTyped: number,
 *   testDuration: number,
 *   genre: string
 * }
 */
async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { 
      wpm, 
      accuracy, 
      wordsTyped, 
      totalErrors = 0,
      totalCharsTyped = 0,
      testDuration = 30,
      genre = 'Fantasy'
    } = req.body;
    const userId = req.user.id;

    // Validate input
    if (
      typeof wpm !== "number" ||
      typeof accuracy !== "number" ||
      typeof wordsTyped !== "number"
    ) {
      return res.status(400).json({ message: "Invalid input data" });
    }

    if (wpm < 0 || accuracy < 0 || accuracy > 100 || wordsTyped < 0) {
      return res.status(400).json({ message: "Invalid score values" });
    }

    // Find user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create individual typing record
    const typingRecord = await TypingRecord.create({
      userId,
      wpm,
      accuracy,
      wordsTyped,
      totalErrors,
      totalCharsTyped,
      testDuration,
      genre,
    });

    // Update user statistics
    user.stats.totalGamesPlayed += 1;
    user.stats.totalWordsTyped += wordsTyped;

    // Update best WPM
    if (wpm > user.stats.bestWPM) {
      user.stats.bestWPM = wpm;
    }

    // Update best accuracy
    if (accuracy > user.stats.bestAccuracy) {
      user.stats.bestAccuracy = accuracy;
    }

    // Calculate new average WPM
    const totalWPM =
      user.stats.averageWPM * (user.stats.totalGamesPlayed - 1) + wpm;
    user.stats.averageWPM = Math.round(totalWPM / user.stats.totalGamesPlayed);

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Score saved successfully",
      stats: user.stats,
      record: {
        id: typingRecord._id,
        wpm: typingRecord.wpm,
        accuracy: typingRecord.accuracy,
        timestamp: typingRecord.timestamp,
      },
    });
  } catch (error) {
    console.error("Save score error:", error);
    return res.status(500).json({ message: "Server error. Please try again." });
  }
}

// Wrap handler with authentication middleware
export default withAuth(handler);
