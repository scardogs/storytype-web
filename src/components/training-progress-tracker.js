import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Progress,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useColorModeValue,
  Badge,
  Icon,
  Flex,
  Divider,
  Button,
} from "@chakra-ui/react";
import {
  FaTrophy,
  FaChartLine,
  FaClock,
  FaBullseye,
  FaGraduationCap,
  FaFire,
  FaArrowRight,
} from "react-icons/fa";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";

export default function TrainingProgressTracker({ moduleId = null }) {
  const { user } = useAuth();
  const router = useRouter();
  const [progress, setProgress] = useState([]);
  const [userSkills, setUserSkills] = useState([]);
  const [recommendation, setRecommendation] = useState(null);
  const [summary, setSummary] = useState({
    totalLessonsAvailable: 0,
    completedLessons: 0,
    masteredLessons: 0,
  });
  const [loading, setLoading] = useState(true);

  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const mutedText = useColorModeValue("gray.600", "gray.300");
  const subCardBg = useColorModeValue("gray.50", "gray.900");
  const subCardBorder = useColorModeValue("gray.100", "gray.700");
  const subCardText = useColorModeValue("gray.600", "gray.300");
  const suggestionBg = useColorModeValue("teal.50", "teal.900");
  const suggestionBorder = useColorModeValue("teal.200", "teal.700");
  const suggestionText = useColorModeValue("teal.800", "teal.100");
  const suggestionMuted = useColorModeValue("teal.700", "teal.200");

  useEffect(() => {
    if (user) {
      fetchProgress();
    }
  }, [user, moduleId]);

  const fetchProgress = async () => {
    try {
      const params = new URLSearchParams();
      if (moduleId) params.append("moduleId", moduleId);

      const response = await fetch(`/api/training/progress?${params}`);
      const data = await response.json();

      if (data.success) {
        setProgress(data.progress || []);
        setUserSkills(data.userSkills || []);
        setRecommendation(data.recommendation || null);
        setSummary(
          data.stats || {
            totalLessonsAvailable: 0,
            completedLessons: 0,
            masteredLessons: 0,
          }
        );
      }
    } catch (error) {
      console.error("Error fetching progress:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const completedLessons = progress.filter(
      (p) => p.status === "completed" || p.status === "mastered"
    );
    const totalLessons = summary.totalLessonsAvailable || progress.length;
    const masteredLessons = progress.filter((p) => p.status === "mastered");
    const totalTimeSpent = progress.reduce(
      (sum, p) => sum + (p.timeSpent || 0),
      0
    );
    const averageAccuracy =
      progress.length > 0
        ? Math.round(
            progress.reduce((sum, p) => sum + (p.bestScore?.accuracy || 0), 0) /
              progress.length
          )
        : 0;
    const averageWPM =
      progress.length > 0
        ? Math.round(
            progress.reduce((sum, p) => sum + (p.bestScore?.wpm || 0), 0) /
              progress.length
          )
        : 0;

    return {
      completedLessons: completedLessons.length,
      totalLessons,
      masteredLessons: masteredLessons.length,
      totalTimeSpent,
      averageAccuracy,
      averageWPM,
      completionRate:
        totalLessons > 0
          ? Math.round(
              ((summary.completedLessons || completedLessons.length) /
                totalLessons) *
                100
            )
          : 0,
    };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <Box
        bg={cardBg}
        borderRadius="xl"
        p={6}
        border="1px solid"
        borderColor={borderColor}
      >
        <Text>Loading progress...</Text>
      </Box>
    );
  }

  return (
    <VStack spacing={6} align="stretch">
      {recommendation && (
        <Box
          bg={suggestionBg}
          borderRadius="xl"
          p={6}
          border="1px solid"
          borderColor={suggestionBorder}
          boxShadow="lg"
        >
          <VStack spacing={4} align="stretch">
            <HStack justify="space-between" align="start" flexWrap="wrap">
              <HStack spacing={2}>
                <Icon as={FaFire} color="orange.400" boxSize={5} />
                <Heading size="md" color={suggestionText}>
                  Suggested Next
                </Heading>
              </HStack>
              <Badge colorScheme="teal" variant="subtle">
                Recommended for you
              </Badge>
            </HStack>

            <Box>
              <Text fontWeight="bold" fontSize="lg" color={suggestionText}>
                {recommendation.lessonTitle}
              </Text>
              <Text fontSize="sm" color={suggestionMuted} mt={1}>
                {recommendation.moduleTitle}
              </Text>
              <Text fontSize="sm" color={mutedText} mt={3} lineHeight="1.7">
                {recommendation.reason}
              </Text>
            </Box>

            <Text color={mutedText} fontSize="sm" lineHeight="1.7">
              {recommendation.lessonDescription}
            </Text>

            <HStack spacing={2} flexWrap="wrap">
              {recommendation.targetWPM > 0 && (
                <Badge colorScheme="blue">Target {recommendation.targetWPM} WPM</Badge>
              )}
              {recommendation.targetAccuracy > 0 && (
                <Badge colorScheme="green">
                  Target {recommendation.targetAccuracy}% accuracy
                </Badge>
              )}
              <Badge colorScheme="purple" variant="outline">
                {recommendation.lessonType}
              </Badge>
            </HStack>

            <HStack spacing={3} flexWrap="wrap">
              <Button
                colorScheme="teal"
                leftIcon={<FaArrowRight />}
                onClick={() =>
                  router.push(`/training/lessons/${recommendation.lessonId}`)
                }
              >
                Start Lesson
              </Button>
              <Button
                variant="ghost"
                color={suggestionText}
                onClick={() =>
                  router.push(`/training/modules/${recommendation.moduleId}`)
                }
              >
                View Module
              </Button>
            </HStack>
          </VStack>
        </Box>
      )}

      {/* Overall Progress */}
      <Box
        bg={cardBg}
        borderRadius="xl"
        p={6}
        border="1px solid"
        borderColor={borderColor}
        boxShadow="lg"
      >
        <VStack spacing={4} align="stretch">
          <HStack spacing={2}>
            <Icon as={FaChartLine} color="teal.400" boxSize={5} />
            <Heading size="md">Training Progress</Heading>
          </HStack>

          <VStack spacing={3} align="stretch">
            <Flex justify="space-between" align="center">
              <Text fontWeight="medium">Overall Completion</Text>
              <Text color={mutedText}>{stats.completionRate}%</Text>
            </Flex>
            <Progress
              value={stats.completionRate}
              colorScheme="teal"
              size="lg"
              borderRadius="full"
            />
          </VStack>

          <Divider />

          {/* Stats Grid */}
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
            <Stat textAlign="center">
              <StatLabel fontSize="sm">Completed</StatLabel>
              <StatNumber color="green.500">
                {stats.completedLessons}
              </StatNumber>
              <StatHelpText fontSize="xs">
                {stats.totalLessons} total
              </StatHelpText>
            </Stat>

            <Stat textAlign="center">
              <StatLabel fontSize="sm">Mastered</StatLabel>
              <StatNumber color="gold">{stats.masteredLessons}</StatNumber>
              <StatHelpText fontSize="xs">Perfect scores</StatHelpText>
            </Stat>

            <Stat textAlign="center">
              <StatLabel fontSize="sm">Avg WPM</StatLabel>
              <StatNumber color="blue.500">{stats.averageWPM}</StatNumber>
              <StatHelpText fontSize="xs">Words per minute</StatHelpText>
            </Stat>

            <Stat textAlign="center">
              <StatLabel fontSize="sm">Avg Accuracy</StatLabel>
              <StatNumber color="purple.500">
                {stats.averageAccuracy}%
              </StatNumber>
              <StatHelpText fontSize="xs">Typing accuracy</StatHelpText>
            </Stat>
          </SimpleGrid>
        </VStack>
      </Box>

      {/* Skills Overview */}
      {userSkills.length > 0 && (
        <Box
          bg={cardBg}
          borderRadius="xl"
          p={6}
          border="1px solid"
          borderColor={borderColor}
          boxShadow="lg"
        >
          <VStack spacing={4} align="stretch">
            <HStack spacing={2}>
              <Icon as={FaBullseye} color="orange.400" boxSize={5} />
              <Heading size="md">Skills Overview</Heading>
            </HStack>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              {userSkills.map((skill) => (
                <Box
                  key={skill._id}
                  p={4}
                  bg={subCardBg}
                  borderRadius="lg"
                  border="1px solid"
                  borderColor={subCardBorder}
                >
                  <VStack spacing={2} align="stretch">
                    <HStack justify="space-between">
                      <Text fontWeight="medium">{skill.skillName}</Text>
                      <Badge
                        colorScheme={
                          skill.score >= 80
                            ? "green"
                            : skill.score >= 60
                            ? "yellow"
                            : "red"
                        }
                        size="sm"
                      >
                        {skill.score}%
                      </Badge>
                    </HStack>

                    <Progress
                      value={skill.score}
                      colorScheme={
                        skill.score >= 80
                          ? "green"
                          : skill.score >= 60
                          ? "yellow"
                          : "red"
                      }
                      size="sm"
                      borderRadius="full"
                    />

                    <HStack
                      justify="space-between"
                      fontSize="xs"
                      color={subCardText}
                    >
                      <Text>WPM: {skill.averageWPM}</Text>
                      <Text>Accuracy: {skill.averageAccuracy}%</Text>
                    </HStack>
                  </VStack>
                </Box>
              ))}
            </SimpleGrid>
          </VStack>
        </Box>
      )}

      {/* Recent Activity */}
      {progress.length > 0 && (
        <Box
          bg={cardBg}
          borderRadius="xl"
          p={6}
          border="1px solid"
          borderColor={borderColor}
          boxShadow="lg"
        >
          <VStack spacing={4} align="stretch">
            <HStack spacing={2}>
              <Icon as={FaClock} color="blue.400" boxSize={5} />
              <Heading size="md">Recent Activity</Heading>
            </HStack>

            <VStack spacing={3} align="stretch">
              {progress.slice(0, 5).map((p) => (
                <Box
                  key={p._id}
                  p={3}
                  bg={subCardBg}
                  borderRadius="lg"
                  border="1px solid"
                  borderColor={subCardBorder}
                >
                  <HStack justify="space-between">
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="medium" fontSize="sm">
                        {p.lessonId?.title || "Lesson"}
                      </Text>
                      <HStack spacing={2}>
                        <Badge
                          colorScheme={
                            p.status === "mastered"
                              ? "green"
                              : p.status === "completed"
                              ? "blue"
                              : "gray"
                          }
                          size="sm"
                        >
                          {p.status.replace("_", " ")}
                        </Badge>
                        <Text fontSize="xs" color={subCardText}>
                          {p.attempts} attempts
                        </Text>
                      </HStack>
                    </VStack>
                    <VStack align="end" spacing={1}>
                      <Text fontSize="sm" fontWeight="medium">
                        {p.bestScore?.wpm || 0} WPM
                      </Text>
                      <Text fontSize="xs" color={subCardText}>
                        {p.bestScore?.accuracy || 0}% accuracy
                      </Text>
                    </VStack>
                  </HStack>
                </Box>
              ))}
            </VStack>
          </VStack>
        </Box>
      )}
    </VStack>
  );
}
