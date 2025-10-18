import React from "react";
import { useRouter } from "next/router";
import Navbar from "../../components/navbar";
import TournamentDetails from "../../components/tournament-details";

export default function TournamentDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  return (
    <>
      <Navbar />
      <TournamentDetails tournamentId={id} />
    </>
  );
}
