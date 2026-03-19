import { withAdminAuth, requirePermission } from "../../../../lib/adminAuth";
import connectDB from "../../../../lib/mongodb";
import User from "../../../../models/User";
import Tournament from "../../../../models/Tournament";
import TrainingModule from "../../../../models/TrainingModule";
import TrainingLesson from "../../../../models/TrainingLesson";
import TypingRecord from "../../../../models/TypingRecord";

const handler = async (req, res) => {
  try {
    await connectDB();

    // Get total users
    const totalUsers = await User.countDocuments();

    // Get active tournaments
    const activeTournaments = await Tournament.countDocuments({
      status: { $in: ["upcoming", "active"] },
    });

    // Get training modules
    const trainingModules = await TrainingModule.countDocuments({
      isActive: true,
    });

    // Get average WPM from recent typing records (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentRecords = await TypingRecord.find({
      timestamp: { $gte: thirtyDaysAgo },
    });

    const averageWPM =
      recentRecords.length > 0
        ? Math.round(
            recentRecords.reduce((sum, record) => sum + record.wpm, 0) /
              recentRecords.length
          )
        : 0;

    // Calculate growth percentages (mock data for now)
    const userGrowth = "12%";
    const tournamentGrowth = "5%";
    const trainingGrowth = "8%";
    const wpmGrowth = "3%";

    // Get additional stats
    const totalTournaments = await Tournament.countDocuments();
    const totalTrainingLessons = await TrainingLesson.countDocuments({
      isActive: true,
    });
    const totalTypingRecords = await TypingRecord.countDocuments();

    // Get user registration stats (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const newUsersThisWeek = await User.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
    });

    // Get top performers
    const topPerformers = await User.find()
      .sort({ "stats.bestWPM": -1 })
      .limit(5)
      .select("username stats.bestWPM stats.bestAccuracy");

    // WPM distribution by user best WPM
    const usersForDistribution = await User.find()
      .select("stats.bestWPM")
      .lean();

    const wpmBuckets = [
      { label: "0-30 WPM", min: 0, max: 30, count: 0 },
      { label: "30-50 WPM", min: 30, max: 50, count: 0 },
      { label: "50-70 WPM", min: 50, max: 70, count: 0 },
      { label: "70-90 WPM", min: 70, max: 90, count: 0 },
      { label: "90-120 WPM", min: 90, max: 120, count: 0 },
      { label: "120+ WPM", min: 120, max: Infinity, count: 0 },
    ];

    usersForDistribution.forEach((user) => {
      const wpm = user?.stats?.bestWPM || 0;
      const bucket = wpmBuckets.find((item) => wpm >= item.min && wpm < item.max);
      if (bucket) {
        bucket.count += 1;
      }
    });

    const wpmDistribution = wpmBuckets.map((item) => ({
      label: item.label,
      value: item.count,
    }));

    res.status(200).json({
      success: true,
      totalUsers,
      activeTournaments,
      trainingModules,
      averageWPM,
      userGrowth,
      tournamentGrowth,
      trainingGrowth,
      wpmGrowth,
      totalTournaments,
      totalTrainingLessons,
      totalTypingRecords,
      newUsersThisWeek,
      topPerformers,
      wpmDistribution,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard statistics",
    });
  }
};

export default withAdminAuth(requirePermission("analyticsAccess")(handler));
