import { withAdminAuth, requirePermission } from "../../../../lib/adminAuth";
import connectDB from "../../../../lib/mongodb";
import User from "../../../../models/User";

const handler = async (req, res) => {
  try {
    await connectDB();

    const {
      page = 1,
      limit = 50,
      search = "",
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const searchRegex = new RegExp(search, "i");

    // Build query
    const query = search
      ? {
          $or: [{ username: searchRegex }, { email: searchRegex }],
        }
      : {};

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Get users with pagination
    const users = await User.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select("-password");

    // Get total count for pagination
    const totalUsers = await User.countDocuments(query);

    // Get additional statistics
    const stats = {
      totalUsers,
      activeUsers: await User.countDocuments({
        stats: { totalGamesPlayed: { $gt: 0 } },
      }),
      newUsersThisWeek: await User.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      }),
      averageWPM: await User.aggregate([
        { $match: { "stats.averageWPM": { $gt: 0 } } },
        { $group: { _id: null, avgWPM: { $avg: "$stats.averageWPM" } } },
      ]),
    };

    res.status(200).json({
      success: true,
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalUsers,
        pages: Math.ceil(totalUsers / parseInt(limit)),
      },
      stats,
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};

export default withAdminAuth(requirePermission("userManagement")(handler));
