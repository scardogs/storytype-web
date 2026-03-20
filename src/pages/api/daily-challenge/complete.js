import connectDB from "../../../lib/mongodb";
import { withAuth } from "../../../lib/withAuth";
import { assertSameOrigin } from "../../../lib/security";
import {
  getChallengeScore,
  getPreviousDateKey,
} from "../../../lib/dailyChallenge";
import DailyChallenge from "../../../models/DailyChallenge";
import User from "../../../models/User";
import UserDailyChallenge from "../../../models/UserDailyChallenge";

async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  if (!assertSameOrigin(req)) {
    return res.status(403).json({ success: false, message: "Invalid request origin" });
  }

  try {
    await connectDB();

    const { challengeId, wpm, accuracy } = req.body || {};

    if (
      !challengeId ||
      typeof wpm !== "number" ||
      typeof accuracy !== "number" ||
      wpm < 0 ||
      wpm > 300 ||
      accuracy < 0 ||
      accuracy > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid challenge result",
      });
    }

    const [challenge, user] = await Promise.all([
      DailyChallenge.findById(challengeId),
      User.findById(req.user.id),
    ]);

    if (!challenge || !user) {
      return res.status(404).json({
        success: false,
        message: "Challenge or user not found",
      });
    }

    const score = getChallengeScore(wpm, accuracy);
    const existing = await UserDailyChallenge.findOne({
      userId: user._id,
      challengeId: challenge._id,
    });

    const hadCompletedBefore = Boolean(existing?.completedAt);
    const meetsTarget =
      wpm >= challenge.targetWpm && accuracy >= challenge.targetAccuracy;

    const progress =
      existing ||
      new UserDailyChallenge({
        userId: user._id,
        challengeId: challenge._id,
        dateKey: challenge.dateKey,
      });

    progress.attempts += 1;
    progress.lastAttemptAt = new Date();
    progress.bestWpm = Math.max(progress.bestWpm || 0, wpm);
    progress.bestAccuracy = Math.max(progress.bestAccuracy || 0, accuracy);
    progress.bestScore = Math.max(progress.bestScore || 0, score);
    progress.metTarget = Boolean(progress.metTarget || meetsTarget);

    if (!hadCompletedBefore) {
      const previousDateKey = getPreviousDateKey(challenge.dateKey);
      const continuedStreak =
        user.stats.lastDailyChallengeDateKey === previousDateKey
          ? (user.stats.dailyChallengeStreak || 0) + 1
          : 1;

      progress.completedAt = new Date();
      progress.streakAfterCompletion = continuedStreak;

      user.stats.dailyChallengeStreak = continuedStreak;
      user.stats.longestDailyChallengeStreak = Math.max(
        user.stats.longestDailyChallengeStreak || 0,
        continuedStreak
      );
      user.stats.totalDailyChallengesCompleted =
        (user.stats.totalDailyChallengesCompleted || 0) + 1;
      user.stats.lastDailyChallengeDateKey = challenge.dateKey;
    } else if (!progress.completedAt) {
      progress.completedAt = new Date();
    }

    await Promise.all([progress.save(), user.save()]);

    return res.status(200).json({
      success: true,
      progress: {
        attempts: progress.attempts,
        completed: Boolean(progress.completedAt),
        completedAt: progress.completedAt,
        bestWpm: progress.bestWpm,
        bestAccuracy: progress.bestAccuracy,
        bestScore: progress.bestScore,
        metTarget: progress.metTarget,
        streakAfterCompletion: progress.streakAfterCompletion,
      },
      stats: {
        dailyChallengeStreak: user.stats.dailyChallengeStreak || 0,
        longestDailyChallengeStreak: user.stats.longestDailyChallengeStreak || 0,
        totalDailyChallengesCompleted:
          user.stats.totalDailyChallengesCompleted || 0,
      },
    });
  } catch (error) {
    console.error("Daily challenge completion error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save daily challenge result",
    });
  }
}

export default withAuth(handler);
