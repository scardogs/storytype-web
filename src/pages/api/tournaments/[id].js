import connectDB from "../../../lib/mongodb";
import Tournament from "../../../models/Tournament";
import TournamentRecord from "../../../models/TournamentRecord";
import { getUserFromRequest } from "../../../lib/auth";
import { updateTournamentStatuses } from "../../../lib/tournamentStatus";

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === "GET") {
    return getTournament(req, res, id);
  } else if (req.method === "PUT") {
    return updateTournament(req, res, id);
  } else if (req.method === "DELETE") {
    return deleteTournament(req, res, id);
  } else {
    return res
      .status(405)
      .json({ success: false, message: "Method not allowed" });
  }
}

async function getTournament(req, res, tournamentId) {
  try {
    await connectDB();
    await updateTournamentStatuses();

    const tournament = await Tournament.findById(tournamentId)
      .populate("createdBy", "username profilePicture")
      .populate("participants.userId", "username profilePicture")
      .populate("winners.first", "username profilePicture")
      .populate("winners.second", "username profilePicture")
      .populate("winners.third", "username profilePicture");

    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: "Tournament not found",
      });
    }

    // Get tournament records if tournament is active or completed
    let records = [];
    if (tournament.status === "active" || tournament.status === "completed") {
      records = await TournamentRecord.find({ tournamentId })
        .populate("userId", "username profilePicture")
        .sort({ round: -1, rank: 1 });
    }

    res.status(200).json({
      success: true,
      tournament,
      records,
    });
  } catch (error) {
    console.error("Error fetching tournament:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch tournament",
    });
  }
}

async function updateTournament(req, res, tournamentId) {
  try {
    await connectDB();

    const userId = await getUserFromRequest(req);
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });
    }

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: "Tournament not found",
      });
    }

    // Check if user is the creator or admin
    if (tournament.createdBy.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this tournament",
      });
    }

    const updates = req.body;

    // Remove fields that shouldn't be updated directly
    delete updates._id;
    delete updates.createdAt;
    delete updates.updatedAt;
    delete updates.createdBy;
    delete updates.participants;
    delete updates.winners;

    const updatedTournament = await Tournament.findByIdAndUpdate(
      tournamentId,
      updates,
      { new: true, runValidators: true }
    ).populate("createdBy", "username profilePicture");

    res.status(200).json({
      success: true,
      tournament: updatedTournament,
    });
  } catch (error) {
    console.error("Error updating tournament:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update tournament",
    });
  }
}

async function deleteTournament(req, res, tournamentId) {
  try {
    await connectDB();

    const userId = await getUserFromRequest(req);
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });
    }

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: "Tournament not found",
      });
    }

    // Check if user is the creator
    if (tournament.createdBy.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this tournament",
      });
    }

    // Can only delete upcoming tournaments
    if (tournament.status !== "upcoming") {
      return res.status(400).json({
        success: false,
        message: "Can only delete upcoming tournaments",
      });
    }

    await Tournament.findByIdAndDelete(tournamentId);

    res.status(200).json({
      success: true,
      message: "Tournament deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting tournament:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete tournament",
    });
  }
}
