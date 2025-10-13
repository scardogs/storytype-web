# Analytics System Guide

## Overview

The StoryType application now includes a comprehensive analytics system similar to MonkeyType, featuring detailed performance tracking, historical data visualization, and advanced statistics.

## Features

### 📊 Individual Typing Records
Every typing test you complete is now saved as a separate record in the database, allowing for:
- Historical performance tracking
- Trend analysis over time
- Detailed breakdowns by genre
- Long-term progress monitoring

### 📈 Analytics Dashboard
A dedicated analytics page (`/analytics`) displays:
- **Performance Graphs** - WPM and accuracy trends over time
- **Statistics Cards** - Highest WPM, average accuracy, improvement, consistency
- **Genre Breakdown** - Performance analysis per story genre
- **Recent Tests Table** - Last 10 tests with detailed stats

## Database Schema

### TypingRecord Model
```javascript
{
  userId: ObjectId,          // Reference to User
  wpm: Number,               // Words per minute
  accuracy: Number,          // Accuracy percentage (0-100)
  wordsTyped: Number,        // Total words typed
  totalErrors: Number,       // Permanent error count
  totalCharsTyped: Number,   // Total characters typed (including corrections)
  testDuration: Number,      // Test duration in seconds
  genre: String,             // Story genre (Fantasy, Mystery, Sci-Fi, Romance)
  timestamp: Date,           // When the test was completed
}
```

## API Endpoints

### POST /api/game/save-score
Saves a typing test result and creates an individual record.

**Request Body:**
```json
{
  "wpm": 65,
  "accuracy": 95,
  "wordsTyped": 42,
  "totalErrors": 3,
  "totalCharsTyped": 215,
  "testDuration": 30,
  "genre": "Fantasy"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Score saved successfully",
  "stats": {
    "totalGamesPlayed": 15,
    "bestWPM": 72,
    "averageWPM": 65,
    "bestAccuracy": 98,
    "totalWordsTyped": 630
  },
  "record": {
    "id": "507f1f77bcf86cd799439011",
    "wpm": 65,
    "accuracy": 95,
    "timestamp": "2025-10-13T12:00:00.000Z"
  }
}
```

### GET /api/analytics/records
Fetches typing records with filtering options.

**Query Parameters:**
- `limit` - Number of records to return (default: 50)
- `days` - Filter by days back (e.g., 30)
- `genre` - Filter by genre (Fantasy, Mystery, Sci-Fi, Romance, or 'all')

**Example:**
```
GET /api/analytics/records?limit=100&days=30&genre=Fantasy
```

**Response:**
```json
{
  "success": true,
  "records": [
    {
      "_id": "...",
      "wpm": 65,
      "accuracy": 95,
      "wordsTyped": 42,
      "totalErrors": 3,
      "totalCharsTyped": 215,
      "testDuration": 30,
      "genre": "Fantasy",
      "timestamp": "2025-10-13T12:00:00.000Z"
    }
  ],
  "count": 42
}
```

### GET /api/analytics/stats
Get advanced statistics and aggregated data.

**Query Parameters:**
- `days` - Time range for stats (default: 30)

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalTests": 42,
    "averageWPM": 65,
    "averageAccuracy": 94,
    "highestWPM": 78,
    "lowestWPM": 45,
    "improvement": 12,
    "consistency": 85
  },
  "byGenre": {
    "Fantasy": {
      "count": 15,
      "averageWPM": 67,
      "averageAccuracy": 95
    },
    "Mystery": {
      "count": 12,
      "averageWPM": 63,
      "averageAccuracy": 93
    }
  },
  "recentTests": [...]
}
```

## Analytics Metrics Explained

### Improvement Score
Compares your first 5 tests vs last 5 tests to show WPM improvement.
- **Positive number** = You're improving! 🎉
- **Negative number** = Need more practice
- **Formula:** `(avg of last 5 tests) - (avg of first 5 tests)`

### Consistency Score
Measures how consistent your typing speed is (0-100).
- **100%** = Perfectly consistent (same WPM every time)
- **0%** = Very inconsistent (WPM varies wildly)
- **Formula:** Based on standard deviation of WPM values

### Average vs Best
- **Best WPM** - Your highest recorded speed
- **Average WPM** - Mean of all your tests
- **Best Accuracy** - Your highest recorded accuracy

## Using the Analytics Page

### 1. Navigate to Analytics
Click the chart icon in the navbar or go to `/analytics`

### 2. Filter Your Data
- **Time Range:** Last 7 days, 30 days, 90 days, or 1 year
- **Genre Filter:** View all genres or filter by specific genre

### 3. View Your Progress
- **Main Graph:** Shows WPM and accuracy trends over time
- **Stats Cards:** Quick overview of your performance
- **Genre Breakdown:** See which genres you excel at
- **Recent Tests:** Detailed view of last 10 tests

## Permanent Error Tracking

The system now tracks errors permanently:

### How It Works
1. Every keystroke is counted (including corrections)
2. Errors are tracked when you make a mistake
3. Even if you backspace and correct, the error remains counted
4. This gives more accurate accuracy measurements

### Metrics Affected
- **Accuracy** - Based on total characters typed vs total errors
- **Errors Display** - Shows current errors and total errors
  - Example: `5 (12)` means 5 current errors, 12 total mistakes

### Example Scenario
```
Type "hello" but type "helko" first:
1. Type "h" ✓ (chars: 1, errors: 0)
2. Type "e" ✓ (chars: 2, errors: 0)
3. Type "l" ✓ (chars: 3, errors: 0)
4. Type "k" ✗ (chars: 4, errors: 1) <- Error!
5. Backspace    (chars: 4, errors: 1) <- Error stays!
6. Type "l" ✓ (chars: 5, errors: 1)
7. Type "o" ✓ (chars: 6, errors: 1)

Final: accuracy = (6-1)/6 = 83%
```

## Tips for Using Analytics

### Track Your Progress
- Check your analytics weekly to see improvement trends
- Set goals based on your average WPM
- Focus on accuracy if consistency score is low

### Identify Weaknesses
- Genre breakdown shows which story types are harder
- Consistency score reveals if you need more practice
- Recent tests table helps spot patterns

### Compare Performance
- Filter by time range to see short-term vs long-term progress
- Compare different genres to find your strengths
- Use improvement score to validate your practice efforts

## Future Enhancements

Planned analytics features:
- 📊 More detailed graphs (error rate over time, combo streaks)
- 🏆 Achievements and milestones
- 📅 Calendar heatmap (like GitHub contributions)
- ⚡ Daily/weekly challenges
- 👥 Friend comparisons
- 📈 Prediction models (estimated time to reach goals)
- 💾 Export data to CSV/JSON

## Troubleshooting

### No Data Showing
- Make sure you've completed at least one typing test while logged in
- Check that you selected the correct time range
- Try refreshing the page

### Graphs Not Loading
- Ensure you have JavaScript enabled
- Check browser console for errors
- Try clearing cache and reloading

### Stats Seem Wrong
- Stats are calculated from individual records
- Old aggregate stats may differ from new calculated stats
- This is normal as the system transitions to individual record tracking

## Technical Details

### Data Storage
- Individual records are stored in the `typingrecords` collection
- Indexed by userId and timestamp for fast queries
- Each record is ~200 bytes, allowing millions of tests per user

### Performance
- Records are fetched with MongoDB's efficient indexing
- Aggregation happens server-side for speed
- Charts use Chart.js for smooth rendering

### Privacy
- All records are private to your account
- Only you can see your analytics
- Data is never shared without permission

---

**Happy typing! Track your progress and watch yourself improve! 📈⌨️**

