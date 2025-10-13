import React from "react";
import Navbar from "../components/navbar";
import {
  Box,
  Heading,
  Text,
  List,
  ListItem,
  ListIcon,
  IconButton,
  useColorMode,
  Center,
  VStack,
  HStack,
  Button,
  Divider,
  Fade,
  Icon,
  useColorModeValue,
} from "@chakra-ui/react";
import {
  CheckCircleIcon,
  MoonIcon,
  SunIcon,
  InfoOutlineIcon,
  StarIcon,
  AtSignIcon,
  RepeatIcon,
} from "@chakra-ui/icons";
import { FaBookOpen } from "react-icons/fa";
import { useRouter } from "next/router";
import { keyframes } from "@emotion/react";

const featureList = [
  {
    icon: StarIcon,
    text: "Practice typing with immersive, genre-themed stories",
  },
  {
    icon: InfoOutlineIcon,
    text: "Real-time feedback: WPM, accuracy, and error tracking",
  },
  {
    icon: RepeatIcon,
    text: "Unlock new stories and achievements as you progress",
  },
  {
    icon: AtSignIcon,
    text: "Community features and interactive story paths (coming soon!)",
  },
];

export default function InfoPage() {
  const { colorMode, toggleColorMode } = useColorMode();
  const router = useRouter();
  const heroText = useColorModeValue("gray.800", "gray.100");
  const subText = useColorModeValue("gray.600", "gray.300");
  const cardBg = useColorModeValue("gray.900", "gray.700");
  const accent = useColorModeValue("teal.400", "teal.200");
  const fadeIn = keyframes`from { opacity: 0; transform: translateY(20px);} to { opacity: 1; transform: none;}`;
  const dividerColor = useColorModeValue("teal.400", "teal.200");
  const featureBoxBg = useColorModeValue("gray.800", "gray.700");
  const featureHoverBg = useColorModeValue("gray.700", "gray.600");

  return (
    <>
      <Navbar />
      <Box
        minH="100vh"
        bg={useColorModeValue("gray.900", "gray.900")}
        px={4}
        py={10}
      >
        <Center>
          <VStack spacing={8} maxW="2xl" w="full" mx="auto">
            <Fade in>
              <VStack spacing={2}>
                <Icon as={FaBookOpen} boxSize={14} color={accent} mb={2} />
                <Heading
                  size="2xl"
                  color={accent}
                  fontWeight="extrabold"
                  letterSpacing="tight"
                >
                  About StoryType
                </Heading>
              </VStack>
            </Fade>
            <Text fontSize="lg" color={subText} textAlign="center" maxW="2xl">
              StoryType is a unique web application that combines the power of
              creative storytelling with typing practice—a tool designed not
              just to improve typing speed, but also to spark imagination.
            </Text>
            <Box
              w="full"
              bg={cardBg}
              borderRadius="lg"
              p={6}
              boxShadow="lg"
              mt={2}
            >
              <Text fontSize="md" color={heroText} fontWeight="semibold" mb={2}>
                Crafted with care by <b>John Michael Escarlan</b>, a passionate
                Web Developer, StoryType aims to turn the often monotonous task
                of typing drills into an engaging and immersive experience.
                Whether you&#39;re a writer, student, or just someone who wants
                to type faster while exploring original narratives, StoryType
                offers a refreshing way to learn and grow.
              </Text>
              <Text fontSize="md" color={subText} mb={2}>
                John Michael believes that learning doesn&#39;t have to be
                boring. With this app, he merges his love for development and
                storytelling to deliver a project that&#39;s both fun and
                functional. From real-time feedback and typing stats to story
                progression mechanics, every part of StoryType was built with
                the user in mind.
              </Text>
            </Box>
            <Divider my={4} borderColor={dividerColor} />
            <Box
              w="full"
              bg={featureBoxBg}
              borderRadius="lg"
              p={6}
              boxShadow="md"
            >
              <Heading size="md" color={accent} mb={3}>
                💡 Key Features
              </Heading>
              <VStack align="start" spacing={3}>
                {featureList.map((feature, idx) => (
                  <HStack
                    key={feature.text}
                    animation={`${fadeIn} 0.5s ease ${0.1 * idx}s both`}
                    _hover={{
                      transform: "scale(1.04)",
                      bg: featureHoverBg,
                    }}
                    px={2}
                    py={1}
                    borderRadius="md"
                    transition="all 0.2s"
                  >
                    <Icon as={feature.icon} color={accent} boxSize={5} />
                    <Text color={subText} fontSize="md">
                      {feature.text}
                    </Text>
                  </HStack>
                ))}
              </VStack>
            </Box>
            <Button
              colorScheme="teal"
              size="lg"
              mt={6}
              px={8}
              py={6}
              fontSize="xl"
              borderRadius="full"
              boxShadow="md"
              _hover={{ boxShadow: "xl", transform: "scale(1.05)" }}
              onClick={() => router.push("/type")}
            >
              Try Typing Adventure
            </Button>
          </VStack>
        </Center>
      </Box>
    </>
  );
}
