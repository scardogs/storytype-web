import { withAuth } from '../../../lib/withAuth';
import TypingRecord from '../../../models/TypingRecord';

/**
 * Get advanced analytics and statistics
 * GET /api/analytics/stats?days=30
 */
async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const userId = req.user.id;
    const { days = '30' } = req.query;

    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(days));

    // Get all records in date range
    const records = await TypingRecord.find({
      userId,
      timestamp: { $gte: daysAgo },
    }).sort({ timestamp: 1 });

    if (records.length === 0) {
      return res.status(200).json({
        success: true,
        stats: {
          totalTests: 0,
          averageWPM: 0,
          averageAccuracy: 0,
          highestWPM: 0,
          lowestWPM: 0,
          improvement: 0,
          consistency: 0,
        },
        byGenre: {},
        recentTests: [],
      });
    }

    // Calculate statistics
    const totalTests = records.length;
    const wpmValues = records.map(r => r.wpm);
    const accuracyValues = records.map(r => r.accuracy);

    const averageWPM = Math.round(
      wpmValues.reduce((a, b) => a + b, 0) / totalTests
    );
    const averageAccuracy = Math.round(
      accuracyValues.reduce((a, b) => a + b, 0) / totalTests
    );
    const highestWPM = Math.max(...wpmValues);
    const lowestWPM = Math.min(...wpmValues);

    // Calculate improvement (compare first 5 tests vs last 5 tests)
    const improvement = calculateImprovement(wpmValues);

    // Calculate consistency (standard deviation)
    const consistency = calculateConsistency(wpmValues);

    // Group by genre
    const byGenre = {};
    records.forEach(record => {
      if (!byGenre[record.genre]) {
        byGenre[record.genre] = {
          count: 0,
          totalWPM: 0,
          totalAccuracy: 0,
        };
      }
      byGenre[record.genre].count += 1;
      byGenre[record.genre].totalWPM += record.wpm;
      byGenre[record.genre].totalAccuracy += record.accuracy;
    });

    // Calculate averages for each genre
    Object.keys(byGenre).forEach(genre => {
      const data = byGenre[genre];
      byGenre[genre] = {
        count: data.count,
        averageWPM: Math.round(data.totalWPM / data.count),
        averageAccuracy: Math.round(data.totalAccuracy / data.count),
      };
    });

    // Get recent tests (last 10)
    const recentTests = records.slice(-10).reverse().map(r => ({
      wpm: r.wpm,
      accuracy: r.accuracy,
      genre: r.genre,
      timestamp: r.timestamp,
    }));

    return res.status(200).json({
      success: true,
      stats: {
        totalTests,
        averageWPM,
        averageAccuracy,
        highestWPM,
        lowestWPM,
        improvement,
        consistency,
      },
      byGenre,
      recentTests,
    });
  } catch (error) {
    console.error('Get stats error:', error);
    return res.status(500).json({ message: 'Server error. Please try again.' });
  }
}

function calculateImprovement(wpmValues) {
  if (wpmValues.length < 10) return 0;
  
  const firstFive = wpmValues.slice(0, 5);
  const lastFive = wpmValues.slice(-5);
  
  const firstAvg = firstFive.reduce((a, b) => a + b, 0) / 5;
  const lastAvg = lastFive.reduce((a, b) => a + b, 0) / 5;
  
  return Math.round(lastAvg - firstAvg);
}

function calculateConsistency(wpmValues) {
  if (wpmValues.length < 2) return 100;
  
  const mean = wpmValues.reduce((a, b) => a + b, 0) / wpmValues.length;
  const variance = wpmValues.reduce((sum, value) => {
    return sum + Math.pow(value - mean, 2);
  }, 0) / wpmValues.length;
  const stdDev = Math.sqrt(variance);
  
  // Convert to percentage (higher = more consistent)
  // Assuming stdDev of 0 = 100%, stdDev of 20+ = 0%
  const consistencyScore = Math.max(0, Math.min(100, 100 - (stdDev * 5)));
  
  return Math.round(consistencyScore);
}

export default withAuth(handler);

