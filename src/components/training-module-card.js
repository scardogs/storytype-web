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
  Progress,
  Tooltip,
  Divider,
} from "@chakra-ui/react";
import {
  FaPlay,
  FaLock,
  FaCheckCircle,
  FaClock,
  FaGraduationCap,
  FaStar,
} from "react-icons/fa";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";

export default function TrainingModuleCard({ module, userProgress = null }) {
  const router = useRouter();
  const { user } = useAuth();

  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const hoverBg = useColorModeValue("gray.50", "gray.750");

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "easy":
        return "green";
      case "medium":
        return "yellow";
      case "hard":
        return "orange";
      case "expert":
        return "red";
      default:
        return "gray";
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "beginner":
        return FaGraduationCap;
      case "advanced":
        return FaStar;
      case "specialized":
        return FaGraduationCap;
      case "daily":
        return FaClock;
      default:
        return FaGraduationCap;
    }
  };

  const isUnlocked = userProgress ? userProgress.isUnlocked : true;
  const completionRate = userProgress ? userProgress.completionRate : 0;
  const isCompleted = completionRate === 100;

  const handleStartModule = () => {
    if (!user) {
      router.push("/profile");
      return;
    }
    router.push(`/training/modules/${module._id}`);
  };

  return (
    <Box
      bg={cardBg}
      borderRadius="xl"
      p={6}
      border="1px solid"
      borderColor={borderColor}
      boxShadow="lg"
      transition="all 0.2s"
      _hover={{
        transform: "translateY(-2px)",
        boxShadow: "xl",
        bg: hoverBg,
      }}
      opacity={isUnlocked ? 1 : 0.6}
      cursor={isUnlocked ? "pointer" : "not-allowed"}
      onClick={isUnlocked ? handleStartModule : undefined}
    >
      <VStack spacing={4} align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="start">
          <HStack spacing={3}>
            <Icon
              as={getCategoryIcon(module.category)}
              boxSize={6}
              color={module.color + ".400"}
            />
            <VStack align="start" spacing={1}>
              <Heading size="md">{module.title}</Heading>
              <HStack spacing={2}>
                <Badge colorScheme={getDifficultyColor(module.difficulty)}>
                  {module.difficulty}
                </Badge>
                <Badge variant="outline" colorScheme={module.color}>
                  {module.category}
                </Badge>
              </HStack>
            </VStack>
          </HStack>
          {!isUnlocked && <Icon as={FaLock} color="gray.400" boxSize={5} />}
        </Flex>

        {/* Description */}
        <Text color="gray.600" fontSize="sm">
          {module.description}
        </Text>

        {/* Progress */}
        {userProgress && (
          <VStack spacing={2} align="stretch">
            <Flex justify="space-between" align="center">
              <Text fontSize="sm" fontWeight="medium">
                Progress
              </Text>
              <Text fontSize="sm" color="gray.600">
                {userProgress.completedLessons}/{userProgress.totalLessons}{" "}
                lessons
              </Text>
            </Flex>
            <Progress
              value={completionRate}
              colorScheme={isCompleted ? "green" : module.color}
              size="sm"
              borderRadius="full"
            />
            {isCompleted && (
              <HStack spacing={1} justify="center">
                <Icon as={FaCheckCircle} color="green.500" boxSize={4} />
                <Text fontSize="sm" color="green.600" fontWeight="medium">
                  Completed!
                </Text>
              </HStack>
            )}
          </VStack>
        )}

        <Divider />

        {/* Stats */}
        <HStack justify="space-between">
          <HStack spacing={4}>
            <HStack spacing={1}>
              <Icon as={FaClock} color="gray.500" boxSize={4} />
              <Text fontSize="sm" color="gray.600">
                {module.estimatedDuration}m
              </Text>
            </HStack>
            <HStack spacing={1}>
              <Icon as={FaGraduationCap} color="gray.500" boxSize={4} />
              <Text fontSize="sm" color="gray.600">
                {module.totalLessons} lessons
              </Text>
            </HStack>
          </HStack>
        </HStack>

        {/* Tags */}
        {module.tags && module.tags.length > 0 && (
          <HStack spacing={2} flexWrap="wrap">
            {module.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} size="sm" variant="subtle" colorScheme="gray">
                {tag}
              </Badge>
            ))}
            {module.tags.length > 3 && (
              <Badge size="sm" variant="subtle" colorScheme="gray">
                +{module.tags.length - 3}
              </Badge>
            )}
          </HStack>
        )}

        {/* Action Button */}
        <Button
          colorScheme={isCompleted ? "green" : module.color}
          leftIcon={<FaPlay />}
          isDisabled={!isUnlocked}
          onClick={(e) => {
            e.stopPropagation();
            handleStartModule();
          }}
        >
          {isCompleted ? "Review" : isUnlocked ? "Start Module" : "Locked"}
        </Button>
      </VStack>
    </Box>
  );
}
