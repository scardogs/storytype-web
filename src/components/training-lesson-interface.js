import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Icon,
  useColorModeValue,
  Flex,
  Spinner,
  Alert,
  AlertIcon,
  Badge,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Divider,
  SimpleGrid,
} from "@chakra-ui/react";
import {
  FaPlay,
  FaPause,
  FaRedo,
  FaCheck,
  FaClock,
  FaTarget,
  FaBookOpen,
  FaLightbulb,
} from "react-icons/fa";
import TypePage from "./type-page";

export default function TrainingLessonInterface({ lessonId }) {
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [gameResults, setGameResults] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  useEffect(() => {
    if (lessonId) {
      fetchLesson();
    }
  }, [lessonId]);

  const fetchLesson = async () => {
    try {
      const response = await fetch(
        `/api/training/lessons?lessonId=${lessonId}`
      );
      const data = await response.json();

      if (data.success && data.lessons.length > 0) {
        setLesson(data.lessons[0]);
      }
    } catch (error) {
      console.error("Error fetching lesson:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGameStart = () => {
    setGameStarted(true);
    setGameEnded(false);
    setGameResults(null);
  };

  const handleGameEnd = async (results) => {
    setGameEnded(true);
    setGameResults(results);
    setGameStarted(false);

    // Submit progress to backend
    await submitProgress(results);
  };

  const submitProgress = async (results) => {
    if (!lesson) return;

    setSubmitting(true);
    try {
      const response = await fetch("/api/training/progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          moduleId: lesson.moduleId,
          lessonId: lesson._id,
          wpm: results.wpm,
          accuracy: results.accuracy,
          timeCompleted: results.duration,
          errors: results.totalErrors,
          wordsTyped: results.wordsTyped,
          timeSpent: results.duration,
        }),
      });

      const data = await response.json();
      if (!data.success) {
        console.error("Failed to submit progress:", data.message);
      }
    } catch (error) {
      console.error("Error submitting progress:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRestart = () => {
    setGameStarted(false);
    setGameEnded(false);
    setGameResults(null);
  };

  const getPerformanceFeedback = () => {
    if (!lesson || !gameResults) return null;

    const wpmTarget = lesson.content.expectedWPM;
    const accuracyTarget = lesson.content.targetAccuracy;

    const wpmAchieved = gameResults.wpm >= wpmTarget;
    const accuracyAchieved = gameResults.accuracy >= accuracyTarget;

    if (wpmAchieved && accuracyAchieved) {
      return {
        status: "success",
        message: "Excellent! You've mastered this lesson!",
        color: "green",
      };
    } else if (accuracyAchieved) {
      return {
        status: "info",
        message: "Good accuracy! Try to improve your speed.",
        color: "blue",
      };
    } else if (wpmAchieved) {
      return {
        status: "warning",
        message: "Good speed! Focus on accuracy.",
        color: "yellow",
      };
    } else {
      return {
        status: "error",
        message: "Keep practicing to reach the targets!",
        color: "red",
      };
    }
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="400px">
        <Spinner size="xl" color="teal.400" />
      </Flex>
    );
  }

  if (!lesson) {
    return (
      <Alert status="error">
        <AlertIcon />
        Lesson not found
      </Alert>
    );
  }

  const feedback = getPerformanceFeedback();

  return (
    <VStack spacing={6} maxW="1200px" mx="auto">
      {/* Lesson Header */}
      <Box
        bg={cardBg}
        borderRadius="xl"
        p={6}
        w="full"
        boxShadow="lg"
        border="1px solid"
        borderColor={borderColor}
      >
        <VStack spacing={4} align="stretch">
          <HStack justify="space-between" align="start">
            <VStack align="start" spacing={2}>
              <Heading size="lg">{lesson.title}</Heading>
              <Text color="gray.600">{lesson.description}</Text>
              <HStack spacing={2}>
                <Badge colorScheme="blue">{lesson.lessonType}</Badge>
                <Badge colorScheme="orange">{lesson.difficulty}</Badge>
              </HStack>
            </VStack>
          </HStack>

          {/* Lesson Instructions */}
          <Box p={4} bg="blue.50" borderRadius="lg">
            <HStack spacing={2} mb={2}>
              <Icon as={FaBookOpen} color="blue.500" />
              <Text fontWeight="medium" color="blue.700">
                Instructions
              </Text>
            </HStack>
            <Text color="blue.600">{lesson.content.instruction}</Text>
          </Box>

          {/* Targets */}
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
            <Stat textAlign="center" p={3} bg="gray.50" borderRadius="lg">
              <StatLabel fontSize="sm">Target WPM</StatLabel>
              <StatNumber color="blue.500">
                {lesson.content.expectedWPM}
              </StatNumber>
            </Stat>
            <Stat textAlign="center" p={3} bg="gray.50" borderRadius="lg">
              <StatLabel fontSize="sm">Target Accuracy</StatLabel>
              <StatNumber color="green.500">
                {lesson.content.targetAccuracy}%
              </StatNumber>
            </Stat>
            <Stat textAlign="center" p={3} bg="gray.50" borderRadius="lg">
              <StatLabel fontSize="sm">Time Limit</StatLabel>
              <StatNumber color="orange.500">
                {lesson.content.timeLimit}s
              </StatNumber>
            </Stat>
          </SimpleGrid>

          {/* Hints and Tips */}
          {lesson.content.hints && lesson.content.hints.length > 0 && (
            <Box p={4} bg="yellow.50" borderRadius="lg">
              <HStack spacing={2} mb={2}>
                <Icon as={FaLightbulb} color="yellow.500" />
                <Text fontWeight="medium" color="yellow.700">
                  Hints
                </Text>
              </HStack>
              <VStack align="start" spacing={1}>
                {lesson.content.hints.map((hint, index) => (
                  <Text key={index} fontSize="sm" color="yellow.600">
                    • {hint}
                  </Text>
                ))}
              </VStack>
            </Box>
          )}
        </VStack>
      </Box>

      {/* Game Results */}
      {gameEnded && gameResults && (
        <Box
          bg={cardBg}
          borderRadius="xl"
          p={6}
          w="full"
          boxShadow="lg"
          border="1px solid"
          borderColor={borderColor}
        >
          <VStack spacing={4} align="stretch">
            <HStack justify="space-between">
              <Heading size="md">Lesson Results</Heading>
              <Button
                leftIcon={<FaRedo />}
                variant="outline"
                onClick={handleRestart}
              >
                Try Again
              </Button>
            </HStack>

            {feedback && (
              <Alert status={feedback.status} borderRadius="lg">
                <AlertIcon />
                {feedback.message}
              </Alert>
            )}

            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
              <Stat textAlign="center" p={3} bg="gray.50" borderRadius="lg">
                <StatLabel fontSize="sm">Your WPM</StatLabel>
                <StatNumber
                  color={
                    gameResults.wpm >= lesson.content.expectedWPM
                      ? "green.500"
                      : "red.500"
                  }
                >
                  {gameResults.wpm}
                </StatNumber>
                <StatHelpText fontSize="xs">
                  Target: {lesson.content.expectedWPM}
                </StatHelpText>
              </Stat>

              <Stat textAlign="center" p={3} bg="gray.50" borderRadius="lg">
                <StatLabel fontSize="sm">Your Accuracy</StatLabel>
                <StatNumber
                  color={
                    gameResults.accuracy >= lesson.content.targetAccuracy
                      ? "green.500"
                      : "red.500"
                  }
                >
                  {gameResults.accuracy}%
                </StatNumber>
                <StatHelpText fontSize="xs">
                  Target: {lesson.content.targetAccuracy}%
                </StatHelpText>
              </Stat>

              <Stat textAlign="center" p={3} bg="gray.50" borderRadius="lg">
                <StatLabel fontSize="sm">Words Typed</StatLabel>
                <StatNumber color="blue.500">
                  {gameResults.wordsTyped}
                </StatNumber>
              </Stat>

              <Stat textAlign="center" p={3} bg="gray.50" borderRadius="lg">
                <StatLabel fontSize="sm">Errors</StatLabel>
                <StatNumber color="red.500">
                  {gameResults.totalErrors}
                </StatNumber>
              </Stat>
            </SimpleGrid>

            {submitting && (
              <HStack justify="center" spacing={2}>
                <Spinner size="sm" />
                <Text fontSize="sm">Saving progress...</Text>
              </HStack>
            )}
          </VStack>
        </Box>
      )}

      {/* Game Interface */}
      {!gameEnded && (
        <Box w="full">
          {!gameStarted ? (
            <Box
              bg={cardBg}
              borderRadius="xl"
              p={6}
              w="full"
              boxShadow="lg"
              border="1px solid"
              borderColor={borderColor}
            >
              <VStack spacing={4}>
                <Icon as={FaPlay} boxSize={12} color="teal.400" />
                <Heading size="md">Ready to Start?</Heading>
                <Text color="gray.600" textAlign="center">
                  Click the button below to begin the lesson. Focus on accuracy
                  and try to reach the target WPM.
                </Text>
                <Button
                  colorScheme="teal"
                  size="lg"
                  leftIcon={<FaPlay />}
                  onClick={handleGameStart}
                >
                  Start Lesson
                </Button>
              </VStack>
            </Box>
          ) : (
            <Box
              bg={cardBg}
              borderRadius="xl"
              boxShadow="lg"
              border="1px solid"
              borderColor={borderColor}
              overflow="hidden"
            >
              <TypePage
                tournamentMode={true}
                tournamentRules={lesson.content.specialRules}
                onGameEnd={handleGameEnd}
                tournamentTheme={lesson.content.practiceText || "Training"}
              />
            </Box>
          )}
        </Box>
      )}
    </VStack>
  );
}
