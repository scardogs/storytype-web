import connectDB from "../../../lib/mongodb";
import { withAuth } from "../../../lib/withAuth";
import TypingRecord from "../../../models/TypingRecord";
import { isProUser } from "../../../lib/pro";

async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  if (!isProUser(req.user)) {
    return res.status(403).json({
      success: false,
      locked: true,
      message: "StoryType Pro is required for ghost history.",
    });
  }

  const genre = String(req.query.genre || "").trim();
  const testDuration = Number(req.query.testDuration || 0);
  const limit = Math.min(20, Math.max(1, Number(req.query.limit || 10)));

  const query = { userId: req.user.id };
  if (genre) {
    query.genre = genre;
  }
  if (Number.isFinite(testDuration) && testDuration > 0) {
    query.testDuration = testDuration;
  }

  const records = await TypingRecord.find(query)
    .sort({ timestamp: -1 })
    .limit(limit)
    .select("wpm accuracy wordsTyped totalErrors totalCharsTyped testDuration genre timestamp")
    .lean();

  return res.status(200).json({
    success: true,
    records: records.map((record) => ({
      id: String(record._id),
      wpm: record.wpm,
      accuracy: record.accuracy,
      wordsTyped: record.wordsTyped,
      totalErrors: record.totalErrors,
      totalCharsTyped: record.totalCharsTyped,
      testDuration: record.testDuration,
      genre: record.genre,
      timestamp: record.timestamp,
    })),
  });
}

export default withAuth(async (req, res) => {
  try {
    await connectDB();
    return handler(req, res);
  } catch (error) {
    console.error("Ghost history API error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load ghost history",
    });
  }
});
