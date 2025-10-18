import React from "react";
import {
  Box,
  Heading,
  Text,
  Badge,
  Button,
  VStack,
  HStack,
  Icon,
  Flex,
  useColorModeValue,
  Tooltip,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from "@chakra-ui/react";
import {
  FaPlay,
  FaLock,
  FaCheckCircle,
  FaClock,
  FaTarget,
  FaBookOpen,
  FaDumbbell,
  FaClipboardCheck,
  FaStar,
} from "react-icons/fa";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";

export default function TrainingLessonCard({ lesson, userProgress = null }) {
  const router = useRouter();
  const { user } = useAuth();

  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const hoverBg = useColorModeValue("gray.50", "gray.750");

  const getLessonTypeIcon = (type) => {
    switch (type) {
      case "theory":
        return FaBookOpen;
      case "practice":
        return FaPlay;
      case "drill":
        return FaDumbbell;
      case "assessment":
        return FaClipboardCheck;
      default:
        return FaBookOpen;
    }
  };

  const getLessonTypeColor = (type) => {
    switch (type) {
      case "theory":
        return "blue";
      case "practice":
        return "green";
      case "drill":
        return "orange";
      case "assessment":
        return "purple";
      default:
        return "gray";
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "easy":
        return "green";
      case "medium":
        return "yellow";
      case "hard":
        return "red";
      default:
        return "gray";
    }
  };

  const isUnlocked = userProgress ? userProgress.status !== "locked" : true;
  const isCompleted = userProgress
    ? userProgress.status === "completed" || userProgress.status === "mastered"
    : false;
  const isMastered = userProgress ? userProgress.status === "mastered" : false;

  const handleStartLesson = () => {
    if (!user) {
      router.push("/profile");
      return;
    }
    router.push(`/training/lessons/${lesson._id}`);
  };

  return (
    <Box
      bg={cardBg}
      borderRadius="lg"
      p={5}
      border="1px solid"
      borderColor={borderColor}
      boxShadow="md"
      transition="all 0.2s"
      _hover={{
        transform: "translateY(-1px)",
        boxShadow: "lg",
        bg: hoverBg,
      }}
      opacity={isUnlocked ? 1 : 0.6}
      cursor={isUnlocked ? "pointer" : "not-allowed"}
      onClick={isUnlocked ? handleStartLesson : undefined}
    >
      <VStack spacing={3} align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="start">
          <HStack spacing={3}>
            <Icon
              as={getLessonTypeIcon(lesson.lessonType)}
              boxSize={5}
              color={getLessonTypeColor(lesson.lessonType) + ".400"}
            />
            <VStack align="start" spacing={1}>
              <Heading size="sm">{lesson.title}</Heading>
              <HStack spacing={2}>
                <Badge
                  colorScheme={getLessonTypeColor(lesson.lessonType)}
                  size="sm"
                >
                  {lesson.lessonType}
                </Badge>
                <Badge
                  colorScheme={getDifficultyColor(lesson.difficulty)}
                  size="sm"
                >
                  {lesson.difficulty}
                </Badge>
              </HStack>
            </VStack>
          </HStack>
          {!isUnlocked && <Icon as={FaLock} color="gray.400" boxSize={4} />}
          {isMastered && <Icon as={FaStar} color="gold" boxSize={4} />}
        </Flex>

        {/* Description */}
        <Text color="gray.600" fontSize="sm">
          {lesson.description}
        </Text>

        {/* Lesson Content Preview */}
        {lesson.content && (
          <VStack spacing={2} align="stretch">
            <HStack spacing={4}>
              <Stat size="sm">
                <StatLabel fontSize="xs">Target WPM</StatLabel>
                <StatNumber fontSize="sm">
                  {lesson.content.expectedWPM}
                </StatNumber>
              </Stat>
              <Stat size="sm">
                <StatLabel fontSize="xs">Target Accuracy</StatLabel>
                <StatNumber fontSize="sm">
                  {lesson.content.targetAccuracy}%
                </StatNumber>
              </Stat>
              <Stat size="sm">
                <StatLabel fontSize="xs">Time Limit</StatLabel>
                <StatNumber fontSize="sm">
                  {lesson.content.timeLimit}s
                </StatNumber>
              </Stat>
            </HStack>
          </VStack>
        )}

        {/* User Progress */}
        {userProgress && userProgress.status !== "not_started" && (
          <VStack spacing={2} align="stretch">
            <HStack justify="space-between">
              <Text fontSize="sm" fontWeight="medium">
                Your Progress
              </Text>
              <Badge
                colorScheme={
                  isMastered ? "green" : isCompleted ? "blue" : "yellow"
                }
                size="sm"
              >
                {userProgress.status.replace("_", " ")}
              </Badge>
            </HStack>
            <HStack spacing={4}>
              <Stat size="sm">
                <StatLabel fontSize="xs">Best WPM</StatLabel>
                <StatNumber fontSize="sm">
                  {userProgress.bestScore?.wpm || 0}
                </StatNumber>
              </Stat>
              <Stat size="sm">
                <StatLabel fontSize="xs">Best Accuracy</StatLabel>
                <StatNumber fontSize="sm">
                  {userProgress.bestScore?.accuracy || 0}%
                </StatNumber>
              </Stat>
              <Stat size="sm">
                <StatLabel fontSize="xs">Attempts</StatLabel>
                <StatNumber fontSize="sm">
                  {userProgress.attempts || 0}
                </StatNumber>
              </Stat>
            </HStack>
          </VStack>
        )}

        {/* Skills */}
        {lesson.skills && lesson.skills.length > 0 && (
          <HStack spacing={2} flexWrap="wrap">
            {lesson.skills.slice(0, 3).map((skill, index) => (
              <Badge key={index} size="sm" variant="subtle" colorScheme="teal">
                {skill}
              </Badge>
            ))}
            {lesson.skills.length > 3 && (
              <Badge size="sm" variant="subtle" colorScheme="gray">
                +{lesson.skills.length - 3}
              </Badge>
            )}
          </HStack>
        )}

        {/* Action Button */}
        <Button
          colorScheme={
            isMastered
              ? "green"
              : isCompleted
              ? "blue"
              : getLessonTypeColor(lesson.lessonType)
          }
          size="sm"
          leftIcon={<FaPlay />}
          isDisabled={!isUnlocked}
          onClick={(e) => {
            e.stopPropagation();
            handleStartLesson();
          }}
        >
          {isMastered
            ? "Review"
            : isCompleted
            ? "Retry"
            : isUnlocked
            ? "Start Lesson"
            : "Locked"}
        </Button>
      </VStack>
    </Box>
  );
}
