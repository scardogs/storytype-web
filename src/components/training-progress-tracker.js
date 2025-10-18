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
} from "@chakra-ui/react";
import {
  FaTrophy,
  FaChartLine,
  FaClock,
  FaBullseye,
  FaGraduationCap,
  FaFire,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

export default function TrainingProgressTracker({ moduleId = null }) {
  const { user } = useAuth();
  const [progress, setProgress] = useState([]);
  const [userSkills, setUserSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

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
    const totalLessons = progress.length;
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
          ? Math.round((completedLessons.length / totalLessons) * 100)
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
              <Text color="gray.600">{stats.completionRate}%</Text>
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
                <Box key={skill._id} p={4} bg="gray.50" borderRadius="lg">
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
                      color="gray.600"
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
                <Box key={p._id} p={3} bg="gray.50" borderRadius="lg">
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
                        <Text fontSize="xs" color="gray.600">
                          {p.attempts} attempts
                        </Text>
                      </HStack>
                    </VStack>
                    <VStack align="end" spacing={1}>
                      <Text fontSize="sm" fontWeight="medium">
                        {p.bestScore?.wpm || 0} WPM
                      </Text>
                      <Text fontSize="xs" color="gray.600">
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
