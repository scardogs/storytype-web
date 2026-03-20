import connectDB from "../../../lib/mongodb";
import { getUserFromRequest } from "../../../lib/auth";
import { createBroadcastNotification } from "../../../lib/notifications";
import {
  buildDailyChallenge,
  getChallengeScore,
  getTodayDateKey,
} from "../../../lib/dailyChallenge";
import DailyChallenge from "../../../models/DailyChallenge";
import UserDailyChallenge from "../../../models/UserDailyChallenge";

function normalizeChallenge(challenge) {
  return {
    _id: String(challenge._id),
    dateKey: challenge.dateKey,
    slug: challenge.slug,
    title: challenge.title,
    description: challenge.description,
    genre: challenge.genre,
    duration: challenge.duration,
    targetWpm: challenge.targetWpm,
    targetAccuracy: challenge.targetAccuracy,
    rewardLabel: challenge.rewardLabel,
    text: challenge.text,
  };
}

function normalizeProgress(progress) {
  if (!progress) return null;

  return {
    attempts: progress.attempts || 0,
    completed: Boolean(progress.completedAt),
    completedAt: progress.completedAt || null,
    bestWpm: progress.bestWpm || 0,
    bestAccuracy: progress.bestAccuracy || 0,
    bestScore: progress.bestScore || 0,
    metTarget: Boolean(progress.metTarget),
    streakAfterCompletion: progress.streakAfterCompletion || 0,
  };
}

async function getOrCreateTodaysChallenge() {
  const dateKey = getTodayDateKey();
  let challenge = await DailyChallenge.findOne({ dateKey });

  if (!challenge) {
    const generated = buildDailyChallenge();
    challenge = await DailyChallenge.create(generated);

    await createBroadcastNotification({
      title: "Daily challenge is live",
      message: `${generated.title} is ready. Jump in and keep your streak alive.`,
      type: "achievement",
      actionUrl: "/daily-challenge",
      entityType: "daily-challenge",
      entityId: challenge._id,
    });

    challenge.notificationSent = true;
    await challenge.save();
  }

  return challenge;
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

  try {
    await connectDB();

    const challenge = await getOrCreateTodaysChallenge();
    const userId = await getUserFromRequest(req);

    const [userProgress, leaderboard] = await Promise.all([
      userId
        ? UserDailyChallenge.findOne({
            userId,
            challengeId: challenge._id,
          }).lean()
        : null,
      UserDailyChallenge.find({ challengeId: challenge._id, completedAt: { $ne: null } })
        .populate("userId", "username profilePicture")
        .sort({ bestScore: -1, bestAccuracy: -1, bestWpm: -1, completedAt: 1 })
        .limit(5)
        .lean(),
    ]);
    const dateKey = getTodayDateKey();
    const schedule = await DailyChallenge.find({
      dateKey: {
        $gte: new Date(new Date(`${dateKey}T00:00:00.000Z`).getTime() - 3 * 24 * 60 * 60 * 1000)
          .toISOString()
          .slice(0, 10),
        $lte: new Date(new Date(`${dateKey}T00:00:00.000Z`).getTime() + 6 * 24 * 60 * 60 * 1000)
          .toISOString()
          .slice(0, 10),
      },
    })
      .sort({ dateKey: 1 })
      .lean();

    const participantCount = await UserDailyChallenge.countDocuments({
      challengeId: challenge._id,
      completedAt: { $ne: null },
    });

    return res.status(200).json({
      success: true,
      challenge: normalizeChallenge(challenge),
      userProgress: normalizeProgress(userProgress),
      leaderboard: leaderboard.map((entry, index) => ({
        rank: index + 1,
        username: entry.userId?.username || "Anonymous",
        profilePicture: entry.userId?.profilePicture || "",
        bestWpm: entry.bestWpm || 0,
        bestAccuracy: entry.bestAccuracy || 0,
        bestScore:
          entry.bestScore || getChallengeScore(entry.bestWpm || 0, entry.bestAccuracy || 0),
        metTarget: Boolean(entry.metTarget),
      })),
      stats: {
        participantCount,
      },
      schedule: schedule.map((entry) => normalizeChallenge(entry)),
      authenticated: Boolean(userId),
    });
  } catch (error) {
    console.error("Daily challenge fetch error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch daily challenge",
    });
  }
}
