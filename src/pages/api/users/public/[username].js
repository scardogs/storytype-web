import connectDB from "../../../../lib/mongodb";
import { getUserFromRequest } from "../../../../lib/auth";
import User from "../../../../models/User";
import TypingRecord from "../../../../models/TypingRecord";
import TournamentRecord from "../../../../models/TournamentRecord";
import TrainingProgress from "../../../../models/TrainingProgress";
import FriendRequest from "../../../../models/FriendRequest";

function buildAchievements({
  user,
  tournamentWins,
  masteredLessonsCount,
  favoriteGenre,
}) {
  const achievements = [];

  if ((user.stats?.bestWPM || 0) >= 100) {
    achievements.push({
      id: "speed-demon",
      title: "Speed Demon",
      description: "Reached 100 WPM or higher.",
      color: "orange",
    });
  }

  if ((user.stats?.bestAccuracy || 0) >= 98) {
    achievements.push({
      id: "precision-master",
      title: "Precision Master",
      description: "Hit 98% accuracy or better.",
      color: "green",
    });
  }

  if ((user.stats?.longestDailyChallengeStreak || 0) >= 7) {
    achievements.push({
      id: "daily-grinder",
      title: "Daily Grinder",
      description: "Maintained a 7-day daily challenge streak.",
      color: "teal",
    });
  }

  if (tournamentWins > 0) {
    achievements.push({
      id: "tournament-winner",
      title: "Tournament Winner",
      description: "Won at least one tournament.",
      color: "purple",
    });
  }

  if (masteredLessonsCount >= 5) {
    achievements.push({
      id: "lesson-master",
      title: "Lesson Master",
      description: "Mastered 5 or more training lessons.",
      color: "blue",
    });
  }

  if ((user.stats?.totalWordsTyped || 0) >= 10000) {
    achievements.push({
      id: "prolific-typist",
      title: "Prolific Typist",
      description: "Typed more than 10,000 words.",
      color: "pink",
    });
  }

  if (favoriteGenre) {
    achievements.push({
      id: "genre-specialist",
      title: `${favoriteGenre} Specialist`,
      description: `Most active in ${favoriteGenre} sessions.`,
      color: "cyan",
    });
  }

  return achievements;
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    await connectDB();

    const username = String(req.query.username || "").trim();

    if (!username) {
      return res.status(400).json({
        success: false,
        message: "Username is required",
      });
    }

    const user = await User.findOne({ username })
      .select("username email profilePicture stats createdAt plan proStatus")
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const userId = user._id;
    const viewerId = await getUserFromRequest(req);

    const [
      favoriteGenreResult,
      recentRecords,
      recentTournamentRecords,
      tournamentWins,
      podiumCount,
      masteredLessons,
      masteredLessonsCount,
      relationshipRequest,
    ] = await Promise.all([
      TypingRecord.aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: "$genre",
            sessions: { $sum: 1 },
            avgWpm: { $avg: "$wpm" },
          },
        },
        { $sort: { sessions: -1, avgWpm: -1 } },
        { $limit: 1 },
      ]),
      TypingRecord.find({ userId })
        .sort({ timestamp: -1 })
        .limit(6)
        .select("wpm accuracy wordsTyped testDuration genre timestamp")
        .lean(),
      TournamentRecord.find({ userId })
        .sort({ createdAt: -1 })
        .limit(8)
        .populate("tournamentId", "name theme status startDate")
        .lean(),
      TournamentRecord.countDocuments({ userId, isWinner: true }),
      TournamentRecord.countDocuments({ userId, rank: { $lte: 3 } }),
      TrainingProgress.find({ userId, status: "mastered" })
        .sort({ completedAt: -1, updatedAt: -1 })
        .limit(8)
        .populate("lessonId", "title difficulty lessonType")
        .populate("moduleId", "title category")
        .lean(),
      TrainingProgress.countDocuments({ userId, status: "mastered" }),
      viewerId && String(viewerId) !== String(userId)
        ? FriendRequest.findOne({
            $or: [
              { senderId: viewerId, recipientId: userId },
              { senderId: userId, recipientId: viewerId },
            ],
          }).lean()
        : null,
    ]);

    const favoriteGenre = favoriteGenreResult[0]?._id || "";
    const friendshipStatus =
      !viewerId || String(viewerId) === String(userId)
        ? "self"
        : !relationshipRequest
        ? "none"
        : relationshipRequest.status === "accepted"
        ? "friends"
        : String(relationshipRequest.senderId) === String(viewerId)
        ? "outgoing_pending"
        : "incoming_pending";
    const achievements = buildAchievements({
      user,
      tournamentWins,
      masteredLessonsCount,
      favoriteGenre,
    });

    return res.status(200).json({
      success: true,
      profile: {
        userId: String(userId),
        username: user.username,
        profilePicture: user.profilePicture || "",
        joinedAt: user.createdAt,
        isPro: user.plan === "pro" && user.proStatus === "active",
        friendshipStatus,
        stats: {
          totalGamesPlayed: user.stats?.totalGamesPlayed || 0,
          bestWPM: user.stats?.bestWPM || 0,
          averageWPM: user.stats?.averageWPM || 0,
          bestAccuracy: user.stats?.bestAccuracy || 0,
          totalWordsTyped: user.stats?.totalWordsTyped || 0,
          dailyChallengeStreak: user.stats?.dailyChallengeStreak || 0,
          longestDailyChallengeStreak:
            user.stats?.longestDailyChallengeStreak || 0,
          totalDailyChallengesCompleted:
            user.stats?.totalDailyChallengesCompleted || 0,
          favoriteGenre,
          tournamentWins,
          podiumCount,
          masteredLessonsCount,
        },
        achievements,
        recentRecords: recentRecords.map((record) => ({
          id: String(record._id),
          wpm: record.wpm,
          accuracy: record.accuracy,
          wordsTyped: record.wordsTyped,
          testDuration: record.testDuration,
          genre: record.genre,
          timestamp: record.timestamp,
        })),
        tournamentHistory: recentTournamentRecords.map((record) => ({
          id: String(record._id),
          tournamentName: record.tournamentId?.name || "Tournament",
          theme: record.tournamentId?.theme || record.genre,
          status: record.tournamentId?.status || "",
          startedAt: record.tournamentId?.startDate || record.createdAt,
          result: record.result,
          rank: record.rank,
          score: record.score,
          wpm: record.wpm,
          accuracy: record.accuracy,
        })),
        masteredLessons: masteredLessons.map((progress) => ({
          id: String(progress._id),
          title: progress.lessonId?.title || "Lesson",
          moduleTitle: progress.moduleId?.title || "Module",
          category: progress.moduleId?.category || "",
          difficulty: progress.lessonId?.difficulty || "easy",
          completedAt: progress.completedAt || progress.updatedAt,
        })),
      },
    });
  } catch (error) {
    console.error("Public profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load public profile",
    });
  }
}
