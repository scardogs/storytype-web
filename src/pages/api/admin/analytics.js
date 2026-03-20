import { withAdminAuth, requirePermission } from "../../../lib/adminAuth";
import connectDB from "../../../lib/mongodb";
import User from "../../../models/User";
import Tournament from "../../../models/Tournament";
import TrainingModule from "../../../models/TrainingModule";
import TrainingLesson from "../../../models/TrainingLesson";
import TypingRecord from "../../../models/TypingRecord";

const handler = async (req, res) => {
  try {
    await connectDB();

    const { timeRange = "30days", activityPage = "1", activityLimit = "10" } = req.query;
    const parsedActivityPage = Math.max(parseInt(activityPage, 10) || 1, 1);
    const parsedActivityLimit = Math.min(
      Math.max(parseInt(activityLimit, 10) || 10, 1),
      50
    );

    // Calculate date range
    const now = new Date();
    let startDate;

    switch (timeRange) {
      case "7days":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30days":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "90days":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case "1year":
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get overview statistics
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({
      stats: { totalGamesPlayed: { $gt: 0 } },
    });

    const newUsersInPeriod = await User.countDocuments({
      createdAt: { $gte: startDate },
    });

    const totalTests = await TypingRecord.countDocuments();
    const testsInPeriod = await TypingRecord.countDocuments({
      timestamp: { $gte: startDate },
    });

    // Calculate average WPM
    const avgWPMResult = await TypingRecord.aggregate([
      { $match: { timestamp: { $gte: startDate } } },
      { $group: { _id: null, avgWPM: { $avg: "$wpm" } } },
    ]);
    const averageWPM =
      avgWPMResult.length > 0 ? Math.round(avgWPMResult[0].avgWPM) : 0;

    // Get top performers
    const topPerformers = await User.find()
      .sort({ "stats.bestWPM": -1 })
      .limit(10)
      .select(
        "username stats.bestWPM stats.bestAccuracy stats.totalGamesPlayed"
      );

    // Get performance distribution
    const performanceDistribution = await User.aggregate([
      {
        $bucket: {
          groupBy: "$stats.bestWPM",
          boundaries: [0, 31, 51, 71, 91, 200],
          default: "Other",
          output: {
            count: { $sum: 1 },
          },
        },
      },
    ]);

    const distribution = {
      beginner: performanceDistribution.find((b) => b._id === 0)?.count || 0,
      intermediate:
        performanceDistribution.find((b) => b._id === 31)?.count || 0,
      advanced: performanceDistribution.find((b) => b._id === 51)?.count || 0,
      expert: performanceDistribution.find((b) => b._id === 71)?.count || 0,
      master: performanceDistribution.find((b) => b._id === 91)?.count || 0,
    };

    // Get activity patterns
    const hourlyActivity = await TypingRecord.aggregate([
      { $match: { timestamp: { $gte: startDate } } },
      {
        $group: {
          _id: { $hour: "$timestamp" },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const dailyActivity = await TypingRecord.aggregate([
      { $match: { timestamp: { $gte: startDate } } },
      {
        $group: {
          _id: { $dayOfWeek: "$timestamp" },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const peakHour = hourlyActivity.length > 0 ? hourlyActivity[0]._id : 14;
    const mostActiveDay =
      dailyActivity.length > 0 ? dayNames[dailyActivity[0]._id - 1] : "Tuesday";

    // Get recent activity
    // Recent activity should show latest records globally (not limited by timeRange filter)
    const recentActivityFilter = {};
    const totalRecentActivity = await TypingRecord.countDocuments(recentActivityFilter);
    const totalActivityPages = Math.max(
      1,
      Math.ceil(totalRecentActivity / parsedActivityLimit)
    );
    const normalizedActivityPage = Math.min(parsedActivityPage, totalActivityPages);

    const recentActivity = await TypingRecord.find(recentActivityFilter)
      .sort({ timestamp: -1 })
      .skip((normalizedActivityPage - 1) * parsedActivityLimit)
      .limit(parsedActivityLimit)
      .populate("userId", "username")
      .select("userId wpm accuracy timestamp");

    const activityList = recentActivity.map((record) => ({
      username: record.userId?.username || "Unknown",
      type: "test",
      timestamp: new Date(record.timestamp).toLocaleString(),
      details: `${record.wpm} WPM, ${record.accuracy}% accuracy`,
    }));

    // Get content usage (mock data for now)
    const popularContent = [
      {
        title: "Fantasy Adventure",
        type: "Story",
        usageCount: 1250,
        avgWPM: 45,
      },
      {
        title: "Mystery Detective",
        type: "Story",
        usageCount: 980,
        avgWPM: 42,
      },
      { title: "Sci-Fi Journey", type: "Story", usageCount: 850, avgWPM: 48 },
      { title: "Romance Tale", type: "Story", usageCount: 720, avgWPM: 40 },
    ];

    // Get module usage
    const moduleUsage = await TrainingModule.aggregate([
      {
        $lookup: {
          from: "trainingprogresses",
          localField: "_id",
          foreignField: "moduleId",
          as: "progress",
        },
      },
      {
        $project: {
          title: 1,
          category: 1,
          totalUsers: { $size: "$progress" },
          completedUsers: {
            $size: {
              $filter: {
                input: "$progress",
                as: "entry",
                cond: {
                  $in: ["$$entry.status", ["completed", "mastered"]],
                },
              },
            },
          },
          completionRate: {
            $cond: [
              { $gt: [{ $size: "$progress" }, 0] },
              {
                $round: [
                  {
                    $multiply: [
                      {
                        $divide: [
                          {
                            $size: {
                              $filter: {
                                input: "$progress",
                                as: "entry",
                                cond: {
                                  $in: ["$$entry.status", ["completed", "mastered"]],
                                },
                              },
                            },
                          },
                          { $size: "$progress" },
                        ],
                      },
                      100,
                    ],
                  },
                  0,
                ],
              },
              0,
            ],
          },
        },
      },
      { $sort: { totalUsers: -1 } },
      { $limit: 10 },
    ]);

    // Get database statistics
    const dbStats = {
      totalRecords: await TypingRecord.countDocuments(),
      avgQueryTime: "5ms",
      storageUsed: "2.1GB",
      connections: 12,
    };

    // Calculate growth percentages (mock calculations)
    const userGrowth =
      newUsersInPeriod > 0
        ? `${Math.round((newUsersInPeriod / totalUsers) * 100)}%`
        : "0%";
    const testGrowth =
      testsInPeriod > 0
        ? `${Math.round((testsInPeriod / totalTests) * 100)}%`
        : "0%";

    const analyticsData = {
      overview: {
        totalUsers,
        activeUsers,
        totalTests,
        averageWPM,
        userGrowth,
        activeUserGrowth: "5%",
        testGrowth,
        wpmGrowth: "3%",
      },
      topPerformers: topPerformers.map((user) => ({
        username: user.username,
        bestWPM: user.stats.bestWPM,
        bestAccuracy: user.stats.bestAccuracy,
        totalTests: user.stats.totalGamesPlayed,
      })),
      performanceDistribution: distribution,
      activityPatterns: {
        peakHours: `${peakHour}:00 - ${peakHour + 2}:00`,
        mostActiveDay,
        avgSessionDuration: "15 min",
      },
      recentActivity: activityList,
      recentActivityPagination: {
        page: normalizedActivityPage,
        limit: parsedActivityLimit,
        total: totalRecentActivity,
        totalPages: totalActivityPages,
      },
      popularContent,
      moduleUsage,
      dbStats,
    };

    res.status(200).json({
      success: true,
      ...analyticsData,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch analytics data",
    });
  }
};

export default withAdminAuth(requirePermission("analyticsAccess")(handler));
