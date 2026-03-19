import React from "react";
import { useRouter } from "next/router";
import Navbar from "../components/navbar";
import TypePage from "../components/type-page";

const TypingPage = () => {
  const router = useRouter();
  const { genre } = router.query;

  return (
    <>
      <Navbar />
      <TypePage initialGenre={genre} />
    </>
  );
};

export default TypingPage;
