import React, { useState, useEffect, useCallback } from "react";
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
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from "@chakra-ui/react";
import {
  FaTrophy,
  FaPlay,
  FaClock,
  FaUsers,
  FaMedal,
  FaCrown,
} from "react-icons/fa";
import { useRouter } from "next/router";
import { useAuth } from "../../../context/AuthContext";
import Navbar from "../../../components/navbar";
import TypePage from "../../../components/type-page";

export default function TournamentPlayPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();

  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [gameResults, setGameResults] = useState(null);

  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const pageBg = useColorModeValue("gray.50", "gray.900");

  useEffect(() => {
    if (id) {
      fetchTournament();
    }
  }, [id]);

  useEffect(() => {
    if (!user) {
      router.push("/profile");
    }
  }, [user, router]);

  const fetchTournament = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/tournaments/${id}`);
      const data = await response.json();

      if (data.success) {
        setTournament(data.tournament);
      }
    } catch (error) {
      console.error("Error fetching tournament:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const handleGameStart = () => {
    setGameStarted(true);
  };

  const handleGameEnd = (results) => {
    setGameEnded(true);
    setGameResults(results);
    submitTournamentScore(results);
  };

  const submitTournamentScore = async (results) => {
    try {
      const response = await fetch(`/api/tournaments/${id}/play`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          wpm: results.wpm,
          accuracy: results.accuracy,
          wordsTyped: results.wordsTyped,
          totalErrors: results.totalErrors,
          totalCharsTyped: results.totalCharsTyped,
          duration: results.duration,
          genre: results.genre || tournament.theme,
        }),
      });

      const data = await response.json();
      if (data.success) {
        // Refresh tournament data
        fetchTournament();
      }
    } catch (error) {
      console.error("Error submitting tournament score:", error);
    }
  };

  const getTimeUntilStart = () => {
    if (!tournament) return "";
    const now = new Date();
    const start = new Date(tournament.startDate);
    const diff = start - now;

    if (diff <= 0) return "Tournament Started";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getTimeUntilEnd = () => {
    if (!tournament) return "";
    const now = new Date();
    const end = new Date(tournament.endDate);
    const diff = end - now;

    if (diff <= 0) return "Tournament Ended";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

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

  if (!tournament) {
    return (
      <>
        <Navbar />
        <Alert status="error">
          <AlertIcon />
          Tournament not found
        </Alert>
      </>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  const isParticipant = tournament.participants.some(
    (p) => p.userId._id === user.id || p.userId === user.id
  );

  if (!isParticipant) {
    return (
      <>
        <Navbar />
        <Alert status="warning">
          <AlertIcon />
          You are not registered for this tournament
        </Alert>
      </>
    );
  }

  const canPlay = tournament.status === "active";
  const timeUntilStart = getTimeUntilStart();
  const timeUntilEnd = getTimeUntilEnd();

  return (
    <>
      <Navbar />
      <Box bg={pageBg} minH="100vh" p={6}>
        <VStack spacing={6} maxW="1200px" mx="auto">
          {/* Tournament Header */}
          <Box
            bg={cardBg}
            p={6}
            borderRadius="xl"
            w="full"
            boxShadow="lg"
            border="1px solid"
            borderColor={borderColor}
          >
            <VStack spacing={4}>
              <HStack spacing={3}>
                <Icon as={FaTrophy} color="teal.400" boxSize={6} />
                <Heading size="lg" color="teal.500">
                  {tournament.name}
                </Heading>
                <Badge colorScheme="green" size="lg">
                  {tournament.status.toUpperCase()}
                </Badge>
              </HStack>

              <Text color="gray.600" textAlign="center">
                {tournament.description}
              </Text>

              <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} w="full">
                <Stat>
                  <StatLabel>Theme</StatLabel>
                  <StatNumber color="purple.400">{tournament.theme}</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel>Time Limit</StatLabel>
                  <StatNumber color="orange.400">
                    {tournament.rules.timeLimit}s
                  </StatNumber>
                </Stat>
                <Stat>
                  <StatLabel>Participants</StatLabel>
                  <StatNumber color="teal.400">
                    {tournament.participants.length}
                  </StatNumber>
                </Stat>
                <Stat>
                  <StatLabel>Your Rank</StatLabel>
                  <StatNumber color="green.400">
                    #
                    {tournament.participants.findIndex(
                      (p) => p.userId._id === user.id || p.userId === user.id
                    ) + 1 || "N/A"}
                  </StatNumber>
                </Stat>
              </SimpleGrid>

              {/* Rules */}
              <HStack spacing={2} wrap="wrap" justify="center">
                {!tournament.rules.allowBackspace && (
                  <Badge colorScheme="red">No Backspace</Badge>
                )}
                {tournament.rules.numbersOnly && (
                  <Badge colorScheme="blue">Numbers Only</Badge>
                )}
                {tournament.rules.specialCharacters && (
                  <Badge colorScheme="purple">Special Characters</Badge>
                )}
              </HStack>

              {/* Time Status */}
              {tournament.status === "upcoming" && (
                <Alert status="info">
                  <AlertIcon />
                  Tournament starts in: {timeUntilStart}
                </Alert>
              )}

              {tournament.status === "active" && (
                <Alert status="success">
                  <AlertIcon />
                  Tournament ends in: {timeUntilEnd}
                </Alert>
              )}
            </VStack>
          </Box>

          {/* Game Results */}
          {gameEnded && gameResults && (
            <Box
              bg={cardBg}
              p={6}
              borderRadius="xl"
              w="full"
              boxShadow="lg"
              border="1px solid"
              borderColor={borderColor}
            >
              <VStack spacing={4}>
                <Heading size="md" color="green.500">
                  🎉 Game Completed!
                </Heading>

                <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} w="full">
                  <Stat>
                    <StatLabel>WPM</StatLabel>
                    <StatNumber color="teal.400">{gameResults.wpm}</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>Accuracy</StatLabel>
                    <StatNumber color="green.400">
                      {gameResults.accuracy}%
                    </StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>Words</StatLabel>
                    <StatNumber color="purple.400">
                      {gameResults.wordsTyped}
                    </StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>Errors</StatLabel>
                    <StatNumber color="red.400">
                      {gameResults.totalErrors}
                    </StatNumber>
                  </Stat>
                </SimpleGrid>

                <Text color="gray.600" textAlign="center">
                  Your score has been submitted to the tournament!
                </Text>

                <HStack spacing={4}>
                  <Button
                    colorScheme="teal"
                    onClick={() => {
                      setGameStarted(false);
                      setGameEnded(false);
                      setGameResults(null);
                    }}
                  >
                    Play Again
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/tournaments/${id}`)}
                  >
                    View Tournament
                  </Button>
                </HStack>
              </VStack>
            </Box>
          )}

          {/* Game Interface */}
          {!gameEnded && (
            <Box w="full">
              {!gameStarted ? (
                <Box
                  bg={cardBg}
                  p={8}
                  borderRadius="xl"
                  textAlign="center"
                  boxShadow="lg"
                  border="1px solid"
                  borderColor={borderColor}
                >
                  <VStack spacing={6}>
                    <Icon as={FaPlay} boxSize={16} color="teal.400" />
                    <Heading size="lg">Ready to Play?</Heading>
                    <Text color="gray.600" maxW="500px">
                      This is a {tournament.theme} tournament. Your score will
                      be automatically submitted and compared with other
                      participants.
                    </Text>

                    {canPlay ? (
                      <Button
                        colorScheme="teal"
                        size="lg"
                        leftIcon={<FaPlay />}
                        onClick={handleGameStart}
                      >
                        Start Tournament Game
                      </Button>
                    ) : (
                      <Alert status="warning">
                        <AlertIcon />
                        Tournament is not currently active
                      </Alert>
                    )}
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
                  {/* Tournament-specific typing game */}
                  <TypePage
                    tournamentMode={true}
                    tournamentRules={tournament.rules}
                    onGameEnd={handleGameEnd}
                    tournamentTheme={tournament.theme}
                  />
                </Box>
              )}
            </Box>
          )}

          {/* Tournament Leaderboard Preview */}
          {tournament.participants.length > 0 && (
            <Box
              bg={cardBg}
              p={6}
              borderRadius="xl"
              w="full"
              boxShadow="lg"
              border="1px solid"
              borderColor={borderColor}
            >
              <VStack spacing={4}>
                <Heading size="md">Current Leaderboard</Heading>
                <Box w="full" overflowX="auto">
                  <Box as="table" w="full" fontSize="sm">
                    <Box as="thead">
                      <Box
                        as="tr"
                        borderBottom="1px solid"
                        borderColor={borderColor}
                      >
                        <Box as="th" textAlign="left" p={2}>
                          Rank
                        </Box>
                        <Box as="th" textAlign="left" p={2}>
                          Player
                        </Box>
                        <Box as="th" textAlign="right" p={2}>
                          Score
                        </Box>
                        <Box as="th" textAlign="right" p={2}>
                          WPM
                        </Box>
                        <Box as="th" textAlign="right" p={2}>
                          Accuracy
                        </Box>
                      </Box>
                    </Box>
                    <Box as="tbody">
                      {tournament.participants
                        .sort((a, b) => b.score - a.score)
                        .slice(0, 5)
                        .map((participant, index) => (
                          <Box
                            as="tr"
                            key={participant.userId._id || participant.userId}
                            borderBottom="1px solid"
                            borderColor={borderColor}
                            bg={
                              participant.userId._id === user.id ||
                              participant.userId === user.id
                                ? "teal.50"
                                : undefined
                            }
                          >
                            <Box as="td" p={2}>
                              <HStack spacing={1}>
                                {index === 0 && (
                                  <Icon as={FaCrown} color="yellow.400" />
                                )}
                                {index === 1 && (
                                  <Icon as={FaMedal} color="gray.400" />
                                )}
                                {index === 2 && (
                                  <Icon as={FaMedal} color="orange.400" />
                                )}
                                <Text fontWeight="bold">#{index + 1}</Text>
                              </HStack>
                            </Box>
                            <Box as="td" p={2}>
                              <Text fontWeight="medium">
                                {participant.username}
                              </Text>
                            </Box>
                            <Box as="td" p={2} textAlign="right">
                              <Text fontWeight="bold" color="teal.400">
                                {participant.score.toFixed(1)}
                              </Text>
                            </Box>
                            <Box as="td" p={2} textAlign="right">
                              {participant.wpm}
                            </Box>
                            <Box as="td" p={2} textAlign="right">
                              {participant.accuracy}%
                            </Box>
                          </Box>
                        ))}
                    </Box>
                  </Box>
                </Box>
              </VStack>
            </Box>
          )}
        </VStack>
      </Box>
    </>
  );
}
