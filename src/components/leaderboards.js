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
        px={{ base: 2, md: 4 }}
        py={{ base: 6, md: 10 }}
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
          <VStack spacing={{ base: 6, md: 8 }}>
            {/* Header */}
            <ScaleFade initialScale={0.9} in={true}>
              <VStack spacing={{ base: 2, md: 4 }}>
                <HStack spacing={{ base: 2, md: 3 }}>
                  <Icon
                    as={FaTrophy}
                    color="yellow.400"
                    boxSize={{ base: 8, md: 12 }}
                  />
                  <Heading
                    size={{ base: "xl", md: "2xl" }}
                    bgGradient="linear(to-r, teal.400, purple.500)"
                    bgClip="text"
                  >
                    Leaderboards
                  </Heading>
                </HStack>
                <Text
                  color="gray.500"
                  fontSize={{ base: "sm", md: "lg" }}
                  textAlign="center"
                >
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
                  borderRadius={{ base: "xl", md: "2xl" }}
                  p={{ base: 4, md: 6 }}
                  boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                  border="2px solid"
                  borderColor="teal.400"
                >
                  <SimpleGrid
                    columns={{ base: 2, md: 4 }}
                    spacing={{ base: 4, md: 6 }}
                  >
                    <Stat>
                      <StatLabel fontSize={{ base: "xs", md: "sm" }}>
                        Your Rank
                      </StatLabel>
                      <StatNumber
                        fontSize={{ base: "2xl", md: "3xl" }}
                        color="teal.400"
                      >
                        #{userRank.rank}
                      </StatNumber>
                      <StatHelpText fontSize={{ base: "xs", md: "sm" }}>
                        Top {userRank.percentile}%
                      </StatHelpText>
                    </Stat>
                    <Stat>
                      <StatLabel fontSize={{ base: "xs", md: "sm" }}>
                        {getMetricLabel()}
                      </StatLabel>
                      <StatNumber
                        fontSize={{ base: "2xl", md: "3xl" }}
                        color="purple.400"
                      >
                        {userRank.value}
                        {metric.includes("WPM")
                          ? " WPM"
                          : metric.includes("Accuracy")
                          ? "%"
                          : ""}
                      </StatNumber>
                      <StatHelpText fontSize={{ base: "xs", md: "sm" }}>
                        Current score
                      </StatHelpText>
                    </Stat>
                    <Stat>
                      <StatLabel fontSize={{ base: "xs", md: "sm" }}>
                        Total Players
                      </StatLabel>
                      <StatNumber fontSize={{ base: "2xl", md: "3xl" }}>
                        {userRank.totalUsers}
                      </StatNumber>
                      <StatHelpText fontSize={{ base: "xs", md: "sm" }}>
                        Active users
                      </StatHelpText>
                    </Stat>
                    <Stat>
                      <StatLabel fontSize={{ base: "xs", md: "sm" }}>
                        Keep Practicing!
                      </StatLabel>
                      <Button
                        size={{ base: "xs", md: "sm" }}
                        colorScheme="teal"
                        leftIcon={
                          <FaChartLine
                            display={{ base: "none", md: "inline" }}
                          />
                        }
                        onClick={() => (window.location.href = "/type")}
                        fontSize={{ base: "xs", md: "sm" }}
                      >
                        Improve Rank
                      </Button>
                    </Stat>
                  </SimpleGrid>
                </Box>
              </ScaleFade>
            )}

            {/* Metric Selector */}
            <HStack
              spacing={{ base: 2, md: 4 }}
              w="full"
              justify="center"
              flexWrap="wrap"
              px={{ base: 2, md: 0 }}
            >
              <Button
                colorScheme={metric === "bestWPM" ? "teal" : "gray"}
                variant={metric === "bestWPM" ? "solid" : "outline"}
                onClick={() => setMetric("bestWPM")}
                leftIcon={<FaTrophy display={{ base: "none", md: "inline" }} />}
                size={{ base: "xs", sm: "sm", md: "md" }}
                fontSize={{ base: "xs", md: "sm" }}
              >
                Best WPM
              </Button>
              <Button
                colorScheme={metric === "averageWPM" ? "teal" : "gray"}
                variant={metric === "averageWPM" ? "solid" : "outline"}
                onClick={() => setMetric("averageWPM")}
                size={{ base: "xs", sm: "sm", md: "md" }}
                fontSize={{ base: "xs", md: "sm" }}
              >
                Avg WPM
              </Button>
              <Button
                colorScheme={metric === "bestAccuracy" ? "teal" : "gray"}
                variant={metric === "bestAccuracy" ? "solid" : "outline"}
                onClick={() => setMetric("bestAccuracy")}
                size={{ base: "xs", sm: "sm", md: "md" }}
                fontSize={{ base: "xs", md: "sm" }}
              >
                Accuracy
              </Button>
              <Button
                colorScheme={metric === "totalGames" ? "teal" : "gray"}
                variant={metric === "totalGames" ? "solid" : "outline"}
                onClick={() => setMetric("totalGames")}
                size={{ base: "xs", sm: "sm", md: "md" }}
                fontSize={{ base: "xs", md: "sm" }}
                display={{ base: "none", sm: "inline-flex" }}
              >
                Most Games
              </Button>
              <Button
                colorScheme={metric === "totalWords" ? "teal" : "gray"}
                variant={metric === "totalWords" ? "solid" : "outline"}
                onClick={() => setMetric("totalWords")}
                size={{ base: "xs", sm: "sm", md: "md" }}
                fontSize={{ base: "xs", md: "sm" }}
                display={{ base: "none", sm: "inline-flex" }}
              >
                Words Typed
              </Button>
            </HStack>

            {/* Leaderboard Table */}
            <Box
              w="full"
              bg={cardBg}
              backdropFilter="blur(20px)"
              borderRadius={{ base: "xl", md: "2xl" }}
              boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
              border="1px solid"
              borderColor={borderColor}
              overflow="hidden"
            >
              {loading ? (
                <Flex
                  justify="center"
                  align="center"
                  minH={{ base: "300px", md: "400px" }}
                >
                  <Spinner size="xl" color="teal.400" thickness="4px" />
                </Flex>
              ) : leaderboard.length === 0 ? (
                <Flex
                  justify="center"
                  align="center"
                  minH={{ base: "300px", md: "400px" }}
                  direction="column"
                  gap={4}
                  px={4}
                >
                  <Icon
                    as={FaTrophy}
                    boxSize={{ base: 12, md: 16 }}
                    color="gray.400"
                  />
                  <Text
                    color="gray.500"
                    fontSize={{ base: "md", md: "lg" }}
                    textAlign="center"
                  >
                    No players yet. Be the first!
                  </Text>
                  <Button
                    colorScheme="teal"
                    size={{ base: "sm", md: "md" }}
                    onClick={() => (window.location.href = "/type")}
                  >
                    Start Typing
                  </Button>
                </Flex>
              ) : (
                <Box overflowX="auto">
                  <Table variant="simple" size={{ base: "sm", md: "md" }}>
                    <Thead bg={tableHeaderBg}>
                      <Tr>
                        <Th fontSize={{ base: "xs", md: "sm" }}>Rank</Th>
                        <Th fontSize={{ base: "xs", md: "sm" }}>Player</Th>
                        <Th isNumeric fontSize={{ base: "xs", md: "sm" }}>
                          {getMetricLabel()}
                        </Th>
                        <Th
                          isNumeric
                          fontSize={{ base: "xs", md: "sm" }}
                          display={{ base: "none", md: "table-cell" }}
                        >
                          Best WPM
                        </Th>
                        <Th
                          isNumeric
                          fontSize={{ base: "xs", md: "sm" }}
                          display={{ base: "none", sm: "table-cell" }}
                        >
                          Accuracy
                        </Th>
                        <Th
                          isNumeric
                          fontSize={{ base: "xs", md: "sm" }}
                          display={{ base: "none", lg: "table-cell" }}
                        >
                          Games
                        </Th>
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
                          <Td py={{ base: 2, md: 4 }}>
                            <HStack spacing={{ base: 1, md: 2 }}>
                              {getRankIcon(player.rank)}
                              {getRankBadge(player.rank)}
                            </HStack>
                          </Td>
                          <Td py={{ base: 2, md: 4 }}>
                            <HStack spacing={{ base: 2, md: 3 }}>
                              <Avatar
                                size={{ base: "xs", md: "sm" }}
                                src={player.profilePicture}
                                name={player.username}
                                bg="teal.400"
                              />
                              <VStack align="start" spacing={0}>
                                <Text
                                  fontWeight="bold"
                                  fontSize={{ base: "xs", md: "sm" }}
                                >
                                  {player.username}
                                  {user && player.userId === user.id && (
                                    <Badge
                                      ml={2}
                                      colorScheme="yellow"
                                      fontSize={{ base: "2xs", md: "xs" }}
                                    >
                                      You
                                    </Badge>
                                  )}
                                </Text>
                                <Text
                                  fontSize={{ base: "2xs", md: "xs" }}
                                  color="gray.500"
                                  display={{ base: "none", sm: "block" }}
                                >
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
                            fontSize={{ base: "sm", md: "lg" }}
                            py={{ base: 2, md: 4 }}
                          >
                            {getMetricValue(player.stats)}
                          </Td>
                          <Td
                            isNumeric
                            py={{ base: 2, md: 4 }}
                            fontSize={{ base: "xs", md: "sm" }}
                            display={{ base: "none", md: "table-cell" }}
                          >
                            {player.stats.bestWPM} WPM
                          </Td>
                          <Td
                            isNumeric
                            py={{ base: 2, md: 4 }}
                            display={{ base: "none", sm: "table-cell" }}
                          >
                            <Badge
                              colorScheme={
                                player.stats.bestAccuracy >= 95
                                  ? "green"
                                  : player.stats.bestAccuracy >= 80
                                  ? "yellow"
                                  : "red"
                              }
                              fontSize={{ base: "2xs", md: "xs" }}
                            >
                              {player.stats.bestAccuracy}%
                            </Badge>
                          </Td>
                          <Td
                            isNumeric
                            py={{ base: 2, md: 4 }}
                            fontSize={{ base: "xs", md: "sm" }}
                            display={{ base: "none", lg: "table-cell" }}
                          >
                            {player.stats.totalGamesPlayed}
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              )}
            </Box>

            {/* Footer */}
            <Text
              color="gray.500"
              fontSize={{ base: "xs", md: "sm" }}
              textAlign="center"
              px={{ base: 4, md: 0 }}
            >
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
