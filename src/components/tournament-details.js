import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Badge,
  Button,
  Icon,
  Divider,
  SimpleGrid,
  Avatar,
  AvatarGroup,
  Progress,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useColorModeValue,
  Flex,
  Spinner,
  Alert,
  AlertIcon,
  Tooltip,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from "@chakra-ui/react";
import {
  FaTrophy,
  FaUsers,
  FaCalendarAlt,
  FaClock,
  FaMedal,
  FaCrown,
  FaPlay,
  FaUserPlus,
  FaEdit,
  FaTrash,
  FaArrowLeft,
  FaCog,
  FaGamepad,
} from "react-icons/fa";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";

export default function TournamentDetails({ tournamentId }) {
  const router = useRouter();
  const { user } = useAuth();
  const [tournament, setTournament] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const bg = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  useEffect(() => {
    if (tournamentId) {
      fetchTournamentDetails();
    }
  }, [tournamentId]);

  const fetchTournamentDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/tournaments/${tournamentId}`);
      const data = await response.json();

      if (data.success) {
        setTournament(data.tournament);
        setRecords(data.records || []);
      }
    } catch (error) {
      console.error("Error fetching tournament details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinTournament = async () => {
    setJoining(true);
    try {
      const response = await fetch(`/api/tournaments/${tournamentId}/join`, {
        method: "POST",
      });
      const data = await response.json();

      if (data.success) {
        setTournament(data.tournament);
      } else {
        console.error("Failed to join tournament:", data.message);
      }
    } catch (error) {
      console.error("Error joining tournament:", error);
    } finally {
      setJoining(false);
    }
  };

  const handleLeaveTournament = async () => {
    setLeaving(true);
    try {
      const response = await fetch(`/api/tournaments/${tournamentId}/join`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (data.success) {
        setTournament(data.tournament);
      } else {
        console.error("Failed to leave tournament:", data.message);
      }
    } catch (error) {
      console.error("Error leaving tournament:", error);
    } finally {
      setLeaving(false);
    }
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="400px">
        <Spinner size="xl" color="teal.400" />
      </Flex>
    );
  }

  if (!tournament) {
    return (
      <Alert status="error">
        <AlertIcon />
        Tournament not found
      </Alert>
    );
  }

  const isParticipant =
    user &&
    tournament.participants.some(
      (p) => p.userId._id === user.id || p.userId === user.id
    );
  const isCreator = user && tournament.createdBy._id === user.id;

  const canJoin = tournament.canRegister && !isParticipant && user;
  const canLeave = isParticipant && tournament.status === "upcoming";
  const canPlay = isParticipant && tournament.status === "active";
  const canEdit = isCreator && tournament.status === "upcoming";

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const participantProgress =
    (tournament.participants.length / tournament.rules.maxParticipants) * 100;

  return (
    <Box bg={bg} minH="100vh" p={6}>
      <VStack spacing={6} maxW="1200px" mx="auto">
        {/* Back Button */}
        <Button
          leftIcon={<FaArrowLeft />}
          variant="ghost"
          onClick={() => router.push("/tournaments")}
          alignSelf="flex-start"
        >
          Back to Tournaments
        </Button>

        {/* Tournament Header */}
        <Box
          bg={cardBg}
          p={8}
          borderRadius="xl"
          w="full"
          boxShadow="lg"
          border="1px solid"
          borderColor={borderColor}
        >
          <VStack spacing={6}>
            {/* Title and Status */}
            <Flex
              justify="space-between"
              align="start"
              w="full"
              wrap="wrap"
              gap={4}
            >
              <VStack align="start" spacing={2}>
                <Heading size="xl" color="teal.500">
                  {tournament.name}
                </Heading>
                <Text fontSize="lg" color="gray.600" maxW="600px">
                  {tournament.description}
                </Text>
              </VStack>
              <VStack spacing={2}>
                <Badge colorScheme="blue" size="lg" px={3} py={1}>
                  {tournament.status.toUpperCase()}
                </Badge>
                <Badge colorScheme="purple" variant="outline" px={3} py={1}>
                  {tournament.type}
                </Badge>
                {canEdit && (
                  <HStack spacing={2}>
                    <Button
                      size="sm"
                      leftIcon={<FaEdit />}
                      onClick={() =>
                        router.push(`/tournaments/${tournamentId}/edit`)
                      }
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      colorScheme="red"
                      variant="outline"
                      leftIcon={<FaTrash />}
                    >
                      Delete
                    </Button>
                  </HStack>
                )}
              </VStack>
            </Flex>

            {/* Tournament Info */}
            <SimpleGrid
              columns={{ base: 1, md: 2, lg: 4 }}
              spacing={6}
              w="full"
            >
              <Stat>
                <StatLabel>Theme</StatLabel>
                <StatNumber color="teal.400">{tournament.theme}</StatNumber>
                <StatHelpText>Competition focus</StatHelpText>
              </Stat>
              <Stat>
                <StatLabel>Duration</StatLabel>
                <StatNumber color="purple.400">
                  {Math.round(
                    (new Date(tournament.endDate) -
                      new Date(tournament.startDate)) /
                      (1000 * 60 * 60)
                  )}
                  h
                </StatNumber>
                <StatHelpText>Tournament length</StatHelpText>
              </Stat>
              <Stat>
                <StatLabel>Time Limit</StatLabel>
                <StatNumber color="orange.400">
                  {tournament.rules.timeLimit}s
                </StatNumber>
                <StatHelpText>Per test</StatHelpText>
              </Stat>
              <Stat>
                <StatLabel>Max Participants</StatLabel>
                <StatNumber color="green.400">
                  {tournament.rules.maxParticipants}
                </StatNumber>
                <StatHelpText>Registration limit</StatHelpText>
              </Stat>
            </SimpleGrid>

            {/* Rules */}
            <Box w="full">
              <Heading size="md" mb={3}>
                Tournament Rules
              </Heading>
              <HStack spacing={4} wrap="wrap">
                {!tournament.rules.allowBackspace && (
                  <Badge colorScheme="red" size="lg">
                    No Backspace
                  </Badge>
                )}
                {tournament.rules.numbersOnly && (
                  <Badge colorScheme="blue" size="lg">
                    Numbers Only
                  </Badge>
                )}
                {tournament.rules.specialCharacters && (
                  <Badge colorScheme="purple" size="lg">
                    Special Characters
                  </Badge>
                )}
                {tournament.rules.allowBackspace &&
                  !tournament.rules.numbersOnly &&
                  !tournament.rules.specialCharacters && (
                    <Badge colorScheme="green" size="lg">
                      Standard Rules
                    </Badge>
                  )}
              </HStack>
            </Box>

            {/* Schedule */}
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} w="full">
              <VStack spacing={2}>
                <HStack spacing={2}>
                  <Icon as={FaCalendarAlt} color="teal.400" />
                  <Text fontWeight="medium">Start Date</Text>
                </HStack>
                <Text fontSize="sm" color="gray.600">
                  {formatDate(tournament.startDate)}
                </Text>
              </VStack>
              <VStack spacing={2}>
                <HStack spacing={2}>
                  <Icon as={FaClock} color="orange.400" />
                  <Text fontWeight="medium">Registration Deadline</Text>
                </HStack>
                <Text fontSize="sm" color="gray.600">
                  {formatDate(tournament.registrationDeadline)}
                </Text>
              </VStack>
              <VStack spacing={2}>
                <HStack spacing={2}>
                  <Icon as={FaTrophy} color="yellow.400" />
                  <Text fontWeight="medium">End Date</Text>
                </HStack>
                <Text fontSize="sm" color="gray.600">
                  {formatDate(tournament.endDate)}
                </Text>
              </VStack>
            </SimpleGrid>

            {/* Participants */}
            <Box w="full">
              <HStack justify="space-between" mb={3}>
                <HStack spacing={2}>
                  <Icon as={FaUsers} color="teal.400" />
                  <Text fontWeight="medium">Participants</Text>
                  <Badge colorScheme="teal">
                    {tournament.participants.length}/
                    {tournament.rules.maxParticipants}
                  </Badge>
                </HStack>
              </HStack>
              <Progress
                value={participantProgress}
                colorScheme="teal"
                size="lg"
                borderRadius="full"
                mb={3}
              />
              {tournament.participants.length > 0 && (
                <AvatarGroup size="md" max={10}>
                  {tournament.participants.map((participant, index) => (
                    <Tooltip key={index} label={participant.username}>
                      <Avatar
                        src={participant.userId?.profilePicture}
                        name={participant.username}
                        bg="teal.400"
                      />
                    </Tooltip>
                  ))}
                </AvatarGroup>
              )}
            </Box>

            {/* Action Buttons */}
            <HStack spacing={4} w="full" justify="center">
              {canJoin && (
                <Button
                  colorScheme="teal"
                  size="lg"
                  leftIcon={<FaUserPlus />}
                  onClick={handleJoinTournament}
                  isLoading={joining}
                  loadingText="Joining..."
                >
                  Join Tournament
                </Button>
              )}
              {canLeave && (
                <Button
                  colorScheme="red"
                  variant="outline"
                  size="lg"
                  onClick={handleLeaveTournament}
                  isLoading={leaving}
                  loadingText="Leaving..."
                >
                  Leave Tournament
                </Button>
              )}
              {canPlay && (
                <Button
                  colorScheme="green"
                  size="lg"
                  leftIcon={<FaPlay />}
                  onClick={() =>
                    router.push(`/tournaments/${tournamentId}/play`)
                  }
                >
                  Play Now
                </Button>
              )}
            </HStack>
          </VStack>
        </Box>

        {/* Winners (if completed) */}
        {tournament.status === "completed" && tournament.winners && (
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
              <Heading size="lg" color="yellow.400">
                🏆 Tournament Winners
              </Heading>
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} w="full">
                {tournament.winners.first && (
                  <VStack spacing={2} p={4} bg="yellow.50" borderRadius="xl">
                    <Icon as={FaCrown} color="yellow.400" boxSize={8} />
                    <Text fontWeight="bold" fontSize="lg">
                      1st Place
                    </Text>
                    <Text color="yellow.600">
                      {tournament.winners.first.username}
                    </Text>
                  </VStack>
                )}
                {tournament.winners.second && (
                  <VStack spacing={2} p={4} bg="gray.50" borderRadius="xl">
                    <Icon as={FaMedal} color="gray.400" boxSize={8} />
                    <Text fontWeight="bold" fontSize="lg">
                      2nd Place
                    </Text>
                    <Text color="gray.600">
                      {tournament.winners.second.username}
                    </Text>
                  </VStack>
                )}
                {tournament.winners.third && (
                  <VStack spacing={2} p={4} bg="orange.50" borderRadius="xl">
                    <Icon as={FaMedal} color="orange.400" boxSize={8} />
                    <Text fontWeight="bold" fontSize="lg">
                      3rd Place
                    </Text>
                    <Text color="orange.600">
                      {tournament.winners.third.username}
                    </Text>
                  </VStack>
                )}
              </SimpleGrid>
            </VStack>
          </Box>
        )}

        {/* Leaderboard (if tournament has records) */}
        {records.length > 0 && (
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
              <Heading size="lg">Current Leaderboard</Heading>
              <Box overflowX="auto" w="full">
                <Table variant="simple" size="md">
                  <Thead>
                    <Tr>
                      <Th>Rank</Th>
                      <Th>Player</Th>
                      <Th isNumeric>Score</Th>
                      <Th isNumeric>WPM</Th>
                      <Th isNumeric>Accuracy</Th>
                      <Th isNumeric>Words</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {records.slice(0, 10).map((record, index) => (
                      <Tr key={record._id}>
                        <Td>
                          <HStack spacing={2}>
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
                        </Td>
                        <Td>
                          <HStack spacing={2}>
                            <Avatar
                              size="sm"
                              src={record.userId?.profilePicture}
                              name={record.username}
                              bg="teal.400"
                            />
                            <Text>{record.username}</Text>
                          </HStack>
                        </Td>
                        <Td isNumeric fontWeight="bold" color="teal.400">
                          {record.score.toFixed(1)}
                        </Td>
                        <Td isNumeric>{record.wpm}</Td>
                        <Td isNumeric>{record.accuracy}%</Td>
                        <Td isNumeric>{record.wordsTyped}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </VStack>
          </Box>
        )}

        {/* Prizes */}
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
            <Heading size="lg">🏆 Prizes</Heading>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} w="full">
              <VStack spacing={2} p={4} bg="yellow.50" borderRadius="xl">
                <Text fontWeight="bold" fontSize="lg" color="yellow.600">
                  1st Place
                </Text>
                <Text>{tournament.prizes.firstPlace}</Text>
              </VStack>
              <VStack spacing={2} p={4} bg="gray.50" borderRadius="xl">
                <Text fontWeight="bold" fontSize="lg" color="gray.600">
                  2nd Place
                </Text>
                <Text>{tournament.prizes.secondPlace}</Text>
              </VStack>
              <VStack spacing={2} p={4} bg="orange.50" borderRadius="xl">
                <Text fontWeight="bold" fontSize="lg" color="orange.600">
                  3rd Place
                </Text>
                <Text>{tournament.prizes.thirdPlace}</Text>
              </VStack>
            </SimpleGrid>
            {tournament.prizes.badges &&
              tournament.prizes.badges.length > 0 && (
                <VStack spacing={2}>
                  <Text fontWeight="medium">Special Badges:</Text>
                  <HStack spacing={2} wrap="wrap">
                    {tournament.prizes.badges.map((badge, index) => (
                      <Badge key={index} colorScheme="purple" size="lg">
                        {badge}
                      </Badge>
                    ))}
                  </HStack>
                </VStack>
              )}
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
}
