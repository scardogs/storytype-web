import { withAuth } from "../../../lib/withAuth";
import TypingRecord from "../../../models/TypingRecord";
import { isProUser } from "../../../lib/pro";

async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const userId = req.user.id;
    const rangeDays = Math.max(1, parseInt(req.query.days || "30", 10));
    const isPro = isProUser(req.user);

    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - rangeDays);

    const premiumWindowDays = isPro ? Math.max(rangeDays, 365) : rangeDays;
    const premiumDaysAgo = new Date();
    premiumDaysAgo.setDate(premiumDaysAgo.getDate() - premiumWindowDays);

    const [records, premiumRecords] = await Promise.all([
      TypingRecord.find({
        userId,
        timestamp: { $gte: daysAgo },
      })
        .sort({ timestamp: 1 })
        .lean(),
      isPro
        ? TypingRecord.find({
            userId,
            timestamp: { $gte: premiumDaysAgo },
          })
            .sort({ timestamp: 1 })
            .lean()
        : Promise.resolve([]),
    ]);

    if (records.length === 0) {
      return res.status(200).json({
        success: true,
        isPro,
        stats: buildEmptyStats(),
        byGenre: {},
        recentTests: [],
        proAnalytics: isPro ? buildEmptyProAnalytics() : null,
        proPreview: buildProPreview(),
      });
    }

    const baseStats = buildBaseAnalytics(records);

    return res.status(200).json({
      success: true,
      isPro,
      ...baseStats,
      proAnalytics: isPro ? buildProAnalytics(premiumRecords.length ? premiumRecords : records) : null,
      proPreview: buildProPreview(),
    });
  } catch (error) {
    console.error("Get stats error:", error);
    return res.status(500).json({ message: "Server error. Please try again." });
  }
}

function buildEmptyStats() {
  return {
    totalTests: 0,
    averageWPM: 0,
    averageAccuracy: 0,
    highestWPM: 0,
    lowestWPM: 0,
    improvement: 0,
    consistency: 0,
  };
}

function buildEmptyProAnalytics() {
  return {
    mistakeCharacters: [],
    mistakePatterns: [],
    worstGenres: [],
    worstSessions: [],
    longRangeTrend: [],
    insights: [],
  };
}

function buildBaseAnalytics(records) {
  const totalTests = records.length;
  const wpmValues = records.map((record) => record.wpm);
  const accuracyValues = records.map((record) => record.accuracy);

  const byGenreAccumulator = {};
  records.forEach((record) => {
    if (!byGenreAccumulator[record.genre]) {
      byGenreAccumulator[record.genre] = {
        count: 0,
        totalWPM: 0,
        totalAccuracy: 0,
      };
    }

    byGenreAccumulator[record.genre].count += 1;
    byGenreAccumulator[record.genre].totalWPM += record.wpm;
    byGenreAccumulator[record.genre].totalAccuracy += record.accuracy;
  });

  const byGenre = Object.fromEntries(
    Object.entries(byGenreAccumulator).map(([genre, data]) => [
      genre,
      {
        count: data.count,
        averageWPM: Math.round(data.totalWPM / data.count),
        averageAccuracy: Math.round(data.totalAccuracy / data.count),
      },
    ])
  );

  return {
    stats: {
      totalTests,
      averageWPM: Math.round(sum(wpmValues) / totalTests),
      averageAccuracy: Math.round(sum(accuracyValues) / totalTests),
      highestWPM: Math.max(...wpmValues),
      lowestWPM: Math.min(...wpmValues),
      improvement: calculateImprovement(wpmValues),
      consistency: calculateConsistency(wpmValues),
    },
    byGenre,
    recentTests: records.slice(-10).reverse().map((record) => ({
      wpm: record.wpm,
      accuracy: record.accuracy,
      genre: record.genre,
      timestamp: record.timestamp,
      totalErrors: record.totalErrors || 0,
    })),
  };
}

function buildProAnalytics(records) {
  const characterTotals = new Map();
  const patternTotals = new Map();
  const genreTotals = new Map();

  records.forEach((record) => {
    const errorRate = getErrorRate(record);
    const genreEntry = genreTotals.get(record.genre) || {
      genre: record.genre,
      tests: 0,
      totalErrors: 0,
      totalErrorRate: 0,
      averageAccuracy: 0,
      averageWPM: 0,
    };

    genreEntry.tests += 1;
    genreEntry.totalErrors += record.totalErrors || 0;
    genreEntry.totalErrorRate += errorRate;
    genreEntry.averageAccuracy += record.accuracy || 0;
    genreEntry.averageWPM += record.wpm || 0;
    genreTotals.set(record.genre, genreEntry);

    (record.mistakeChars || []).forEach((entry) => {
      characterTotals.set(entry.key, (characterTotals.get(entry.key) || 0) + (entry.count || 0));
    });

    (record.mistakePatterns || []).forEach((entry) => {
      patternTotals.set(entry.key, (patternTotals.get(entry.key) || 0) + (entry.count || 0));
    });
  });

  const worstSessions = [...records]
    .sort((left, right) => getErrorRate(right) - getErrorRate(left))
    .slice(0, 5)
    .map((record) => ({
      id: String(record._id),
      genre: record.genre,
      timestamp: record.timestamp,
      wpm: record.wpm,
      accuracy: record.accuracy,
      totalErrors: record.totalErrors || 0,
      errorRate: Math.round(getErrorRate(record)),
    }));

  const worstGenres = [...genreTotals.values()]
    .map((entry) => ({
      genre: entry.genre,
      tests: entry.tests,
      averageAccuracy: Math.round(entry.averageAccuracy / entry.tests),
      averageWPM: Math.round(entry.averageWPM / entry.tests),
      averageErrorRate: Math.round(entry.totalErrorRate / entry.tests),
    }))
    .sort((left, right) => right.averageErrorRate - left.averageErrorRate)
    .slice(0, 4);

  const longRangeTrend = buildTrendBuckets(records);
  const insights = buildInsights(records, worstGenres, longRangeTrend);

  return {
    mistakeCharacters: mapTotals(characterTotals, "character"),
    mistakePatterns: mapTotals(patternTotals, "pattern"),
    worstGenres,
    worstSessions,
    longRangeTrend,
    insights,
  };
}

function buildTrendBuckets(records) {
  const buckets = new Map();

  records.forEach((record) => {
    const date = new Date(record.timestamp);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
      date.getDate()
    ).padStart(2, "0")}`;

    const bucket = buckets.get(key) || {
      label: key,
      tests: 0,
      totalWpm: 0,
      totalAccuracy: 0,
    };

    bucket.tests += 1;
    bucket.totalWpm += record.wpm;
    bucket.totalAccuracy += record.accuracy;
    buckets.set(key, bucket);
  });

  return [...buckets.values()]
    .slice(-8)
    .map((bucket) => ({
      label: bucket.label,
      averageWpm: Math.round(bucket.totalWpm / bucket.tests),
      averageAccuracy: Math.round(bucket.totalAccuracy / bucket.tests),
      tests: bucket.tests,
    }));
}

function buildInsights(records, worstGenres, longRangeTrend) {
  const insights = [];
  const firstChunk = records.slice(0, Math.min(5, records.length));
  const lastChunk = records.slice(-Math.min(5, records.length));
  const speedDelta = Math.round(avg(lastChunk.map((record) => record.wpm)) - avg(firstChunk.map((record) => record.wpm)));
  const accuracyDelta = Math.round(
    avg(lastChunk.map((record) => record.accuracy)) - avg(firstChunk.map((record) => record.accuracy))
  );

  insights.push({
    id: "speed-trend",
    title: speedDelta >= 0 ? "Speed is trending up" : "Speed is slipping",
    body:
      speedDelta >= 0
        ? `Recent sessions are averaging ${speedDelta} WPM higher than your early sample.`
        : `Recent sessions are averaging ${Math.abs(speedDelta)} WPM lower than your early sample.`,
    tone: speedDelta >= 0 ? "positive" : "warning",
  });

  insights.push({
    id: "accuracy-trend",
    title: accuracyDelta >= 0 ? "Accuracy is improving" : "Accuracy needs attention",
    body:
      accuracyDelta >= 0
        ? `Recent sessions are up ${accuracyDelta}% in accuracy.`
        : `Recent sessions are down ${Math.abs(accuracyDelta)}% in accuracy.`,
    tone: accuracyDelta >= 0 ? "positive" : "warning",
  });

  if (worstGenres[0]) {
    insights.push({
      id: "focus-genre",
      title: `Focus on ${worstGenres[0].genre}`,
      body: `${worstGenres[0].genre} currently has your highest average error rate at ${worstGenres[0].averageErrorRate}%.`,
      tone: "info",
    });
  }

  if (longRangeTrend.length >= 2) {
    const latest = longRangeTrend[longRangeTrend.length - 1];
    const previous = longRangeTrend[longRangeTrend.length - 2];
    const latestDelta = latest.averageWpm - previous.averageWpm;

    insights.push({
      id: "momentum",
      title: latestDelta >= 0 ? "Recent momentum is positive" : "Momentum cooled off",
      body:
        latestDelta >= 0
          ? `Your latest trend window gained ${latestDelta} WPM over the previous one.`
          : `Your latest trend window dropped ${Math.abs(latestDelta)} WPM from the previous one.`,
      tone: latestDelta >= 0 ? "positive" : "warning",
    });
  }

  return insights.slice(0, 4);
}

function buildProPreview() {
  return {
    title: "StoryType Pro",
    description: "Unlock deeper mistake analysis, long-range trend depth, improvement insights, and unlimited ghost history.",
    highlights: [
      "Weak character and pattern analysis",
      "Long-range session trends",
      "Unlimited ghost history",
      "Suggested next focus areas",
    ],
  };
}

function mapTotals(map, keyName) {
  return [...map.entries()]
    .map(([key, count]) => ({
      [keyName]: key,
      count,
    }))
    .sort((left, right) => right.count - left.count)
    .slice(0, 6);
}

function getErrorRate(record) {
  if (!record?.totalCharsTyped) {
    return 0;
  }

  return ((record.totalErrors || 0) / record.totalCharsTyped) * 100;
}

function calculateImprovement(wpmValues) {
  if (wpmValues.length < 10) return 0;

  const firstFive = wpmValues.slice(0, 5);
  const lastFive = wpmValues.slice(-5);

  return Math.round(avg(lastFive) - avg(firstFive));
}

function calculateConsistency(wpmValues) {
  if (wpmValues.length < 2) return 100;

  const mean = avg(wpmValues);
  const variance = wpmValues.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / wpmValues.length;
  const stdDev = Math.sqrt(variance);
  return Math.round(Math.max(0, Math.min(100, 100 - stdDev * 5)));
}

function sum(values) {
  return values.reduce((total, value) => total + value, 0);
}

function avg(values) {
  if (!values.length) {
    return 0;
  }

  return sum(values) / values.length;
}

export default withAuth(handler);
