# Game Statistics Integration Guide

## Overview

The typing game now automatically saves your statistics to the database when the timer ends. Your profile will show updated stats including:
- Total Games Played
- Best WPM (Words Per Minute)
- Average WPM
- Best Accuracy
- Total Words Typed

## How It Works

### Automatic Saving

When the typing test timer reaches 0:

1. **The game calculates your final stats:**
   - WPM (Words Per Minute)
   - Accuracy percentage
   - Total words typed

2. **Checks if you're logged in:**
   - If you're logged in, it saves your stats automatically
   - If you're not logged in, you can still play but stats won't be saved

3. **Saves to database:**
   - Calls the `/api/game/save-score` endpoint
   - Updates your user profile with the new statistics
   - Intelligently updates:
     - Increments total games played
     - Updates best WPM if you beat your record
     - Updates best accuracy if you beat your record
     - Recalculates your average WPM

4. **Shows confirmation:**
   - A success toast appears at the top showing your stats were saved
   - Your profile is refreshed with the new data

### What Gets Saved

```javascript
{
  wpm: 65,              // Your typing speed
  accuracy: 95,         // Your accuracy percentage
  wordsTyped: 42        // Total words you typed
}
```

### How Stats Are Calculated

**WPM (Words Per Minute):**
- Calculated as: (correct characters / 5) / minutes elapsed
- Only counts correctly typed characters
- Updated in real-time during the test

**Accuracy:**
- Calculated as: (correct characters / total characters typed) × 100
- Shows percentage of correctly typed characters
- Updated in real-time during the test

**Words Typed:**
- Counts the number of complete words you typed
- Splits your input by spaces and counts non-empty words

**Average WPM:**
- Calculated as: (previous average × games played + new WPM) / (games + 1)
- Maintains a running average across all your games

## User Experience

### When Logged In

1. Start typing test
2. Timer counts down
3. When timer reaches 0:
   ```
   ✅ Score saved!
   42 words • 65 WPM • 95% accuracy
   ```
4. Go to your profile to see updated stats

### When Not Logged In

1. Start typing test
2. Timer counts down
3. When timer reaches 0:
   - Stats are displayed but not saved
   - A toast appears: "Login to save your scores!"
   - You can still see your session stats

### Viewing Your Stats

Navigate to `/profile` to see your statistics:

```
┌─────────────────────┬──────────────────┐
│ Games Played        │ Best WPM         │
│ 15                  │ 72               │
│ Total matches       │ Words per minute │
├─────────────────────┼──────────────────┤
│ Average WPM         │ Best Accuracy    │
│ 65                  │ 98%              │
│ Average speed       │ Highest score    │
└─────────────────────┴──────────────────┘
```

## Technical Implementation

### Frontend (type-page.js)

```javascript
// Save score when test ends
useEffect(() => {
  const saveScore = async () => {
    // Only save if test ended, user is logged in, and we haven't saved yet
    if (!testEnded || !user || scoreSaved || !testStarted) return;

    // Calculate total words typed
    const wordsTyped = userInput.trim().split(/\s+/).filter(Boolean).length;

    // Only save if user actually typed something
    if (wordsTyped === 0 || wpm === 0) return;

    // Call API to save score
    const response = await fetch('/api/game/save-score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wpm, accuracy, wordsTyped }),
    });

    if (response.ok) {
      setScoreSaved(true);
      await checkAuth(); // Refresh user data
      
      // Show success message
      toast({
        title: 'Score saved!',
        description: `${wordsTyped} words • ${wpm} WPM • ${accuracy}% accuracy`,
        status: 'success',
      });
    }
  };

  saveScore();
}, [testEnded, user, wpm, accuracy, userInput, scoreSaved, testStarted]);
```

### Backend (api/game/save-score.js)

```javascript
// Protected API route
export default withAuth(async (req, res) => {
  const { wpm, accuracy, wordsTyped } = req.body;
  const user = await User.findById(req.user.id);

  // Update statistics
  user.stats.totalGamesPlayed += 1;
  user.stats.totalWordsTyped += wordsTyped;

  // Update best records
  if (wpm > user.stats.bestWPM) {
    user.stats.bestWPM = wpm;
  }
  if (accuracy > user.stats.bestAccuracy) {
    user.stats.bestAccuracy = accuracy;
  }

  // Calculate new average WPM
  const totalWPM = (user.stats.averageWPM * (user.stats.totalGamesPlayed - 1)) + wpm;
  user.stats.averageWPM = Math.round(totalWPM / user.stats.totalGamesPlayed);

  await user.save();

  return res.json({
    success: true,
    stats: user.stats,
  });
});
```

## Features

✅ **Automatic Saving** - No manual save button needed  
✅ **Smart Updates** - Only updates records when you beat them  
✅ **Running Averages** - Maintains accurate average WPM  
✅ **User Feedback** - Toast notifications for save confirmation  
✅ **Protected** - Only saves for authenticated users  
✅ **Validation** - Ensures valid data before saving  
✅ **Error Handling** - Graceful fallback if save fails  
✅ **No Duplicates** - Prevents saving the same game twice  

## Testing the Integration

### Test the Stats Saving

1. **Create an account or login:**
   ```
   Navigate to /profile
   Register or login
   ```

2. **Play a typing test:**
   ```
   Navigate to /type
   Start typing
   Wait for timer to reach 0
   ```

3. **Verify the save:**
   ```
   Look for "Score saved!" toast at top
   Navigate to /profile
   Check that stats have updated
   ```

4. **Play multiple games:**
   ```
   Restart and play again
   Watch your average WPM change
   Try to beat your best WPM
   ```

### Expected Results

**First Game:**
```
Games Played: 1
Best WPM: 50
Average WPM: 50
Best Accuracy: 95%
```

**Second Game (faster):**
```
Games Played: 2
Best WPM: 60      ← Updated!
Average WPM: 55   ← Average of 50 and 60
Best Accuracy: 95%
```

**Third Game (slower but more accurate):**
```
Games Played: 3
Best WPM: 60      ← Still 60
Average WPM: 53   ← Average of all games
Best Accuracy: 98% ← Updated!
```

## Troubleshooting

### Stats Not Saving

**Check if you're logged in:**
- Look at the navbar - do you see your avatar?
- If not, go to `/profile` and login

**Check browser console:**
```javascript
// Press F12 and look for errors
// Should see: "Score saved!" or error messages
```

**Verify MongoDB is running:**
- Check your `.env.local` has correct `MONGODB_URI`
- Ensure MongoDB service is running

### Stats Not Updating

**Clear cache and retry:**
```bash
# In browser console
localStorage.clear();
location.reload();
```

**Check network tab:**
- Open DevTools (F12) → Network tab
- Play a game
- Look for POST request to `/api/game/save-score`
- Check response status (should be 200)

### Duplicate Stats

**This shouldn't happen**, but if it does:
- The `scoreSaved` flag prevents duplicate saves
- Restarting the test resets this flag
- Each test can only be saved once

## Future Enhancements

Potential additions to the stats system:

- 📊 **Historical Data** - Graph of WPM over time
- 🏆 **Achievements** - Badges for milestones
- 📈 **Detailed Analytics** - Per-genre statistics
- 🎯 **Goals** - Set and track WPM goals
- 📅 **Daily Streaks** - Track consecutive days played
- 👥 **Leaderboards** - Compare with other users
- 💾 **Export Data** - Download your stats as CSV
- 🎨 **Custom Themes** - Unlock themes based on achievements

## API Reference

### POST /api/game/save-score

**Authentication:** Required (JWT token in cookie)

**Request Body:**
```json
{
  "wpm": 65,
  "accuracy": 95,
  "wordsTyped": 42
}
```

**Success Response (200):**
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
  }
}
```

**Error Responses:**

401 Unauthorized:
```json
{
  "message": "Not authenticated"
}
```

400 Bad Request:
```json
{
  "message": "Invalid input data"
}
```

500 Server Error:
```json
{
  "message": "Server error. Please try again."
}
```

---

**That's it!** Your typing game stats are now automatically saved and tracked. Keep practicing to improve your WPM and accuracy! 🎮⌨️

