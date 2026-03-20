import connectDB from "../../../lib/mongodb";
import { ensureDailyChallengeSeedData } from "../../../lib/seedDailyChallenges";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

  try {
    await connectDB();

    const days =
      typeof req.body?.days === "number" && req.body.days > 0
        ? Math.min(req.body.days, 90)
        : 30;
    const forceReset = Boolean(req.body?.forceReset);

    const result = await ensureDailyChallengeSeedData({ days, forceReset });

    return res.status(200).json({
      success: true,
      message: "Daily challenges seeded successfully",
      ...result,
    });
  } catch (error) {
    console.error("Daily challenge seed error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to seed daily challenges",
      error: error.message,
    });
  }
}
