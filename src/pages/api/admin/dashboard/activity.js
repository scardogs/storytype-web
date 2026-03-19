import { withAdminAuth, requirePermission } from "../../../../lib/adminAuth";
import connectDB from "../../../../lib/mongodb";
import User from "../../../../models/User";
import Tournament from "../../../../models/Tournament";
import TypingRecord from "../../../../models/TypingRecord";

const handler = async (req, res) => {
  try {
    await connectDB();

    const activities = [];

    // Get recent user registrations (last 10)
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("username createdAt");

    recentUsers.forEach((user) => {
      activities.push({
        action: `New user registered: ${user.username}`,
        type: "user",
        timestamp: new Date(user.createdAt).toLocaleString(),
      });
    });

    // Get recent tournaments created
    const recentTournaments = await Tournament.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .select("name createdAt createdBy")
      .populate("createdBy", "username");

    recentTournaments.forEach((tournament) => {
      activities.push({
        action: `Tournament created: ${tournament.name}`,
        type: "tournament",
        timestamp: new Date(tournament.createdAt).toLocaleString(),
      });
    });

    // Get high score achievements (recent typing records with high WPM)
    const highScores = await TypingRecord.find({
      wpm: { $gte: 80 }, // High WPM threshold
      timestamp: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, // Last 7 days
    })
      .sort({ timestamp: -1 })
      .limit(3)
      .populate("userId", "username");

    highScores.forEach((record) => {
      activities.push({
        action: `${record.userId.username} achieved ${record.wpm} WPM`,
        type: "achievement",
        timestamp: new Date(record.timestamp).toLocaleString(),
      });
    });

    // Sort activities by timestamp (most recent first)
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Return only the most recent 10 activities
    const recentActivities = activities.slice(0, 10);

    res.status(200).json({
      success: true,
      activities: recentActivities,
    });
  } catch (error) {
    console.error("Dashboard activity error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch recent activity",
    });
  }
};

export default withAdminAuth(requirePermission("analyticsAccess")(handler));
