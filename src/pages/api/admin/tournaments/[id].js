import { withAdminAuth, requirePermission } from "../../../../lib/adminAuth";
import connectDB from "../../../../lib/mongodb";
import Tournament from "../../../../models/Tournament";

export default async function handler(req, res) {
  if (req.method === "GET") {
    return getTournament(req, res);
  } else if (req.method === "PUT") {
    return updateTournament(req, res);
  } else if (req.method === "DELETE") {
    return deleteTournament(req, res);
  } else {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }
}

const getTournament = withAdminAuth(
  requirePermission("tournamentManagement")(async (req, res) => {
    try {
      await connectDB();

      const { id } = req.query;

      const tournament = await Tournament.findById(id)
        .populate("createdBy", "username")
        .populate("participants.userId", "username")
        .populate("winners.first", "username")
        .populate("winners.second", "username")
        .populate("winners.third", "username");

      if (!tournament) {
        return res.status(404).json({
          success: false,
          message: "Tournament not found",
        });
      }

      res.status(200).json({
        success: true,
        tournament,
      });
    } catch (error) {
      console.error("Get tournament error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch tournament details",
      });
    }
  })
);

const updateTournament = withAdminAuth(
  requirePermission("tournamentManagement")(async (req, res) => {
    try {
      await connectDB();

      const { id } = req.query;
      const updateData = req.body;

      // Remove fields that shouldn't be updated directly
      delete updateData._id;
      delete updateData.createdAt;
      delete updateData.createdBy;

      const tournament = await Tournament.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      ).populate("createdBy", "username");

      if (!tournament) {
        return res.status(404).json({
          success: false,
          message: "Tournament not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Tournament updated successfully",
        tournament,
      });
    } catch (error) {
      console.error("Update tournament error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update tournament",
      });
    }
  })
);

const deleteTournament = withAdminAuth(
  requirePermission("tournamentManagement")(async (req, res) => {
    try {
      await connectDB();

      const { id } = req.query;

      const tournament = await Tournament.findById(id);
      if (!tournament) {
        return res.status(404).json({
          success: false,
          message: "Tournament not found",
        });
      }

      // Check if tournament has participants
      if (tournament.participants.length > 0) {
        return res.status(400).json({
          success: false,
          message:
            "Cannot delete tournament with participants. Please remove all participants first.",
        });
      }

      await Tournament.findByIdAndDelete(id);

      res.status(200).json({
        success: true,
        message: "Tournament deleted successfully",
      });
    } catch (error) {
      console.error("Delete tournament error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete tournament",
      });
    }
  })
);
