import React, { useState, useEffect } from "react";
import Navbar from "./navbar";
import { useAuth } from "../context/AuthContext";
import {
  Box,
  VStack,
  Heading,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Avatar,
  Text,
  Badge,
  useColorModeValue,
  HStack,
  Spinner,
  Icon,
  Flex,
  Container,
  Button,
  ScaleFade,
  Tooltip,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from "@chakra-ui/react";
import {
  FaTrophy,
  FaMedal,
  FaCrown,
  FaAward,
  FaChartLine,
} from "react-icons/fa";

export default function Leaderboards() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [metric, setMetric] = useState("bestWPM");

  const bg = useColorModeValue("gray.100", "gray.900");
  const cardBg = useColorModeValue(
    "rgba(255, 255, 255, 0.9)",
    "rgba(26, 32, 44, 0.9)"
  );
  const tableHeaderBg = useColorModeValue("teal.50", "teal.900");
  const hoverBg = useColorModeValue("teal.50", "teal.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const userRowBg = useColorModeValue("yellow.50", "yellow.900");

  useEffect(() => {
    fetchLeaderboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metric]);

  useEffect(() => {
    if (user) {
      fetchUserRank();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, metric]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/leaderboard/top-users?metric=${metric}&limit=50`
      );
      const data = await response.json();

      if (data.success) {
        setLeaderboard(data.leaderboard);
      }
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRank = async () => {
    try {
      const response = await fetch(
        `/api/leaderboard/user-rank?metric=${metric}`
      );
      const data = await response.json();

      if (data.success) {
        setUserRank(data);
      }
    } catch (error) {
      console.error("Error fetching user rank:", error);
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Icon as={FaCrown} color="yellow.400" boxSize={6} />;
      case 2:
        return <Icon as={FaMedal} color="gray.400" boxSize={5} />;
      case 3:
        return <Icon as={FaMedal} color="orange.600" boxSize={5} />;
      default:
        return null;
    }
  };

  const getRankBadge = (rank) => {
    if (rank === 1)
      return (
        <Badge colorScheme="yellow" fontSize="lg">
          👑 1st
        </Badge>
      );
    if (rank === 2)
      return (
        <Badge colorScheme="gray" fontSize="lg">
          🥈 2nd
        </Badge>
      );
    if (rank === 3)
      return (
        <Badge colorScheme="orange" fontSize="lg">
          🥉 3rd
        </Badge>
      );
    return <Badge colorScheme="teal">{rank}</Badge>;
  };

  const getMetricValue = (stats) => {
    switch (metric) {
      case "bestWPM":
        return `${stats.bestWPM} WPM`;
      case "averageWPM":
        return `${stats.averageWPM} WPM`;
      case "bestAccuracy":
        return `${stats.bestAccuracy}%`;
      case "totalGames":
        return `${stats.totalGamesPlayed} games`;
      case "totalWords":
        return `${stats.totalWordsTyped.toLocaleString()} words`;
      default:
        return stats.bestWPM;
    }
  };

  const getMetricLabel = () => {
    switch (metric) {
      case "bestWPM":
        return "Best WPM";
      case "averageWPM":
        return "Avg WPM";
      case "bestAccuracy":
        return "Accuracy";
      case "totalGames":
        return "Games";
      case "totalWords":
        return "Words Typed";
      default:
        return "Score";
    }
  };

  return (
    <>
      <Navbar />
      <Box
        minH="100vh"
        bgGradient={useColorModeValue(
          "linear(to-br, teal.50, purple.100, pink.50)",
          "linear(to-br, gray.900, teal.900, purple.900)"
        )}
        px={4}
        py={10}
        position="relative"
        overflow="hidden"
      >
        {/* Animated Background */}
        <Box
          position="absolute"
          top="-20%"
          right="-10%"
          w="500px"
          h="500px"
          bgGradient="radial(teal.400, transparent)"
          opacity={0.2}
          borderRadius="full"
          filter="blur(80px)"
          animation="float 8s ease-in-out infinite"
        />

        <Container maxW="1200px">
          <VStack spacing={8}>
            {/* Header */}
            <ScaleFade initialScale={0.9} in={true}>
              <VStack spacing={4}>
                <HStack spacing={3}>
                  <Icon as={FaTrophy} color="yellow.400" boxSize={12} />
                  <Heading
                    size="2xl"
                    bgGradient="linear(to-r, teal.400, purple.500)"
                    bgClip="text"
                  >
                    Leaderboards
                  </Heading>
                </HStack>
                <Text color="gray.500" fontSize="lg">
                  Compete with the best typists around the world
                </Text>
              </VStack>
            </ScaleFade>

            {/* User's Rank Card (if logged in) */}
            {user && userRank && (
              <ScaleFade initialScale={0.9} in={true}>
                <Box
                  w="full"
                  bg={cardBg}
                  backdropFilter="blur(20px)"
                  borderRadius="2xl"
                  p={6}
                  boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                  border="2px solid"
                  borderColor="teal.400"
                >
                  <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6}>
                    <Stat>
                      <StatLabel>Your Rank</StatLabel>
                      <StatNumber fontSize="3xl" color="teal.400">
                        #{userRank.rank}
                      </StatNumber>
                      <StatHelpText>Top {userRank.percentile}%</StatHelpText>
                    </Stat>
                    <Stat>
                      <StatLabel>{getMetricLabel()}</StatLabel>
                      <StatNumber fontSize="3xl" color="purple.400">
                        {userRank.value}
                        {metric.includes("WPM")
                          ? " WPM"
                          : metric.includes("Accuracy")
                          ? "%"
                          : ""}
                      </StatNumber>
                      <StatHelpText>Current score</StatHelpText>
                    </Stat>
                    <Stat>
                      <StatLabel>Total Players</StatLabel>
                      <StatNumber fontSize="3xl">
                        {userRank.totalUsers}
                      </StatNumber>
                      <StatHelpText>Active users</StatHelpText>
                    </Stat>
                    <Stat>
                      <StatLabel>Keep Practicing!</StatLabel>
                      <Button
                        size="sm"
                        colorScheme="teal"
                        leftIcon={<FaChartLine />}
                        onClick={() => (window.location.href = "/type")}
                      >
                        Improve Rank
                      </Button>
                    </Stat>
                  </SimpleGrid>
                </Box>
              </ScaleFade>
            )}

            {/* Metric Selector */}
            <HStack spacing={4} w="full" justify="center" flexWrap="wrap">
              <Button
                colorScheme={metric === "bestWPM" ? "teal" : "gray"}
                variant={metric === "bestWPM" ? "solid" : "outline"}
                onClick={() => setMetric("bestWPM")}
                leftIcon={<FaTrophy />}
              >
                Best WPM
              </Button>
              <Button
                colorScheme={metric === "averageWPM" ? "teal" : "gray"}
                variant={metric === "averageWPM" ? "solid" : "outline"}
                onClick={() => setMetric("averageWPM")}
              >
                Average WPM
              </Button>
              <Button
                colorScheme={metric === "bestAccuracy" ? "teal" : "gray"}
                variant={metric === "bestAccuracy" ? "solid" : "outline"}
                onClick={() => setMetric("bestAccuracy")}
              >
                Accuracy
              </Button>
              <Button
                colorScheme={metric === "totalGames" ? "teal" : "gray"}
                variant={metric === "totalGames" ? "solid" : "outline"}
                onClick={() => setMetric("totalGames")}
              >
                Most Games
              </Button>
              <Button
                colorScheme={metric === "totalWords" ? "teal" : "gray"}
                variant={metric === "totalWords" ? "solid" : "outline"}
                onClick={() => setMetric("totalWords")}
              >
                Words Typed
              </Button>
            </HStack>

            {/* Leaderboard Table */}
            <Box
              w="full"
              bg={cardBg}
              backdropFilter="blur(20px)"
              borderRadius="2xl"
              boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
              border="1px solid"
              borderColor={borderColor}
              overflow="hidden"
            >
              {loading ? (
                <Flex justify="center" align="center" minH="400px">
                  <Spinner size="xl" color="teal.400" thickness="4px" />
                </Flex>
              ) : leaderboard.length === 0 ? (
                <Flex
                  justify="center"
                  align="center"
                  minH="400px"
                  direction="column"
                  gap={4}
                >
                  <Icon as={FaTrophy} boxSize={16} color="gray.400" />
                  <Text color="gray.500" fontSize="lg">
                    No players yet. Be the first!
                  </Text>
                  <Button
                    colorScheme="teal"
                    onClick={() => (window.location.href = "/type")}
                  >
                    Start Typing
                  </Button>
                </Flex>
              ) : (
                <Box overflowX="auto">
                  <Table variant="simple" size="md">
                    <Thead bg={tableHeaderBg}>
                      <Tr>
                        <Th>Rank</Th>
                        <Th>Player</Th>
                        <Th isNumeric>{getMetricLabel()}</Th>
                        <Th isNumeric>Best WPM</Th>
                        <Th isNumeric>Accuracy</Th>
                        <Th isNumeric>Games</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {leaderboard.map((player) => (
                        <Tr
                          key={player.userId}
                          _hover={{ bg: hoverBg }}
                          transition="all 0.2s"
                          bg={
                            user && player.userId === user.id
                              ? userRowBg
                              : undefined
                          }
                          borderLeft={
                            user && player.userId === user.id
                              ? "4px solid"
                              : undefined
                          }
                          borderLeftColor="yellow.400"
                        >
                          <Td>
                            <HStack spacing={2}>
                              {getRankIcon(player.rank)}
                              {getRankBadge(player.rank)}
                            </HStack>
                          </Td>
                          <Td>
                            <HStack spacing={3}>
                              <Avatar
                                size="sm"
                                src={player.profilePicture}
                                name={player.username}
                                bg="teal.400"
                              />
                              <VStack align="start" spacing={0}>
                                <Text fontWeight="bold">
                                  {player.username}
                                  {user && player.userId === user.id && (
                                    <Badge ml={2} colorScheme="yellow">
                                      You
                                    </Badge>
                                  )}
                                </Text>
                                <Text fontSize="xs" color="gray.500">
                                  Member since{" "}
                                  {new Date(
                                    player.memberSince
                                  ).toLocaleDateString()}
                                </Text>
                              </VStack>
                            </HStack>
                          </Td>
                          <Td
                            isNumeric
                            fontWeight="bold"
                            color="teal.400"
                            fontSize="lg"
                          >
                            {getMetricValue(player.stats)}
                          </Td>
                          <Td isNumeric>{player.stats.bestWPM} WPM</Td>
                          <Td isNumeric>
                            <Badge
                              colorScheme={
                                player.stats.bestAccuracy >= 95
                                  ? "green"
                                  : player.stats.bestAccuracy >= 80
                                  ? "yellow"
                                  : "red"
                              }
                            >
                              {player.stats.bestAccuracy}%
                            </Badge>
                          </Td>
                          <Td isNumeric>{player.stats.totalGamesPlayed}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              )}
            </Box>

            {/* Footer */}
            <Text color="gray.500" fontSize="sm" textAlign="center">
              Rankings update in real-time • Keep typing to climb the ladder!
            </Text>
          </VStack>
        </Container>
      </Box>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-30px);
          }
        }
      `}</style>
    </>
  );
}
