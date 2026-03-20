import DailyChallenge from "../models/DailyChallenge";
import { buildDailyChallenge } from "./dailyChallenge";

function addDays(date, days) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

export async function ensureDailyChallengeSeedData({
  days = 30,
  forceReset = false,
} = {}) {
  if (forceReset) {
    await DailyChallenge.deleteMany({});
  }

  const createdChallenges = [];
  const updatedChallenges = [];

  for (let offset = 0; offset < days; offset += 1) {
    const date = addDays(new Date(), offset);
    const challengeData = buildDailyChallenge(date);

    const existing = await DailyChallenge.findOne({ dateKey: challengeData.dateKey });

    if (existing) {
      if (forceReset) {
        Object.assign(existing, {
          ...challengeData,
          notificationSent: false,
        });
        await existing.save();
        updatedChallenges.push(existing.dateKey);
      }
      continue;
    }

    const created = await DailyChallenge.create({
      ...challengeData,
      notificationSent: false,
    });
    createdChallenges.push(created.dateKey);
  }

  return {
    createdCount: createdChallenges.length,
    updatedCount: updatedChallenges.length,
    createdChallenges,
    updatedChallenges,
  };
}
