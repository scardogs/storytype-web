import React from "react";
import Navbar from "../components/navbar";
import { Box, Heading, Text } from "@chakra-ui/react";

export default function SettingsPage() {
  return (
    <>
      <Navbar />
      <Box
        maxW="2xl"
        mx="auto"
        mt={{ base: 6, md: 12 }}
        p={{ base: 6, md: 8 }}
        mx={{ base: 2, md: "auto" }}
        bg="gray.800"
        borderRadius={{ base: "md", md: "lg" }}
        boxShadow="lg"
      >
        <Heading size={{ base: "md", md: "lg" }} mb={4} color="teal.300">
          Settings
        </Heading>
        <Text color="gray.300" fontSize={{ base: "sm", md: "md" }}>
          Coming soon: Customize your StoryType experience!
        </Text>
      </Box>
    </>
  );
}
