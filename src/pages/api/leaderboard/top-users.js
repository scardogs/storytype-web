import connectDB from "../../../lib/mongodb";
import User from "../../../models/User";

/**
 * Get top users by various metrics
 * GET /api/leaderboard/top-users?metric=bestWPM&limit=50
 */
export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await connectDB();

    const { metric = "bestWPM", limit = "50" } = req.query;
    const limitNum = Math.min(parseInt(limit), 100); // Max 100 users

    let sortField;
    switch (metric) {
      case "bestWPM":
        sortField = { "stats.bestWPM": -1 };
        break;
      case "averageWPM":
        sortField = { "stats.averageWPM": -1 };
        break;
      case "bestAccuracy":
        sortField = { "stats.bestAccuracy": -1 };
        break;
      case "totalGames":
        sortField = { "stats.totalGamesPlayed": -1 };
        break;
      case "totalWords":
        sortField = { "stats.totalWordsTyped": -1 };
        break;
      default:
        sortField = { "stats.bestWPM": -1 };
    }

    // Fetch top users
    const users = await User.find({
      "stats.totalGamesPlayed": { $gt: 0 }, // Only users who have played
    })
      .sort(sortField)
      .limit(limitNum)
      .select("username profilePicture stats createdAt")
      .lean();

    // Format response with rankings
    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      userId: user._id,
      username: user.username,
      profilePicture: user.profilePicture,
      stats: {
        bestWPM: user.stats.bestWPM || 0,
        averageWPM: user.stats.averageWPM || 0,
        bestAccuracy: user.stats.bestAccuracy || 0,
        totalGamesPlayed: user.stats.totalGamesPlayed || 0,
        totalWordsTyped: user.stats.totalWordsTyped || 0,
      },
      memberSince: user.createdAt,
    }));

    return res.status(200).json({
      success: true,
      metric,
      leaderboard,
      total: users.length,
    });
  } catch (error) {
    console.error("Leaderboard error:", error);
    return res.status(500).json({ message: "Server error. Please try again." });
  }
}
