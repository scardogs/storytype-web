import { withAdminAuth, requirePermission } from "../../../../lib/adminAuth";
import connectDB from "../../../../lib/mongodb";
import Tournament from "../../../../models/Tournament";

const handler = async (req, res) => {
  if (req.method === "GET") {
    return getTournaments(req, res);
  } else if (req.method === "POST") {
    return createTournament(req, res);
  } else {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }
};

const getTournaments = withAdminAuth(
  requirePermission("tournamentManagement")(async (req, res) => {
    try {
      await connectDB();

      const {
        page = 1,
        limit = 50,
        search = "",
        status = "",
        sortBy = "createdAt",
        sortOrder = "desc",
      } = req.query;

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const searchRegex = new RegExp(search, "i");

      // Build query
      const query = {};

      if (search) {
        query.$or = [{ name: searchRegex }, { description: searchRegex }];
      }

      if (status) {
        query.status = status;
      }

      // Build sort object
      const sort = {};
      sort[sortBy] = sortOrder === "desc" ? -1 : 1;

      // Get tournaments with pagination
      const tournaments = await Tournament.find(query)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .populate("createdBy", "username")
        .populate("participants.userId", "username");

      // Get total count for pagination
      const totalTournaments = await Tournament.countDocuments(query);

      // Get tournament statistics
      const stats = {
        totalTournaments,
        activeTournaments: await Tournament.countDocuments({
          status: "active",
        }),
        upcomingTournaments: await Tournament.countDocuments({
          status: "upcoming",
        }),
        completedTournaments: await Tournament.countDocuments({
          status: "completed",
        }),
        totalParticipants: await Tournament.aggregate([
          {
            $group: { _id: null, total: { $sum: { $size: "$participants" } } },
          },
        ]),
      };

      res.status(200).json({
        success: true,
        tournaments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalTournaments,
          pages: Math.ceil(totalTournaments / parseInt(limit)),
        },
        stats,
      });
    } catch (error) {
      console.error("Get tournaments error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch tournaments",
      });
    }
  })
);

const createTournament = withAdminAuth(
  requirePermission("tournamentManagement")(async (req, res) => {
    try {
      await connectDB();

      const tournamentData = {
        ...req.body,
        createdBy: req.admin._id, // Set the admin as the creator
      };

      const tournament = new Tournament(tournamentData);
      await tournament.save();

      // Populate the created tournament
      await tournament.populate("createdBy", "username");

      res.status(201).json({
        success: true,
        message: "Tournament created successfully",
        tournament,
      });
    } catch (error) {
      console.error("Create tournament error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create tournament",
      });
    }
  })
);

export default handler;
