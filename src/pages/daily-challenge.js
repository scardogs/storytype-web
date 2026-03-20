import React, { useEffect, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Icon,
  Image,
  Spinner,
  Text,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { FaCalendarDay, FaFire, FaTrophy } from "react-icons/fa";
import Navbar from "../components/navbar";
import TypePage from "../components/type-page";
import { useAuth } from "../context/AuthContext";

export default function DailyChallengePage() {
  const { user, checkAuth } = useAuth();
  const toast = useToast();
  const [challenge, setChallenge] = useState(null);
  const [progress, setProgress] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [stats, setStats] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;

    const fetchChallenge = async () => {
      try {
        const response = await fetch("/api/daily-challenge");
        const data = await response.json();

        if (active && data.success) {
          setChallenge(data.challenge);
          setProgress(data.userProgress);
          setLeaderboard(data.leaderboard || []);
          setStats(data.stats || null);
          setSchedule(data.schedule || []);
        }
      } catch (error) {
        console.error("Daily challenge page error:", error);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchChallenge();

    return () => {
      active = false;
    };
  }, [user]);

  const handleComplete = async (result) => {
    if (!user || !challenge) {
      toast({
        title: "Challenge finished",
        description: "Sign in to save your daily streak and leaderboard result.",
        status: "info",
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/daily-challenge/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          challengeId: challenge._id,
          wpm: result.wpm,
          accuracy: result.accuracy,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to save challenge result");
      }

      setProgress(data.progress);
      await checkAuth();

      const refreshResponse = await fetch("/api/daily-challenge");
      const refreshData = await refreshResponse.json();
      if (refreshResponse.ok && refreshData.success) {
        setLeaderboard(refreshData.leaderboard || []);
        setStats(refreshData.stats || null);
        setSchedule(refreshData.schedule || []);
      }

      toast({
        title: "Daily challenge saved",
        description: data.progress.metTarget
          ? "You hit the daily target."
          : "Your streak and best result were updated.",
        status: "success",
        duration: 4000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Daily challenge completion error:", error);
      toast({
        title: "Could not save result",
        description: error.message,
        status: "warning",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <Box minH="100vh" bg="gray.900" px={{ base: 3, md: 6 }} py={{ base: 5, md: 8 }}>
        <VStack maxW="1400px" mx="auto" spacing={6} align="stretch">
          {loading ? (
            <Flex minH="60vh" justify="center" align="center">
              <VStack spacing={3}>
                <Spinner size="xl" color="teal.300" />
                <Text color="gray.400">Loading today&apos;s challenge...</Text>
              </VStack>
            </Flex>
          ) : !challenge ? (
            <Box bg="gray.800" borderRadius="2xl" p={8}>
              <Text color="gray.300">No daily challenge is available right now.</Text>
            </Box>
          ) : (
            <>
              <Box
                bg="linear-gradient(135deg, rgba(15,118,110,0.22), rgba(17,24,39,1))"
                border="1px solid"
                borderColor="whiteAlpha.140"
                borderRadius="3xl"
                p={{ base: 5, md: 8 }}
              >
                <Flex
                  direction={{ base: "column", xl: "row" }}
                  justify="space-between"
                  gap={6}
                >
                  <VStack align="start" spacing={4} maxW="760px">
                    <HStack spacing={3}>
                      <Icon as={FaCalendarDay} color="teal.300" boxSize={5} />
                      <Text
                        color="teal.200"
                        textTransform="uppercase"
                        letterSpacing="0.14em"
                        fontSize="xs"
                        fontWeight="700"
                      >
                        Daily Challenge
                      </Text>
                    </HStack>
                    <Heading color="white" fontSize={{ base: "3xl", md: "5xl" }} lineHeight="1">
                      {challenge.title}
                    </Heading>
                    <Text color="gray.300" fontSize={{ base: "md", md: "lg" }} lineHeight="1.8">
                      {challenge.description}
                    </Text>
                    <HStack spacing={3} flexWrap="wrap">
                      <Badge colorScheme="teal" px={3} py={1} borderRadius="full">
                        {challenge.genre}
                      </Badge>
                      <Badge colorScheme="blue" px={3} py={1} borderRadius="full">
                        {challenge.duration}s
                      </Badge>
                      <Badge colorScheme="green" px={3} py={1} borderRadius="full">
                        {challenge.targetWpm} WPM target
                      </Badge>
                      <Badge colorScheme="orange" px={3} py={1} borderRadius="full">
                        {challenge.targetAccuracy}% accuracy
                      </Badge>
                    </HStack>
                  </VStack>

                  <VStack
                    align="stretch"
                    spacing={4}
                    w={{ base: "full", xl: "360px" }}
                  >
                    <Box bg="whiteAlpha.060" border="1px solid" borderColor="whiteAlpha.140" borderRadius="2xl" p={5}>
                      <HStack justify="space-between" mb={3}>
                        <HStack spacing={2}>
                          <Icon as={FaFire} color="orange.300" />
                          <Text color="white" fontWeight="700">
                            Your streak
                          </Text>
                        </HStack>
                        <Text color="orange.200" fontSize="2xl" fontWeight="800">
                          {user?.stats?.dailyChallengeStreak || 0}
                        </Text>
                      </HStack>
                      <Text color="gray.400" fontSize="sm">
                        Complete today&apos;s run to keep it alive.
                      </Text>
                    </Box>

                    <Box bg="whiteAlpha.060" border="1px solid" borderColor="whiteAlpha.140" borderRadius="2xl" p={5}>
                      <Text color="white" fontWeight="700" mb={3}>
                        Today&apos;s reward
                      </Text>
                      <Text color="teal.200" fontSize="lg" fontWeight="700">
                        {challenge.rewardLabel}
                      </Text>
                      <Text color="gray.400" fontSize="sm" mt={2}>
                        {progress?.metTarget
                          ? "Target already cleared."
                          : "Hit both target WPM and accuracy to clear the mark."}
                      </Text>
                    </Box>

                    {!user && (
                      <Box bg="whiteAlpha.060" border="1px solid" borderColor="whiteAlpha.140" borderRadius="2xl" p={5}>
                        <Text color="white" fontWeight="700" mb={2}>
                          Want the streak to count?
                        </Text>
                        <Text color="gray.400" fontSize="sm">
                          Sign in before or after your run to save the result and
                          appear on the leaderboard.
                        </Text>
                      </Box>
                    )}
                  </VStack>
                </Flex>
              </Box>

              <Flex direction={{ base: "column", xl: "row" }} gap={6} align="start">
                <Box flex="1" minW={0}>
                  <TypePage
                    fixedText={challenge.text}
                    fixedDuration={challenge.duration}
                    initialGenre={challenge.genre}
                    onGameEnd={handleComplete}
                    disableScoreSave={false}
                  />
                  {submitting && (
                    <Flex justify="center" mt={4}>
                      <HStack color="gray.400">
                        <Spinner size="sm" color="teal.300" />
                        <Text fontSize="sm">Saving challenge result...</Text>
                      </HStack>
                    </Flex>
                  )}
                </Box>

                <VStack w={{ base: "full", xl: "360px" }} spacing={5} align="stretch">
                  <Box bg="gray.800" border="1px solid" borderColor="whiteAlpha.120" borderRadius="2xl" p={5}>
                    <Text color="white" fontWeight="700" mb={4}>
                      Your best today
                    </Text>
                    {progress ? (
                      <VStack align="stretch" spacing={3}>
                        <HStack justify="space-between">
                          <Text color="gray.400">Attempts</Text>
                          <Text color="white" fontWeight="700">{progress.attempts}</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text color="gray.400">Best WPM</Text>
                          <Text color="teal.200" fontWeight="700">{progress.bestWpm}</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text color="gray.400">Best accuracy</Text>
                          <Text color="green.200" fontWeight="700">{progress.bestAccuracy}%</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text color="gray.400">Target cleared</Text>
                          <Text color={progress.metTarget ? "green.300" : "gray.500"} fontWeight="700">
                            {progress.metTarget ? "Yes" : "Not yet"}
                          </Text>
                        </HStack>
                      </VStack>
                    ) : (
                      <Text color="gray.400" fontSize="sm">
                        No saved run yet for today.
                      </Text>
                    )}
                  </Box>

                  <Box bg="gray.800" border="1px solid" borderColor="whiteAlpha.120" borderRadius="2xl" p={5}>
                    <HStack justify="space-between" mb={4}>
                      <HStack spacing={2}>
                        <Icon as={FaTrophy} color="yellow.300" />
                        <Text color="white" fontWeight="700">
                          Day leaderboard
                        </Text>
                      </HStack>
                      <Text color="gray.500" fontSize="sm">
                        {stats?.participantCount || 0} runs
                      </Text>
                    </HStack>
                    <VStack spacing={3} align="stretch">
                      {leaderboard.length > 0 ? (
                        leaderboard.map((entry) => (
                          <Flex
                            key={`${entry.rank}-${entry.username}`}
                            justify="space-between"
                            align="center"
                            bg="whiteAlpha.040"
                            borderRadius="xl"
                            px={3}
                            py={3}
                          >
                            <HStack spacing={3} minW={0}>
                              <Text color="gray.500" fontWeight="700" minW="24px">
                                #{entry.rank}
                              </Text>
                              {entry.profilePicture ? (
                                <Image
                                  src={entry.profilePicture}
                                  alt={entry.username}
                                  boxSize="34px"
                                  borderRadius="full"
                                />
                              ) : (
                                <Box boxSize="34px" borderRadius="full" bg="teal.700" />
                              )}
                              <VStack align="start" spacing={0} minW={0}>
                                <Text color="white" fontWeight="600" noOfLines={1}>
                                  {entry.username}
                                </Text>
                                <Text color="gray.500" fontSize="xs">
                                  {entry.bestAccuracy}% accuracy
                                </Text>
                              </VStack>
                            </HStack>
                            <VStack align="end" spacing={0}>
                              <Text color="teal.200" fontWeight="700">
                                {entry.bestWpm} WPM
                              </Text>
                              <Text color="gray.500" fontSize="xs">
                                score {entry.bestScore}
                              </Text>
                            </VStack>
                          </Flex>
                        ))
                      ) : (
                        <Text color="gray.400" fontSize="sm">
                          No completed runs yet. Be the first on the board.
                        </Text>
                      )}
                    </VStack>
                  </Box>
                </VStack>
              </Flex>

              <Box
                bg="gray.800"
                border="1px solid"
                borderColor="whiteAlpha.120"
                borderRadius="2xl"
                p={{ base: 5, md: 6 }}
              >
                <VStack align="stretch" spacing={5}>
                  <VStack align="start" spacing={1}>
                    <Text
                      color="teal.200"
                      textTransform="uppercase"
                      letterSpacing="0.14em"
                      fontSize="xs"
                      fontWeight="700"
                    >
                      Challenge Schedule
                    </Text>
                    <Heading size="md" color="white">
                      Recent and upcoming daily runs
                    </Heading>
                    <Text color="gray.400" fontSize="sm">
                      The daily system is now a visible rotation instead of a
                      one-off page. Check what just happened and what is coming next.
                    </Text>
                  </VStack>

                  <Flex wrap="wrap" gap={4}>
                    {schedule.map((entry) => {
                      const isToday = entry.dateKey === challenge.dateKey;
                      const isPast = entry.dateKey < challenge.dateKey;

                      return (
                        <Box
                          key={entry.dateKey}
                          flex={{ base: "1 1 100%", md: "1 1 calc(33.333% - 11px)" }}
                          minW={{ base: "0", md: "220px" }}
                          bg={isToday ? "teal.900" : "whiteAlpha.040"}
                          border="1px solid"
                          borderColor={isToday ? "teal.500" : "whiteAlpha.120"}
                          borderRadius="2xl"
                          p={4}
                        >
                          <VStack align="start" spacing={3}>
                            <HStack justify="space-between" w="full">
                              <Badge
                                colorScheme={
                                  isToday ? "teal" : isPast ? "gray" : "blue"
                                }
                                borderRadius="full"
                                px={2.5}
                                py={1}
                              >
                                {isToday ? "Today" : isPast ? "Recent" : "Upcoming"}
                              </Badge>
                              <Text color="gray.500" fontSize="xs">
                                {entry.dateKey}
                              </Text>
                            </HStack>
                            <VStack align="start" spacing={1}>
                              <Text color="white" fontWeight="700" noOfLines={2}>
                                {entry.title}
                              </Text>
                              <Text color="gray.400" fontSize="sm" noOfLines={3}>
                                {entry.description}
                              </Text>
                            </VStack>
                            <HStack spacing={2} flexWrap="wrap">
                              <Badge colorScheme="purple">{entry.genre}</Badge>
                              <Badge colorScheme="blue">{entry.duration}s</Badge>
                              <Badge colorScheme="green">{entry.targetWpm} WPM</Badge>
                            </HStack>
                          </VStack>
                        </Box>
                      );
                    })}
                  </Flex>
                </VStack>
              </Box>
            </>
          )}
        </VStack>
      </Box>
    </>
  );
}
