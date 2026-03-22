import { withAuth } from "../../../lib/withAuth";
import TypingRecord from "../../../models/TypingRecord";

/**
 * Get user's typing records with optional filters
 * GET /api/analytics/records?limit=50&days=30&genre=Fantasy
 */

async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const userId = req.user.id;
    const { limit = "50", days, genre } = req.query;

    // Build query
    const query = { userId };

    // Filter by date range if specified
    if (days) {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(days));
      query.timestamp = { $gte: daysAgo };
    }

    // Filter by genre if specified
    if (genre && genre !== "all") {
      query.genre = genre;
    }

    // Fetch records
    const records = await TypingRecord.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .select(
        "wpm accuracy wordsTyped totalErrors totalCharsTyped testDuration genre difficulty timestamp"
      )
      .lean();

    return res.status(200).json({
      success: true,
      records,
      count: records.length,
    });
  } catch (error) {
    console.error("Get records error:", error);
    return res.status(500).json({ message: "Server error. Please try again." });
  }
}

export default withAuth(handler);
