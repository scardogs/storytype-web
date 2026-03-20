const DAILY_CHALLENGE_LIBRARY = [
  {
    slug: "fantasy-sprint",
    title: "Daily Sprint: Enchanted Pursuit",
    description:
      "A quick fantasy run built to reward clean bursts of speed under pressure.",
    genre: "Fantasy",
    duration: 45,
    targetWpm: 42,
    targetAccuracy: 95,
    rewardLabel: "Streak spark",
    text:
      "Moonlit banners snapped above the ruined gate as the courier slipped between the watchfires and carried the sealed map toward the sleeping citadel before dawn could betray the mission.",
  },
  {
    slug: "mystery-precision",
    title: "Daily Precision: Quiet Clues",
    description:
      "Slow the panic, watch every character, and keep your accuracy high through a tense mystery passage.",
    genre: "Mystery",
    duration: 60,
    targetWpm: 36,
    targetAccuracy: 97,
    rewardLabel: "Precision mark",
    text:
      "On the polished desk beside the locked drawer, a single blue thread rested under the lamp, proving that the visitor had stood closer to the evidence than anyone first admitted.",
  },
  {
    slug: "scifi-endurance",
    title: "Daily Endurance: Orbital Drift",
    description:
      "A longer sci-fi passage designed to test rhythm, pacing, and composure.",
    genre: "Sci-Fi",
    duration: 75,
    targetWpm: 40,
    targetAccuracy: 94,
    rewardLabel: "Orbit badge",
    text:
      "Warning lights rolled across the bridge while the navigator recalculated the jump by hand, buying the crew one narrow chance to clear the debris field before the damaged engines failed for good.",
  },
  {
    slug: "romance-flow",
    title: "Daily Flow: Second Draft Hearts",
    description:
      "Keep a smooth cadence through a softer passage where consistency matters more than panic speed.",
    genre: "Romance",
    duration: 60,
    targetWpm: 38,
    targetAccuracy: 96,
    rewardLabel: "Flow ribbon",
    text:
      "She folded the letter twice before slipping it beneath his coffee cup, hoping the honest version of the story would arrive before her courage disappeared with the morning crowd.",
  },
  {
    slug: "fantasy-accuracy",
    title: "Daily Accuracy: Archive of Ash",
    description:
      "A fantasy challenge that punishes sloppy typing and rewards control.",
    genre: "Fantasy",
    duration: 60,
    targetWpm: 35,
    targetAccuracy: 98,
    rewardLabel: "Archive seal",
    text:
      "Inside the ash-lined archive, the apprentice copied the forbidden names with steady hands because one missing mark would awaken the wards sealed in the stone floor below.",
  },
  {
    slug: "mystery-sprint",
    title: "Daily Sprint: Last Train Witness",
    description:
      "A short, tense mystery passage focused on quick starts and disciplined corrections.",
    genre: "Mystery",
    duration: 45,
    targetWpm: 44,
    targetAccuracy: 95,
    rewardLabel: "Witness token",
    text:
      "The final passenger stepped off the train alone, but the rain on her coat told the detective she had already crossed a platform no stationmaster was willing to mention.",
  },
  {
    slug: "scifi-precision",
    title: "Daily Precision: Signal Window",
    description:
      "Thread the message through a narrow timing window without sacrificing clean inputs.",
    genre: "Sci-Fi",
    duration: 50,
    targetWpm: 39,
    targetAccuracy: 97,
    rewardLabel: "Signal stamp",
    text:
      "For seven seconds the relay array aligned with the dead colony, and every operator on the deck stopped breathing while the engineer typed the rescue code into the fading channel.",
  },
  {
    slug: "romance-sprint",
    title: "Daily Sprint: Platform Goodbye",
    description:
      "A brisk romance challenge that rewards fast confidence and a calm finish.",
    genre: "Romance",
    duration: 45,
    targetWpm: 43,
    targetAccuracy: 95,
    rewardLabel: "Promise pin",
    text:
      "He reached the station just as the doors were closing, and the words he had rehearsed all week finally arrived with enough honesty to make her stay.",
  },
];

export function getTodayDateKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function getPreviousDateKey(dateKey) {
  const previousDate = new Date(`${dateKey}T00:00:00.000Z`);
  previousDate.setUTCDate(previousDate.getUTCDate() - 1);
  return getTodayDateKey(previousDate);
}

function getTemplateIndex(dateKey) {
  return [...dateKey].reduce((sum, char) => sum + char.charCodeAt(0), 0) %
    DAILY_CHALLENGE_LIBRARY.length;
}

export function buildDailyChallenge(date = new Date()) {
  const dateKey = getTodayDateKey(date);
  const template = DAILY_CHALLENGE_LIBRARY[getTemplateIndex(dateKey)];

  return {
    ...template,
    dateKey,
  };
}

export function getChallengeScore(wpm, accuracy) {
  return Math.round(wpm * (accuracy / 100) * 10) / 10;
}
