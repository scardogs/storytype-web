import React from "react";
import Navbar from "../components/navbar";
import { Box, Heading, Text } from "@chakra-ui/react";

export default function LeaderboardPage() {
  return (
    <>
      <Navbar />
      <Box
        maxW="2xl"
        mx="auto"
        mt={12}
        p={8}
        bg="gray.800"
        borderRadius="lg"
        boxShadow="lg"
      >
        <Heading size="lg" mb={4} color="teal.300">
          Leaderboard
        </Heading>
        <Text color="gray.300">
          Coming soon: See the top typists and your ranking!
        </Text>
      </Box>
    </>
  );
}
