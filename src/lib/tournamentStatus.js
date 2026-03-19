import Tournament from "../models/Tournament";

/**
 * Auto-transition tournament statuses based on current time.
 * Called on every tournament fetch to keep statuses accurate.
 *  - upcoming -> active: when now >= startDate
 *  - active -> completed: when now >= endDate
 * Also determines winners when completing a tournament.
 */
export async function updateTournamentStatuses() {
  const now = new Date();

  // upcoming -> active
  await Tournament.updateMany(
    { status: "upcoming", startDate: { $lte: now } },
    { $set: { status: "active" } }
  );

  // active -> completed (find them first so we can set winners)
  const expiredTournaments = await Tournament.find({
    status: "active",
    endDate: { $lte: now },
  });

  for (const tournament of expiredTournaments) {
    // Rank participants by score descending
    const sorted = [...tournament.participants].sort(
      (a, b) => b.score - a.score
    );

    const winners = {};
    if (sorted[0] && sorted[0].score > 0) winners.first = sorted[0].userId;
    if (sorted[1] && sorted[1].score > 0) winners.second = sorted[1].userId;
    if (sorted[2] && sorted[2].score > 0) winners.third = sorted[2].userId;

    // Update ranks on participants
    const updatedParticipants = tournament.participants.map((p) => {
      const rank = sorted.findIndex(
        (s) => s.userId.toString() === p.userId.toString()
      );
      return { ...p.toObject(), rank: rank + 1 };
    });

    tournament.status = "completed";
    tournament.winners = winners;
    tournament.participants = updatedParticipants;
    await tournament.save();
  }
}
