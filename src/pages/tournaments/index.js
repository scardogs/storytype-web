import React from "react";
import Navbar from "../../components/navbar";
import TournamentList from "../../components/tournament-list";
import connectDB from "../../lib/mongodb";
import Tournament from "../../models/Tournament";
import { updateTournamentStatuses } from "../../lib/tournamentStatus";

export default function TournamentsPage({ initialTournaments }) {
  return (
    <>
      <Navbar />
      <TournamentList initialTournaments={initialTournaments} />
    </>
  );
}

export async function getServerSideProps() {
  try {
    await connectDB();
    await updateTournamentStatuses();

    const tournaments = await Tournament.find({})
      .populate("createdBy", "username profilePicture")
      .populate("participants.userId", "username profilePicture")
      .sort({ startDate: 1 })
      .limit(20)
      .lean();

    return {
      props: {
        initialTournaments: JSON.parse(JSON.stringify(tournaments)),
      },
    };
  } catch (error) {
    console.error("Error loading tournaments page:", error);

    return {
      props: {
        initialTournaments: [],
      },
    };
  }
}
