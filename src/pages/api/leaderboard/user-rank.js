import { withAuth } from "../../../lib/withAuth";
import User from "../../../models/User";

/**
 * Get current user's rank in leaderboard
 * GET /api/leaderboard/user-rank?metric=bestWPM
 */
async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const userId = req.user.id;
    const { metric = "bestWPM" } = req.query;

    const currentUser = await User.findById(userId).select("stats");

    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    let userValue;
    let fieldPath;

    switch (metric) {
      case "bestWPM":
        userValue = currentUser.stats.bestWPM || 0;
        fieldPath = "stats.bestWPM";
        break;
      case "averageWPM":
        userValue = currentUser.stats.averageWPM || 0;
        fieldPath = "stats.averageWPM";
        break;
      case "bestAccuracy":
        userValue = currentUser.stats.bestAccuracy || 0;
        fieldPath = "stats.bestAccuracy";
        break;
      case "totalGames":
        userValue = currentUser.stats.totalGamesPlayed || 0;
        fieldPath = "stats.totalGamesPlayed";
        break;
      case "totalWords":
        userValue = currentUser.stats.totalWordsTyped || 0;
        fieldPath = "stats.totalWordsTyped";
        break;
      default:
        userValue = currentUser.stats.bestWPM || 0;
        fieldPath = "stats.bestWPM";
    }

    // Count users with better score
    const betterUsers = await User.countDocuments({
      [fieldPath]: { $gt: userValue },
      "stats.totalGamesPlayed": { $gt: 0 },
    });

    const rank = betterUsers + 1;

    // Get total users who have played
    const totalUsers = await User.countDocuments({
      "stats.totalGamesPlayed": { $gt: 0 },
    });

    // Calculate percentile
    const percentile =
      totalUsers > 0
        ? Math.round(((totalUsers - rank + 1) / totalUsers) * 100)
        : 0;

    return res.status(200).json({
      success: true,
      rank,
      totalUsers,
      percentile,
      value: userValue,
      metric,
    });
  } catch (error) {
    console.error("User rank error:", error);
    return res.status(500).json({ message: "Server error. Please try again." });
  }
}

export default withAuth(handler);
