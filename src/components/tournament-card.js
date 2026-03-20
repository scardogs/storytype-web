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
  Avatar,
  AvatarGroup,
  Divider,
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
} from "react-icons/fa";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";

export default function TournamentCard({ tournament, onJoin, onLeave }) {
  const router = useRouter();
  const { user } = useAuth();

  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const hoverBg = useColorModeValue("gray.50", "gray.750");

  const getEntityId = (value) => {
    if (!value) return null;
    if (typeof value === "string") return value;
    return value._id || null;
  };

  const isParticipant =
    user &&
    tournament.participants.some(
      (p) => getEntityId(p.userId) === user.id
    );

  const canJoin = tournament.canRegister && !isParticipant && user;
  const canLeave = isParticipant && tournament.status === "upcoming";
  const canPlay = isParticipant && tournament.status === "active";

  const getStatusColor = (status) => {
    switch (status) {
      case "upcoming":
        return "blue";
      case "active":
        return "green";
      case "completed":
        return "gray";
      case "cancelled":
        return "red";
      default:
        return "gray";
    }
  };

  const getThemeIcon = (theme) => {
    switch (theme) {
      case "speed":
        return FaPlay;
      case "accuracy":
        return FaMedal;
      case "endurance":
        return FaClock;
      case "mixed":
        return FaTrophy;
      default:
        return FaTrophy;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "weekly":
        return "purple";
      case "bracket":
        return "orange";
      case "team":
        return "teal";
      case "special":
        return "pink";
      default:
        return "gray";
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTimeUntilStart = () => {
    const now = new Date();
    const start = new Date(tournament.startDate);
    const diff = start - now;

    if (diff <= 0) return "Started";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const participantProgress =
    (tournament.participants.length / tournament.rules.maxParticipants) * 100;

  return (
    <Box
      bg={cardBg}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="xl"
      p={6}
      _hover={{ bg: hoverBg }}
      transition="all 0.2s"
      cursor="pointer"
      onClick={() => router.push(`/tournaments/${tournament._id}`)}
    >
      <VStack spacing={4} align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="start">
          <VStack align="start" spacing={2} flex="1">
            <Heading size="md" color="teal.500">
              {tournament.name}
            </Heading>
            <Text fontSize="sm" color="gray.500" noOfLines={2}>
              {tournament.description}
            </Text>
          </VStack>
          <VStack spacing={2}>
            <Badge colorScheme={getStatusColor(tournament.status)} size="lg">
              {tournament.status.toUpperCase()}
            </Badge>
            <Badge
              colorScheme={getTypeColor(tournament.type)}
              variant="outline"
            >
              {tournament.type}
            </Badge>
          </VStack>
        </Flex>

        {/* Theme and Rules */}
        <HStack spacing={4} wrap="wrap">
          <HStack spacing={1}>
            <Icon as={getThemeIcon(tournament.theme)} color="teal.400" />
            <Text fontSize="sm" fontWeight="medium">
              {tournament.theme.charAt(0).toUpperCase() +
                tournament.theme.slice(1)}
            </Text>
          </HStack>
          <HStack spacing={2}>
            {!tournament.rules.allowBackspace && (
              <Badge colorScheme="red" size="sm">
                No Backspace
              </Badge>
            )}
            {tournament.rules.numbersOnly && (
              <Badge colorScheme="blue" size="sm">
                Numbers Only
              </Badge>
            )}
            {tournament.rules.specialCharacters && (
              <Badge colorScheme="purple" size="sm">
                Special Chars
              </Badge>
            )}
          </HStack>
        </HStack>

        {/* Participants */}
        <VStack spacing={2} align="stretch">
          <HStack justify="space-between">
            <HStack spacing={2}>
              <Icon as={FaUsers} color="gray.500" />
              <Text fontSize="sm" color="gray.500">
                Participants
              </Text>
            </HStack>
            <Text fontSize="sm" fontWeight="medium">
              {tournament.participants.length}/
              {tournament.rules.maxParticipants}
            </Text>
          </HStack>
          <Progress
            value={participantProgress}
            colorScheme="teal"
            size="sm"
            borderRadius="full"
          />
          {tournament.participants.length > 0 && (
            <AvatarGroup size="sm" max={5}>
              {tournament.participants.slice(0, 5).map((participant, index) => (
                <Avatar
                  key={index}
                  src={participant.userId?.profilePicture}
                  name={participant.username || participant.userId?.username || "Unknown user"}
                  bg="teal.400"
                />
              ))}
            </AvatarGroup>
          )}
        </VStack>

        <Divider />

        {/* Time Info */}
        <HStack justify="space-between" fontSize="sm">
          <HStack spacing={1}>
            <Icon as={FaCalendarAlt} color="gray.500" />
            <Text color="gray.500">Starts:</Text>
            <Text fontWeight="medium">{formatDate(tournament.startDate)}</Text>
          </HStack>
          <HStack spacing={1}>
            <Icon as={FaClock} color="gray.500" />
            <Text color="gray.500">Time:</Text>
            <Text fontWeight="medium">{getTimeUntilStart()}</Text>
          </HStack>
        </HStack>

        {/* Winners (if completed) */}
        {tournament.status === "completed" && tournament.winners && (
          <VStack spacing={2} align="stretch">
            <Text fontSize="sm" fontWeight="medium" color="gray.600">
              Winners:
            </Text>
            <HStack spacing={4}>
              {tournament.winners.first && (
                <HStack spacing={1}>
                  <Icon as={FaCrown} color="yellow.400" />
                  <Text fontSize="xs">{tournament.winners.first.username}</Text>
                </HStack>
              )}
              {tournament.winners.second && (
                <HStack spacing={1}>
                  <Icon as={FaMedal} color="gray.400" />
                  <Text fontSize="xs">
                    {tournament.winners.second.username}
                  </Text>
                </HStack>
              )}
              {tournament.winners.third && (
                <HStack spacing={1}>
                  <Icon as={FaMedal} color="orange.400" />
                  <Text fontSize="xs">{tournament.winners.third.username}</Text>
                </HStack>
              )}
            </HStack>
          </VStack>
        )}

        {/* Action Buttons */}
        <HStack spacing={2}>
          {canJoin && (
            <Button
              colorScheme="teal"
              size="sm"
              leftIcon={<FaUserPlus />}
              onClick={(e) => {
                e.stopPropagation();
                onJoin(tournament._id);
              }}
              flex="1"
            >
              Join Tournament
            </Button>
          )}
          {canLeave && (
            <Button
              colorScheme="red"
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onLeave(tournament._id);
              }}
              flex="1"
            >
              Leave Tournament
            </Button>
          )}
          {canPlay && (
            <Button
              colorScheme="green"
              size="sm"
              leftIcon={<FaPlay />}
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/tournaments/${tournament._id}/play`);
              }}
              flex="1"
            >
              Play Now
            </Button>
          )}
          {tournament.status === "completed" && (
            <Button colorScheme="gray" variant="outline" size="sm" flex="1">
              View Results
            </Button>
          )}
        </HStack>
      </VStack>
    </Box>
  );
}
