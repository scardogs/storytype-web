import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Avatar,
  Button,
  Icon,
  useColorModeValue,
  Flex,
  Spinner,
  Divider,
  Tooltip,
  Progress,
} from "@chakra-ui/react";
import {
  FaTrophy,
  FaMedal,
  FaCrown,
  FaUser,
  FaPlay,
  FaClock,
  FaCheck,
  FaTimes,
} from "react-icons/fa";
import { useRouter } from "next/router";

export default function TournamentBracket({ tournament, records = [] }) {
  const router = useRouter();
  const [rounds, setRounds] = useState([]);
  const [loading, setLoading] = useState(true);

  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const winnerBg = useColorModeValue("yellow.50", "yellow.900");
  const loserBg = useColorModeValue("red.50", "red.900");

  const getEntityId = (value) => {
    if (!value) return null;
    if (typeof value === "string") return value;
    return value._id || null;
  };

  useEffect(() => {
    if (tournament && tournament.brackets) {
      generateBracketDisplay();
    }
    setLoading(false);
  }, [tournament, records]);

  const generateBracketDisplay = () => {
    if (!tournament.brackets || tournament.brackets.length === 0) {
      // Generate bracket from participants if no brackets exist
      generateBracketFromParticipants();
      return;
    }

    const bracketRounds = tournament.brackets.map((bracket, roundIndex) => ({
      round: bracket.round,
      matches: bracket.matches.map((match, matchIndex) => {
        const player1 = findParticipant(match.player1);
        const player2 = findParticipant(match.player2);
        const player1Record = findPlayerRecord(match.player1, bracket.round);
        const player2Record = findPlayerRecord(match.player2, bracket.round);

        return {
          id: `${bracket.round}-${matchIndex}`,
          player1: {
            ...player1,
            score: player1Record?.score || match.player1Score,
            wpm: player1Record?.wpm || 0,
            accuracy: player1Record?.accuracy || 0,
          },
          player2: {
            ...player2,
            score: player2Record?.score || match.player2Score,
            wpm: player2Record?.wpm || 0,
            accuracy: player2Record?.accuracy || 0,
          },
          winner: match.winner,
          status: match.status,
          completedAt: match.completedAt,
        };
      }),
    }));

    setRounds(bracketRounds);
  };

  const generateBracketFromParticipants = () => {
    if (!tournament.participants || tournament.participants.length === 0) {
      setRounds([]);
      return;
    }

    // Create first round matches from participants
    const participants = [...tournament.participants];
    const firstRoundMatches = [];

    // Pair participants for first round
    for (let i = 0; i < participants.length; i += 2) {
      const player1 = participants[i];
      const player2 = participants[i + 1];

      if (player1) {
        firstRoundMatches.push({
          id: `1-${Math.floor(i / 2)}`,
          player1: {
            userId: getEntityId(player1.userId),
            username: player1.username || player1.userId?.username || "Unknown user",
            profilePicture: player1.userId?.profilePicture,
            score: player1.score || 0,
            wpm: player1.wpm || 0,
            accuracy: player1.accuracy || 0,
          },
          player2: player2
            ? {
                userId: getEntityId(player2.userId),
                username: player2.username || player2.userId?.username || "Unknown user",
                profilePicture: player2.userId?.profilePicture,
                score: player2.score || 0,
                wpm: player2.wpm || 0,
                accuracy: player2.accuracy || 0,
              }
            : null,
          winner: null,
          status: "pending",
          completedAt: null,
        });
      }
    }

    setRounds([
      {
        round: 1,
        matches: firstRoundMatches,
      },
    ]);
  };

  const findParticipant = (userId) => {
    return tournament.participants.find(
      (p) => getEntityId(p.userId) === getEntityId(userId)
    );
  };

  const findPlayerRecord = (userId, round) => {
    return records.find(
      (r) => getEntityId(r.userId) === getEntityId(userId) && r.round === round
    );
  };

  const getMatchStatus = (match) => {
    if (match.status === "completed") return "completed";
    if (match.player1 && match.player2) return "ready";
    return "waiting";
  };

  const getMatchStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "green";
      case "ready":
        return "blue";
      case "waiting":
        return "gray";
      default:
        return "gray";
    }
  };

  const getWinnerIcon = (playerId, winnerId) => {
    if (!winnerId) return null;
    if (playerId === winnerId) {
      return <Icon as={FaCrown} color="yellow.400" boxSize={4} />;
    }
    return <Icon as={FaTimes} color="red.400" boxSize={4} />;
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="200px">
        <Spinner size="xl" color="teal.400" />
      </Flex>
    );
  }

  if (rounds.length === 0) {
    return (
      <Box
        bg={cardBg}
        p={8}
        borderRadius="xl"
        textAlign="center"
        boxShadow="lg"
        border="1px solid"
        borderColor={borderColor}
      >
        <VStack spacing={4}>
          <Icon as={FaTrophy} boxSize={12} color="gray.400" />
          <Text fontSize="lg" color="gray.500">
            Bracket will be generated when tournament starts
          </Text>
          <Text fontSize="sm" color="gray.400">
            Participants will be matched up automatically
          </Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box
      bg={cardBg}
      p={{ base: 4, md: 6 }}
      borderRadius="xl"
      boxShadow="lg"
      border="1px solid"
      borderColor={borderColor}
    >
      <VStack spacing={6}>
        <HStack spacing={2} flexWrap="wrap" justify="center">
          <Icon as={FaTrophy} color="teal.400" boxSize={6} />
          <Text fontSize="xl" fontWeight="bold">
            Tournament Bracket
          </Text>
        </HStack>

        <Box overflowX="auto" w="full">
          <Flex gap={{ base: 4, md: 8 }} minW={{ base: "max-content", md: "800px" }} align="flex-start">
            {rounds.map((round, roundIndex) => (
              <VStack key={round.round} spacing={4} minW={{ base: "240px", md: "200px" }} align="stretch">
                <Text fontWeight="bold" color="teal.500" fontSize="lg">
                  Round {round.round}
                </Text>

                {round.matches.map((match, matchIndex) => (
                  <Box
                    key={match.id}
                    bg={cardBg}
                    border="2px solid"
                    borderColor={borderColor}
                    borderRadius="lg"
                    p={3}
                    minW={{ base: "240px", md: "180px" }}
                  >
                    <VStack spacing={2}>
                      {/* Match Status */}
                      <Badge
                        colorScheme={getMatchStatusColor(getMatchStatus(match))}
                        size="sm"
                      >
                        {getMatchStatus(match).toUpperCase()}
                      </Badge>

                      {/* Player 1 */}
                      <HStack spacing={2} w="full">
                        <Avatar
                          size="sm"
                          src={match.player1?.profilePicture}
                          name={match.player1?.username}
                          bg="teal.400"
                        />
                        <VStack spacing={0} align="start" flex="1">
                          <Text fontSize="sm" fontWeight="medium" noOfLines={1}>
                            {match.player1?.username || "TBD"}
                          </Text>
                          {match.player1 && (
                            <Text fontSize="xs" color="gray.500">
                              {match.player1.wpm} WPM • {match.player1.accuracy}
                              %
                            </Text>
                          )}
                        </VStack>
                        {getWinnerIcon(match.player1?.userId, match.winner)}
                      </HStack>

                      {/* VS */}
                      <Text fontSize="xs" color="gray.500" fontWeight="bold">
                        VS
                      </Text>

                      {/* Player 2 */}
                      <HStack spacing={2} w="full">
                        <Avatar
                          size="sm"
                          src={match.player2?.profilePicture}
                          name={match.player2?.username}
                          bg="teal.400"
                        />
                        <VStack spacing={0} align="start" flex="1">
                          <Text fontSize="sm" fontWeight="medium" noOfLines={1}>
                            {match.player2?.username || "TBD"}
                          </Text>
                          {match.player2 && (
                            <Text fontSize="xs" color="gray.500">
                              {match.player2.wpm} WPM • {match.player2.accuracy}
                              %
                            </Text>
                          )}
                        </VStack>
                        {getWinnerIcon(match.player2?.userId, match.winner)}
                      </HStack>

                      {/* Scores */}
                      {match.status === "completed" && (
                        <HStack spacing={4} w="full" justify="center">
                          <Text
                            fontSize="lg"
                            fontWeight="bold"
                            color="teal.400"
                          >
                            {match.player1.score}
                          </Text>
                          <Text fontSize="sm" color="gray.500">
                            -
                          </Text>
                          <Text
                            fontSize="lg"
                            fontWeight="bold"
                            color="teal.400"
                          >
                            {match.player2.score}
                          </Text>
                        </HStack>
                      )}

                      {/* Match Actions */}
                      {getMatchStatus(match) === "ready" &&
                        tournament.status === "active" && (
                          <Button
                            size="xs"
                            colorScheme="teal"
                            leftIcon={<FaPlay />}
                            w="full"
                            onClick={() =>
                              router.push(
                                `/tournaments/${tournament._id}/play`
                              )
                            }
                          >
                            Start Match
                          </Button>
                        )}
                    </VStack>
                  </Box>
                ))}
              </VStack>
            ))}
          </Flex>
        </Box>

        {/* Bracket Info */}
        <VStack spacing={2} pt={4}>
          <Divider />
          <Text fontSize="sm" color="gray.500" textAlign="center">
            Bracket automatically updates as matches are completed
          </Text>
          <HStack spacing={6} fontSize="xs" color="gray.400" flexWrap="wrap" justify="center">
            <HStack spacing={1}>
              <Icon as={FaCheck} color="green.400" />
              <Text>Completed</Text>
            </HStack>
            <HStack spacing={1}>
              <Icon as={FaClock} color="blue.400" />
              <Text>Ready to Play</Text>
            </HStack>
            <HStack spacing={1}>
              <Icon as={FaUser} color="gray.400" />
              <Text>Waiting for Opponent</Text>
            </HStack>
          </HStack>
        </VStack>
      </VStack>
    </Box>
  );
}
