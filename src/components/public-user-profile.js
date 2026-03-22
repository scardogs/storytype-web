import React, { useEffect, useState } from "react";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  HStack,
  SimpleGrid,
  Spinner,
  Stat,
  StatLabel,
  StatNumber,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import Navbar from "./navbar";
import { useAuth } from "../context/AuthContext";

function formatDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleDateString();
}

function SectionCard({ title, subtitle, children }) {
  return (
    <Box
      bg="gray.800"
      border="1px solid"
      borderColor="whiteAlpha.140"
      borderRadius="2xl"
      p={{ base: 4, md: 6 }}
      boxShadow="xl"
    >
      <VStack align="start" spacing={1} mb={4}>
        <Heading size="md" color="white">
          {title}
        </Heading>
        {subtitle ? (
          <Text color="gray.400" fontSize="sm">
            {subtitle}
          </Text>
        ) : null}
      </VStack>
      {children}
    </Box>
  );
}

export default function PublicUserProfile() {
  const router = useRouter();
  const { user } = useAuth();
  const username =
    typeof router.query.username === "string" ? router.query.username : "";
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [friendActionLoading, setFriendActionLoading] = useState(false);

  useEffect(() => {
    if (!username) return;

    let active = true;

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/users/public/${encodeURIComponent(username)}`
        );
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to load profile");
        }

        if (active) {
          setProfile(data.profile);
          setError("");
        }
      } catch (fetchError) {
        if (active) {
          setError(fetchError.message || "Failed to load profile");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchProfile();

    return () => {
      active = false;
    };
  }, [username]);

  const handleDm = () => {
    if (!user) {
      router.push("/profile?tab=login");
      return;
    }

    router.push(`/chat?dm=${encodeURIComponent(profile.userId)}`);
  };

  const handleSendFriendRequest = async () => {
    if (!user) {
      router.push("/profile?tab=login");
      return;
    }

    try {
      setFriendActionLoading(true);
      const response = await fetch("/api/friends/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ recipientId: profile.userId }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to send friend request");
      }

      setProfile((prev) =>
        prev
          ? {
              ...prev,
              friendshipStatus: data.status || prev.friendshipStatus,
            }
          : prev
      );
    } catch (requestError) {
      setError(requestError.message || "Failed to send friend request");
    } finally {
      setFriendActionLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <Box minH="100vh" bg="gray.900" px={{ base: 4, md: 8 }} py={{ base: 6, md: 10 }}>
        {loading ? (
          <Flex minH="60vh" justify="center" align="center">
            <Spinner color="teal.300" size="xl" />
          </Flex>
        ) : error ? (
          <Flex minH="60vh" justify="center" align="center">
            <VStack spacing={3}>
              <Heading size="md" color="white">
                Public profile not available
              </Heading>
              <Text color="gray.400">{error}</Text>
            </VStack>
          </Flex>
        ) : (
          <VStack maxW="1200px" mx="auto" spacing={6} align="stretch">
            <Box
              bg="linear-gradient(135deg, rgba(45,212,191,0.14), rgba(17,24,39,0.96))"
              border="1px solid"
              borderColor="teal.900"
              borderRadius="3xl"
              p={{ base: 6, md: 8 }}
              boxShadow="2xl"
            >
              <Flex
                direction={{ base: "column", md: "row" }}
                justify="space-between"
                align={{ base: "start", md: "center" }}
                gap={5}
              >
                <HStack spacing={4} align="center">
                  <Avatar
                    size={{ base: "xl", md: "2xl" }}
                    src={profile.profilePicture}
                    name={profile.username}
                    bg="teal.500"
                  />
                  <VStack align="start" spacing={1}>
                    <Heading size={{ base: "lg", md: "xl" }} color="white">
                      {profile.username}
                    </Heading>
                    <Text color="gray.300">
                      Joined {formatDate(profile.joinedAt)}
                    </Text>
                    <HStack spacing={2} flexWrap="wrap">
                      {profile.isPro ? (
                        <Badge colorScheme="yellow" borderRadius="full" px={3} py={1}>
                          StoryType Pro
                        </Badge>
                      ) : null}
                      {profile.stats.favoriteGenre ? (
                        <Badge colorScheme="teal" borderRadius="full" px={3} py={1}>
                          {profile.stats.favoriteGenre} specialist
                        </Badge>
                      ) : null}
                      <Badge colorScheme="purple" borderRadius="full" px={3} py={1}>
                        {profile.stats.tournamentWins} tournament wins
                      </Badge>
                      <Badge colorScheme="orange" borderRadius="full" px={3} py={1}>
                        {profile.stats.masteredLessonsCount} mastered lessons
                      </Badge>
                    </HStack>
                    {profile.friendshipStatus !== "self" ? (
                      <HStack spacing={3} pt={2} flexWrap="wrap">
                        <Button colorScheme="teal" onClick={handleDm}>
                          DM User
                        </Button>
                        <Button
                          colorScheme="purple"
                          variant={
                            profile.friendshipStatus === "none" ? "solid" : "outline"
                          }
                          onClick={handleSendFriendRequest}
                          isDisabled={profile.friendshipStatus !== "none"}
                          isLoading={friendActionLoading}
                        >
                          {profile.friendshipStatus === "friends"
                            ? "Friends"
                            : profile.friendshipStatus === "outgoing_pending"
                            ? "Request Sent"
                            : profile.friendshipStatus === "incoming_pending"
                            ? "Respond in chat later"
                            : "Add Friend"}
                        </Button>
                      </HStack>
                    ) : null}
                  </VStack>
                </HStack>

                <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3} w={{ base: "full", md: "auto" }}>
                  <Stat bg="blackAlpha.280" borderRadius="xl" px={4} py={3}>
                    <StatLabel color="gray.400">Best WPM</StatLabel>
                    <StatNumber color="teal.200">{profile.stats.bestWPM}</StatNumber>
                  </Stat>
                  <Stat bg="blackAlpha.280" borderRadius="xl" px={4} py={3}>
                    <StatLabel color="gray.400">Best Accuracy</StatLabel>
                    <StatNumber color="green.200">{profile.stats.bestAccuracy}%</StatNumber>
                  </Stat>
                  <Stat bg="blackAlpha.280" borderRadius="xl" px={4} py={3}>
                    <StatLabel color="gray.400">Current Streak</StatLabel>
                    <StatNumber color="orange.200">
                      {profile.stats.dailyChallengeStreak}
                    </StatNumber>
                  </Stat>
                  <Stat bg="blackAlpha.280" borderRadius="xl" px={4} py={3}>
                    <StatLabel color="gray.400">Games</StatLabel>
                    <StatNumber color="white">{profile.stats.totalGamesPlayed}</StatNumber>
                  </Stat>
                </SimpleGrid>
              </Flex>
            </Box>

            <Grid templateColumns={{ base: "1fr", xl: "1.1fr 0.9fr" }} gap={6}>
              <VStack spacing={6} align="stretch">
                <SectionCard
                  title="Typing Snapshot"
                  subtitle="Core performance and volume at a glance"
                >
                  <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                    <Stat>
                      <StatLabel color="gray.400">Average WPM</StatLabel>
                      <StatNumber color="blue.200">{profile.stats.averageWPM}</StatNumber>
                    </Stat>
                    <Stat>
                      <StatLabel color="gray.400">Words Typed</StatLabel>
                      <StatNumber color="white">{profile.stats.totalWordsTyped}</StatNumber>
                    </Stat>
                    <Stat>
                      <StatLabel color="gray.400">Longest Streak</StatLabel>
                      <StatNumber color="orange.200">
                        {profile.stats.longestDailyChallengeStreak}
                      </StatNumber>
                    </Stat>
                    <Stat>
                      <StatLabel color="gray.400">Daily Clears</StatLabel>
                      <StatNumber color="teal.200">
                        {profile.stats.totalDailyChallengesCompleted}
                      </StatNumber>
                    </Stat>
                  </SimpleGrid>
                </SectionCard>

                <SectionCard
                  title="Tournament History"
                  subtitle="Recent competitive results"
                >
                  <VStack align="stretch" spacing={3}>
                    {profile.tournamentHistory.length === 0 ? (
                      <Text color="gray.400">No tournament results yet.</Text>
                    ) : (
                      profile.tournamentHistory.map((entry) => (
                        <Flex
                          key={entry.id}
                          justify="space-between"
                          align={{ base: "start", md: "center" }}
                          direction={{ base: "column", md: "row" }}
                          gap={2}
                          bg="whiteAlpha.040"
                          border="1px solid"
                          borderColor="whiteAlpha.100"
                          borderRadius="xl"
                          px={4}
                          py={3}
                        >
                          <VStack align="start" spacing={0}>
                            <Text color="white" fontWeight="600">
                              {entry.tournamentName}
                            </Text>
                            <Text color="gray.400" fontSize="sm">
                              {entry.theme} • {formatDate(entry.startedAt)}
                            </Text>
                          </VStack>
                          <HStack spacing={3} flexWrap="wrap">
                            <Badge colorScheme={entry.result === "win" ? "green" : "gray"}>
                              {entry.result}
                            </Badge>
                            <Badge colorScheme="purple">Rank #{entry.rank}</Badge>
                            <Badge colorScheme="teal">{entry.wpm} WPM</Badge>
                            <Badge colorScheme="blue">{entry.accuracy}%</Badge>
                          </HStack>
                        </Flex>
                      ))
                    )}
                  </VStack>
                </SectionCard>

                <SectionCard title="Recent Runs" subtitle="Latest typing sessions">
                  <VStack align="stretch" spacing={3}>
                    {profile.recentRecords.length === 0 ? (
                      <Text color="gray.400">No typing records yet.</Text>
                    ) : (
                      profile.recentRecords.map((record) => (
                        <Flex
                          key={record.id}
                          justify="space-between"
                          align={{ base: "start", md: "center" }}
                          direction={{ base: "column", md: "row" }}
                          gap={2}
                          bg="whiteAlpha.040"
                          border="1px solid"
                          borderColor="whiteAlpha.100"
                          borderRadius="xl"
                          px={4}
                          py={3}
                        >
                          <VStack align="start" spacing={0}>
                            <Text color="white" fontWeight="600">
                              {record.genre}
                            </Text>
                            <Text color="gray.400" fontSize="sm">
                              {record.testDuration}s • {formatDate(record.timestamp)}
                            </Text>
                          </VStack>
                          <HStack spacing={3} flexWrap="wrap">
                            <Badge colorScheme="teal">{record.wpm} WPM</Badge>
                            <Badge colorScheme="green">{record.accuracy}%</Badge>
                            <Badge colorScheme="blue">{record.wordsTyped} words</Badge>
                          </HStack>
                        </Flex>
                      ))
                    )}
                  </VStack>
                </SectionCard>
              </VStack>

              <VStack spacing={6} align="stretch">
                <SectionCard
                  title="Mastered Lessons"
                  subtitle="Training lessons completed at mastery level"
                >
                  <VStack align="stretch" spacing={3}>
                    {profile.masteredLessons.length === 0 ? (
                      <Text color="gray.400">No mastered lessons yet.</Text>
                    ) : (
                      profile.masteredLessons.map((lesson) => (
                        <Box
                          key={lesson.id}
                          bg="whiteAlpha.040"
                          border="1px solid"
                          borderColor="whiteAlpha.100"
                          borderRadius="xl"
                          px={4}
                          py={3}
                        >
                          <Text color="white" fontWeight="600">
                            {lesson.title}
                          </Text>
                          <Text color="gray.400" fontSize="sm">
                            {lesson.moduleTitle}
                            {lesson.category ? ` • ${lesson.category}` : ""}
                          </Text>
                          <HStack spacing={2} mt={2}>
                            <Badge colorScheme="orange">{lesson.difficulty}</Badge>
                            <Badge colorScheme="green">
                              {formatDate(lesson.completedAt)}
                            </Badge>
                          </HStack>
                        </Box>
                      ))
                    )}
                  </VStack>
                </SectionCard>

                <SectionCard
                  title="Achievements"
                  subtitle="Milestones unlocked across typing, training, and competition"
                >
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                    {profile.achievements.length === 0 ? (
                      <Text color="gray.400">No achievements unlocked yet.</Text>
                    ) : (
                      profile.achievements.map((achievement) => (
                        <Box
                          key={achievement.id}
                          bg="whiteAlpha.040"
                          border="1px solid"
                          borderColor="whiteAlpha.100"
                          borderRadius="xl"
                          px={4}
                          py={3}
                        >
                          <Badge colorScheme={achievement.color} mb={2}>
                            Unlocked
                          </Badge>
                          <Text color="white" fontWeight="700">
                            {achievement.title}
                          </Text>
                          <Text color="gray.400" fontSize="sm">
                            {achievement.description}
                          </Text>
                        </Box>
                      ))
                    )}
                  </SimpleGrid>
                </SectionCard>
              </VStack>
            </Grid>
          </VStack>
        )}
      </Box>
    </>
  );
}
