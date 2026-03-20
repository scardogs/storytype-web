import React from "react";
import Navbar from "../components/navbar";
import {
  Box,
  Heading,
  Text,
  Center,
  VStack,
  HStack,
  Button,
  Icon,
  useColorModeValue,
  SimpleGrid,
  Stack,
  Badge,
} from "@chakra-ui/react";
import {
  InfoOutlineIcon,
  StarIcon,
  RepeatIcon,
  ArrowForwardIcon,
} from "@chakra-ui/icons";
import { FaBookOpen, FaChartLine, FaKeyboard, FaTrophy } from "react-icons/fa";
import { useRouter } from "next/router";

const pillars = [
  {
    icon: FaBookOpen,
    title: "Story-Driven Practice",
    description:
      "Replace repetitive drills with passages that feel like part of a real world, not a random word generator.",
  },
  {
    icon: FaChartLine,
    title: "Useful Feedback",
    description:
      "Track speed, accuracy, consistency, and mistakes in real time so improvement is visible after every run.",
  },
  {
    icon: FaKeyboard,
    title: "Structured Training",
    description:
      "Build fundamentals through guided lessons, targeted drills, and skill-based modules designed for steady progress.",
  },
  {
    icon: FaTrophy,
    title: "Competitive Modes",
    description:
      "Move from solo practice into leaderboards and tournaments when you want pressure, pacing, and replay value.",
  },
];

const highlights = [
  "Genre-based typing sessions",
  "Training modules with real lessons",
  "Live WPM, accuracy, and error tracking",
  "Leaderboards and tournament play",
];

export default function InfoPage() {
  const router = useRouter();
  const pageBg = useColorModeValue("gray.950", "gray.950");
  const panelBg = useColorModeValue("gray.900", "gray.900");
  const subtlePanelBg = useColorModeValue("whiteAlpha.50", "whiteAlpha.50");
  const borderColor = useColorModeValue("whiteAlpha.120", "whiteAlpha.120");
  const headingColor = useColorModeValue("white", "white");
  const bodyColor = useColorModeValue("gray.300", "gray.300");
  const mutedColor = useColorModeValue("gray.400", "gray.400");
  const accent = useColorModeValue("teal.300", "teal.300");

  return (
    <>
      <Navbar />
      <Box
        minH="100vh"
        bg={pageBg}
        position="relative"
        overflow="hidden"
        px={{ base: 3, md: 6 }}
        py={{ base: 6, md: 10 }}
      >
        <Box
          position="absolute"
          top="-120px"
          right="-80px"
          w={{ base: "260px", md: "420px" }}
          h={{ base: "260px", md: "420px" }}
          bgGradient="radial(teal.500, transparent 70%)"
          opacity={0.12}
          filter="blur(40px)"
          pointerEvents="none"
        />

        <Center>
          <VStack spacing={{ base: 6, md: 8 }} maxW="1180px" w="full">
            <Box
              w="full"
              bg={panelBg}
              border="1px solid"
              borderColor={borderColor}
              borderRadius={{ base: "2xl", md: "3xl" }}
              px={{ base: 5, md: 10 }}
              py={{ base: 8, md: 12 }}
              boxShadow="0 30px 80px rgba(0,0,0,0.35)"
              position="relative"
              overflow="hidden"
            >
              <Stack
                direction={{ base: "column", lg: "row" }}
                spacing={{ base: 8, lg: 10 }}
                align="stretch"
              >
                <VStack align="start" spacing={5} flex="1">
                  <HStack
                    spacing={2}
                    px={3}
                    py={1.5}
                    borderRadius="full"
                    bg={subtlePanelBg}
                    border="1px solid"
                    borderColor={borderColor}
                  >
                    <Icon as={InfoOutlineIcon} color={accent} />
                    <Text fontSize="sm" color={mutedColor} fontWeight="medium">
                      About StoryType
                    </Text>
                  </HStack>

                  <VStack align="start" spacing={3}>
                    <Heading
                      color={headingColor}
                      fontSize={{ base: "3xl", md: "5xl" }}
                      lineHeight="1.02"
                      letterSpacing="-0.04em"
                    >
                      A typing platform built to feel intentional.
                    </Heading>
                    <Text
                      color={bodyColor}
                      fontSize={{ base: "md", md: "lg" }}
                      maxW="680px"
                      lineHeight="1.8"
                    >
                      StoryType turns typing practice into a sharper experience:
                      better text, clearer feedback, and progression that feels
                      more like training than repetition.
                    </Text>
                  </VStack>

                  <HStack spacing={3} flexWrap="wrap">
                    <Button
                      colorScheme="teal"
                      size="lg"
                      rightIcon={<ArrowForwardIcon />}
                      onClick={() => router.push("/type")}
                    >
                      Start Typing
                    </Button>
                    <Button
                      variant="outline"
                      color="gray.200"
                      borderColor="whiteAlpha.200"
                      size="lg"
                      onClick={() => router.push("/training")}
                      _hover={{ bg: "whiteAlpha.100" }}
                    >
                      Explore Training
                    </Button>
                  </HStack>
                </VStack>

                <Box
                  flex={{ base: "none", lg: "0 0 360px" }}
                  bg={subtlePanelBg}
                  border="1px solid"
                  borderColor={borderColor}
                  borderRadius="2xl"
                  p={{ base: 5, md: 6 }}
                >
                  <VStack align="start" spacing={4}>
                    <Text
                      color={accent}
                      fontSize="sm"
                      fontWeight="bold"
                      letterSpacing="0.12em"
                      textTransform="uppercase"
                    >
                      Why It Exists
                    </Text>
                    <Text color={bodyColor} lineHeight="1.9">
                      Most typing tools optimize for speed alone. StoryType is
                      designed to make practice readable, measurable, and worth
                      returning to whether the goal is daily improvement,
                      focused training, or competitive play.
                    </Text>
                    <VStack align="start" spacing={2} w="full">
                      {highlights.map((item) => (
                        <HStack
                          key={item}
                          spacing={3}
                          w="full"
                          px={3}
                          py={2.5}
                          borderRadius="xl"
                          bg="blackAlpha.200"
                        >
                          <Icon as={StarIcon} color={accent} boxSize={4} />
                          <Text color={bodyColor} fontSize="sm">
                            {item}
                          </Text>
                        </HStack>
                      ))}
                    </VStack>
                  </VStack>
                </Box>
              </Stack>
            </Box>

            <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} spacing={5} w="full">
              {pillars.map((pillar) => (
                <Box
                  key={pillar.title}
                  bg={panelBg}
                  border="1px solid"
                  borderColor={borderColor}
                  borderRadius="2xl"
                  p={{ base: 5, md: 6 }}
                  minH="240px"
                  transition="transform 0.2s ease, border-color 0.2s ease"
                  _hover={{
                    transform: "translateY(-4px)",
                    borderColor: "whiteAlpha.300",
                  }}
                >
                  <VStack align="start" spacing={4}>
                    <Box
                      w="48px"
                      h="48px"
                      borderRadius="xl"
                      bg="teal.500"
                      color="white"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      boxShadow="0 10px 30px rgba(49,151,149,0.28)"
                    >
                      <Icon as={pillar.icon} boxSize={5} />
                    </Box>
                    <Heading
                      size="md"
                      color={headingColor}
                      lineHeight="1.3"
                    >
                      {pillar.title}
                    </Heading>
                    <Text color={mutedColor} lineHeight="1.8" fontSize="sm">
                      {pillar.description}
                    </Text>
                  </VStack>
                </Box>
              ))}
            </SimpleGrid>

            <Box
              w="full"
              bg={panelBg}
              border="1px solid"
              borderColor={borderColor}
              borderRadius="2xl"
              p={{ base: 5, md: 7 }}
            >
              <Stack
                direction={{ base: "column", lg: "row" }}
                spacing={{ base: 6, md: 8 }}
                justify="space-between"
                align={{ base: "start", lg: "center" }}
              >
                <VStack align="start" spacing={3} maxW="720px">
                  <Badge
                    colorScheme="teal"
                    variant="subtle"
                    px={3}
                    py={1}
                    borderRadius="full"
                  >
                    Product Focus
                  </Badge>
                  <Heading size={{ base: "md", md: "lg" }} color={headingColor}>
                    Built for people who want more than a timer and a text box.
                  </Heading>
                  <Text color={mutedColor} lineHeight="1.8">
                    The platform combines readable sessions, measurable
                    performance, structured lessons, and competitive modes into
                    a single workflow that supports both casual practice and
                    deliberate skill-building.
                  </Text>
                </VStack>

                <Button
                  colorScheme="teal"
                  variant="outline"
                  size="lg"
                  leftIcon={<RepeatIcon />}
                  onClick={() => router.push("/leaderboard")}
                >
                  View Leaderboard
                </Button>
              </Stack>
            </Box>
          </VStack>
        </Center>
      </Box>
    </>
  );
}
