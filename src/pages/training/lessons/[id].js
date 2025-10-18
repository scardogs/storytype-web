import React from "react";
import { Box } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useColorModeValue } from "@chakra-ui/react";
import Navbar from "../../../components/navbar";
import TrainingLessonInterface from "../../../components/training-lesson-interface";

export default function TrainingLessonPage() {
  const router = useRouter();
  const { id } = router.query;

  return (
    <>
      <Navbar />
      <Box bg={useColorModeValue("gray.50", "gray.900")} minH="100vh" p={6}>
        <TrainingLessonInterface lessonId={id} />
      </Box>
    </>
  );
}
