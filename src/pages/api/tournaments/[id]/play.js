import connectDB from "../../../../lib/mongodb";
import Tournament from "../../../../models/Tournament";
import TournamentRecord from "../../../../models/TournamentRecord";
import User from "../../../../models/User";
import { getUserFromRequest } from "../../../../lib/auth";
import mongoose from "mongoose";

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === "POST") {
    return submitTournamentScore(req, res, id);
  } else {
    return res
      .status(405)
      .json({ success: false, message: "Method not allowed" });
  }
}

async function submitTournamentScore(req, res, tournamentId) {
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

    // Check if tournament is active
    if (tournament.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Tournament is not currently active",
      });
    }

    // Check if user is a participant
    const participant = tournament.participants.find(
      (p) => p.userId.toString() === userId
    );

    if (!participant) {
      return res.status(400).json({
        success: false,
        message: "Not registered for this tournament",
      });
    }

    const {
      wpm,
      accuracy,
      wordsTyped,
      totalErrors,
      totalCharsTyped,
      duration,
      genre,
      round = 1,
    } = req.body;

    // Calculate tournament score based on theme
    let score = 0;
    switch (tournament.theme) {
      case "speed":
        score = wpm * 10;
        break;
      case "accuracy":
        score = accuracy * 2;
        break;
      case "endurance":
        score = (wpm * accuracy) / 10;
        break;
      case "mixed":
        score = (wpm * accuracy * (wordsTyped / 10)) / 100;
        break;
      default:
        score = (wpm * accuracy) / 10;
    }

    // Create tournament record
    const tournamentRecord = new TournamentRecord({
      tournamentId,
      userId: userId,
      username: participant.username,
      round,
      matchId: new mongoose.Types.ObjectId(), // Generate unique match ID
      wpm,
      accuracy,
      wordsTyped,
      totalErrors,
      score,
      duration,
      genre,
      rules: tournament.rules,
      result: "pending", // Will be determined after all participants submit
      rank: 0,
    });

    await tournamentRecord.save();

    // Update participant score in tournament
    participant.score = Math.max(participant.score, score);
    participant.wpm = Math.max(participant.wpm, wpm);
    participant.accuracy = Math.max(participant.accuracy, accuracy);

    await tournament.save();

    // Check if all participants have submitted scores for this round
    const submittedCount = await TournamentRecord.countDocuments({
      tournamentId,
      round,
    });

    // If all participants have submitted, calculate rankings
    if (submittedCount >= tournament.participants.length) {
      await calculateRoundRankings(tournamentId, round);
    }

    res.status(200).json({
      success: true,
      message: "Score submitted successfully",
      record: tournamentRecord,
      tournament,
    });
  } catch (error) {
    console.error("Error submitting tournament score:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit score",
    });
  }
}

async function calculateRoundRankings(tournamentId, round) {
  try {
    await connectDB();

    const records = await TournamentRecord.find({
      tournamentId,
      round,
    }).sort({ score: -1 });

    // Update ranks and results
    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      record.rank = i + 1;
      record.result = i === 0 ? "win" : "loss";
      record.isWinner = i === 0;
      await record.save();
    }

    // Update tournament participants with latest scores
    const tournament = await Tournament.findById(tournamentId);
    if (tournament) {
      // Sort participants by score
      tournament.participants.sort((a, b) => b.score - a.score);

      // Update ranks
      tournament.participants.forEach((participant, index) => {
        participant.rank = index + 1;
      });

      await tournament.save();

      // If this is the final round, determine winners
      if (round === 1 && tournament.type === "weekly") {
        await determineTournamentWinners(tournamentId);
      }
    }
  } catch (error) {
    console.error("Error calculating round rankings:", error);
  }
}

async function determineTournamentWinners(tournamentId) {
  try {
    await connectDB();

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament || tournament.participants.length === 0) return;

    // Sort participants by final score
    tournament.participants.sort((a, b) => b.score - a.score);

    // Set winners
    if (tournament.participants.length >= 1) {
      tournament.winners.first = tournament.participants[0].userId;
    }
    if (tournament.participants.length >= 2) {
      tournament.winners.second = tournament.participants[1].userId;
    }
    if (tournament.participants.length >= 3) {
      tournament.winners.third = tournament.participants[2].userId;
    }

    tournament.status = "completed";
    await tournament.save();
  } catch (error) {
    console.error("Error determining tournament winners:", error);
  }
}
