import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  useColorModeValue,
  Flex,
  Spinner,
  Alert,
  AlertIcon,
  Badge,
  SimpleGrid,
  Icon,
  Progress,
  Divider,
} from "@chakra-ui/react";
import {
  FaArrowLeft,
  FaPlay,
  FaLock,
  FaCheckCircle,
  FaGraduationCap,
  FaClock,
  FaStar,
} from "react-icons/fa";
import { useRouter } from "next/router";
import { useAuth } from "../../../context/AuthContext";
import Navbar from "../../../components/navbar";
import TrainingLessonCard from "../../../components/training-lesson-card";

export default function TrainingModuleDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();

  const [module, setModule] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const pageBg = useColorModeValue("gray.50", "gray.900");

  useEffect(() => {
    if (id) {
      fetchModule();
      fetchLessons();
    }
  }, [id, fetchModule, fetchLessons]);

  const fetchModule = useCallback(async () => {
    try {
      const response = await fetch(`/api/training/modules?moduleId=${id}`);
      const data = await response.json();

      if (data.success && data.modules.length > 0) {
        setModule(data.modules[0]);
      }
    } catch (error) {
      console.error("Error fetching module:", error);
    }
  }, [id]);

  const fetchLessons = useCallback(async () => {
    try {
      const response = await fetch(`/api/training/lessons?moduleId=${id}`);
      const data = await response.json();

      if (data.success) {
        setLessons(data.lessons);
      }
    } catch (error) {
      console.error("Error fetching lessons:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

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

  const calculateProgress = () => {
    if (!lessons.length) return { completed: 0, total: 0, rate: 0 };

    const completed = lessons.filter(
      (lesson) =>
        lesson.userProgress &&
        (lesson.userProgress.status === "completed" ||
          lesson.userProgress.status === "mastered")
    ).length;

    return {
      completed,
      total: lessons.length,
      rate: Math.round((completed / lessons.length) * 100),
    };
  };

  const progress = calculateProgress();

  if (loading) {
    return (
      <>
        <Navbar />
        <Flex justify="center" align="center" minH="400px">
          <Spinner size="xl" color="teal.400" />
        </Flex>
      </>
    );
  }

  if (!module) {
    return (
      <>
        <Navbar />
        <Alert status="error">
          <AlertIcon />
          Training module not found
        </Alert>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Box bg={pageBg} minH="100vh" p={6}>
        <VStack spacing={8} maxW="1200px" mx="auto">
          {/* Header */}
          <Box
            bg={cardBg}
            borderRadius="xl"
            p={8}
            w="full"
            boxShadow="lg"
            border="1px solid"
            borderColor={borderColor}
          >
            <VStack spacing={6} align="stretch">
              <HStack justify="space-between" align="start">
                <Button
                  leftIcon={<FaArrowLeft />}
                  variant="ghost"
                  onClick={() => router.push("/training")}
                >
                  Back to Training
                </Button>
              </HStack>

              <HStack spacing={4} align="start">
                <Icon
                  as={getCategoryIcon(module.category)}
                  boxSize={12}
                  color={module.color + ".400"}
                />
                <VStack align="start" spacing={2}>
                  <Heading size="xl">{module.title}</Heading>
                  <Text color="gray.600" fontSize="lg">
                    {module.description}
                  </Text>
                  <HStack spacing={2}>
                    <Badge
                      colorScheme={getDifficultyColor(module.difficulty)}
                      size="lg"
                    >
                      {module.difficulty}
                    </Badge>
                    <Badge
                      variant="outline"
                      colorScheme={module.color}
                      size="lg"
                    >
                      {module.category}
                    </Badge>
                  </HStack>
                </VStack>
              </HStack>

              {/* Progress */}
              {user && (
                <VStack spacing={3} align="stretch">
                  <HStack justify="space-between">
                    <Text fontWeight="medium">Module Progress</Text>
                    <Text color="gray.600">{progress.rate}% Complete</Text>
                  </HStack>
                  <Progress
                    value={progress.rate}
                    colorScheme={module.color}
                    size="lg"
                    borderRadius="full"
                  />
                  <HStack
                    justify="space-between"
                    fontSize="sm"
                    color="gray.600"
                  >
                    <Text>
                      {progress.completed} of {progress.total} lessons completed
                    </Text>
                    <Text>~{module.estimatedDuration} minutes total</Text>
                  </HStack>
                </VStack>
              )}

              {/* Tags */}
              {module.tags && module.tags.length > 0 && (
                <HStack spacing={2} flexWrap="wrap">
                  <Text fontWeight="medium" fontSize="sm">
                    Skills:
                  </Text>
                  {module.tags.map((tag, index) => (
                    <Badge
                      key={index}
                      size="sm"
                      variant="subtle"
                      colorScheme="gray"
                    >
                      {tag}
                    </Badge>
                  ))}
                </HStack>
              )}
            </VStack>
          </Box>

          {/* Lessons */}
          <VStack spacing={6} align="stretch" w="full">
            <Heading size="lg">Lessons</Heading>

            {lessons.length === 0 ? (
              <Box
                bg={cardBg}
                borderRadius="lg"
                p={8}
                textAlign="center"
                border="1px solid"
                borderColor={borderColor}
              >
                <Icon
                  as={FaGraduationCap}
                  boxSize={12}
                  color="gray.400"
                  mb={4}
                />
                <Heading size="md" mb={2}>
                  No lessons available
                </Heading>
                <Text color="gray.600">
                  This module doesn&apos;t have any lessons yet. Check back
                  later!
                </Text>
              </Box>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                {lessons.map((lesson) => (
                  <TrainingLessonCard
                    key={lesson._id}
                    lesson={lesson}
                    userProgress={lesson.userProgress}
                  />
                ))}
              </SimpleGrid>
            )}
          </VStack>

          {/* Prerequisites */}
          {module.prerequisites && module.prerequisites.length > 0 && (
            <Box
              bg={cardBg}
              borderRadius="lg"
              p={6}
              border="1px solid"
              borderColor={borderColor}
            >
              <VStack spacing={4} align="stretch">
                <HStack spacing={2}>
                  <Icon as={FaLock} color="orange.400" />
                  <Heading size="md">Prerequisites</Heading>
                </HStack>
                <Text color="gray.600">
                  Complete these modules first to unlock this training:
                </Text>
                <VStack spacing={2} align="stretch">
                  {module.prerequisites.map((prereq, index) => (
                    <HStack key={index} spacing={3}>
                      <Icon as={FaCheckCircle} color="green.400" />
                      <Text>
                        Complete {prereq.moduleId} with {prereq.requiredScore}%
                        score
                      </Text>
                    </HStack>
                  ))}
                </VStack>
              </VStack>
            </Box>
          )}
        </VStack>
      </Box>
    </>
  );
}
