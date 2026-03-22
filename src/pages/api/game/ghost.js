import connectDB from "../../../lib/mongodb";
import { withAuth } from "../../../lib/withAuth";
import TypingRecord from "../../../models/TypingRecord";

async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const genre = String(req.query.genre || "").trim();
  const testDuration = Number(req.query.testDuration || 0);
  const difficulty = String(req.query.difficulty || "medium").trim();

  if (!genre || !Number.isFinite(testDuration) || testDuration <= 0) {
    return res.status(400).json({
      success: false,
      message: "genre and testDuration are required",
    });
  }

  const record = await TypingRecord.findOne({
    userId: req.user.id,
    genre,
    difficulty,
    testDuration,
  })
    .sort({ wpm: -1, accuracy: -1, timestamp: 1 })
    .select("wpm accuracy wordsTyped totalErrors totalCharsTyped testDuration genre difficulty timestamp")
    .lean();

  return res.status(200).json({
    success: true,
    ghost: record
      ? {
          id: String(record._id),
          wpm: record.wpm,
          accuracy: record.accuracy,
          wordsTyped: record.wordsTyped,
          totalErrors: record.totalErrors,
          totalCharsTyped: record.totalCharsTyped,
          testDuration: record.testDuration,
          genre: record.genre,
          difficulty: record.difficulty || "medium",
          timestamp: record.timestamp,
        }
      : null,
  });
}

export default withAuth(async (req, res) => {
  try {
    await connectDB();
    return handler(req, res);
  } catch (error) {
    console.error("Ghost API error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load ghost record",
    });
  }
});
