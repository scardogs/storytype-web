import React from "react";
import Link from "next/link";
import { Box, Button, Heading, Text, VStack, Flex } from "@chakra-ui/react";

export default function EmailVerifiedPage() {
  return (
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      px={4}
      bg="gray.900"
      bgGradient="linear(to-br, gray.900, teal.900, blue.900)"
    >
      <Box
        w={{ base: "100%", sm: "90%", md: "560px" }}
        bg="gray.800"
        border="1px solid"
        borderColor="gray.700"
        borderRadius="2xl"
        p={{ base: 6, md: 10 }}
        boxShadow="0 18px 40px rgba(0, 0, 0, 0.35)"
      >
        <VStack spacing={4} align="stretch" textAlign="center">
          <Text
            fontSize="xs"
            color="teal.300"
            letterSpacing="0.14em"
            fontWeight="700"
            textTransform="uppercase"
          >
            StoryType Account
          </Text>
          <Heading
            color="gray.100"
            fontSize={{ base: "2xl", md: "3xl" }}
            letterSpacing="-0.02em"
          >
            Email Verified Successfully
          </Heading>
          <Text color="gray.300" fontSize={{ base: "sm", md: "md" }}>
            Your account is now verified. Click below to continue to your profile
            page and open the login tab.
          </Text>

          <Button
            as={Link}
            href="/profile?tab=login"
            mt={3}
            bgGradient="linear(to-r, teal.400, blue.400)"
            color="gray.900"
            fontWeight="700"
            borderRadius="xl"
            _hover={{ opacity: 0.9 }}
          >
            Click here to login
          </Button>
        </VStack>
      </Box>
    </Flex>
  );
}
