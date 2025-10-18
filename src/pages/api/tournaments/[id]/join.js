import connectDB from "../../../../lib/mongodb";
import Tournament from "../../../../models/Tournament";
import User from "../../../../models/User";
import { getUserFromRequest } from "../../../../lib/auth";

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === "POST") {
    return joinTournament(req, res, id);
  } else if (req.method === "DELETE") {
    return leaveTournament(req, res, id);
  } else {
    return res
      .status(405)
      .json({ success: false, message: "Method not allowed" });
  }
}

async function joinTournament(req, res, tournamentId) {
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

    // Check if tournament is accepting registrations
    if (!tournament.canRegister) {
      return res.status(400).json({
        success: false,
        message: "Tournament registration is closed",
      });
    }

    // Check if user is already registered
    const existingParticipant = tournament.participants.find(
      (p) => p.userId.toString() === userId
    );

    if (existingParticipant) {
      return res.status(400).json({
        success: false,
        message: "Already registered for this tournament",
      });
    }

    // Get user details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Add participant
    tournament.participants.push({
      userId: userId,
      username: user.username,
      joinedAt: new Date(),
    });

    await tournament.save();
    await tournament.populate("participants.userId", "username profilePicture");

    res.status(200).json({
      success: true,
      message: "Successfully joined tournament",
      tournament,
    });
  } catch (error) {
    console.error("Error joining tournament:", error);
    res.status(500).json({
      success: false,
      message: "Failed to join tournament",
    });
  }
}

async function leaveTournament(req, res, tournamentId) {
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

    // Check if tournament is still accepting registrations
    if (tournament.status !== "upcoming") {
      return res.status(400).json({
        success: false,
        message: "Cannot leave tournament after it has started",
      });
    }

    // Remove participant
    tournament.participants = tournament.participants.filter(
      (p) => p.userId.toString() !== userId
    );

    await tournament.save();

    res.status(200).json({
      success: true,
      message: "Successfully left tournament",
      tournament,
    });
  } catch (error) {
    console.error("Error leaving tournament:", error);
    res.status(500).json({
      success: false,
      message: "Failed to leave tournament",
    });
  }
}
