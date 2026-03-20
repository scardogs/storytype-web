import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Button,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  Icon,
  Text,
  Spinner,
  SimpleGrid,
  useColorModeValue,
  Flex,
  Badge,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from "@chakra-ui/react";
import { FaSearch, FaFilter, FaTrophy, FaPlus } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import TournamentCard from "./tournament-card";

export default function TournamentList({ initialTournaments = [] }) {
  const { user } = useAuth();
  const [tournaments, setTournaments] = useState(initialTournaments);
  const [loading, setLoading] = useState(initialTournaments.length === 0);
  const [filters, setFilters] = useState({
    status: "all",
    type: "all",
    theme: "all",
    search: "",
  });
  const [activeTab, setActiveTab] = useState(0);
  const [skipInitialFetch, setSkipInitialFetch] = useState(
    initialTournaments.length > 0
  );

  const bg = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");

  useEffect(() => {
    if (skipInitialFetch) {
      setSkipInitialFetch(false);
      return;
    }
    fetchTournaments();
  }, [filters]);

  const fetchTournaments = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.status !== "all")
        queryParams.append("status", filters.status);
      if (filters.type !== "all") queryParams.append("type", filters.type);
      if (filters.theme !== "all") queryParams.append("theme", filters.theme);
      queryParams.append("limit", "20");

      const response = await fetch(`/api/tournaments?${queryParams}`);
      const data = await response.json();

      if (data.success) {
        let filteredTournaments = data.tournaments;

        // Client-side search filter
        if (filters.search) {
          filteredTournaments = filteredTournaments.filter(
            (tournament) =>
              tournament.name
                .toLowerCase()
                .includes(filters.search.toLowerCase()) ||
              tournament.description
                .toLowerCase()
                .includes(filters.search.toLowerCase())
          );
        }

        setTournaments(filteredTournaments);
      }
    } catch (error) {
      console.error("Error fetching tournaments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinTournament = async (tournamentId) => {
    try {
      const response = await fetch(`/api/tournaments/${tournamentId}/join`, {
        method: "POST",
      });
      const data = await response.json();

      if (data.success) {
        // Refresh tournaments list
        fetchTournaments();
      } else {
        console.error("Failed to join tournament:", data.message);
      }
    } catch (error) {
      console.error("Error joining tournament:", error);
    }
  };

  const handleLeaveTournament = async (tournamentId) => {
    try {
      const response = await fetch(`/api/tournaments/${tournamentId}/join`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (data.success) {
        // Refresh tournaments list
        fetchTournaments();
      } else {
        console.error("Failed to leave tournament:", data.message);
      }
    } catch (error) {
      console.error("Error leaving tournament:", error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const getFilteredTournaments = () => {
    const now = new Date();

    switch (activeTab) {
      case 0: // All
        return tournaments;
      case 1: // Upcoming
        return tournaments.filter(
          (t) => t.status === "upcoming" && new Date(t.startDate) > now
        );
      case 2: // Active
        return tournaments.filter((t) => t.status === "active");
      case 3: // My Tournaments
        if (!user) return [];
        return tournaments.filter((t) =>
          t.participants.some(
            (p) => {
              const participantId =
                typeof p.userId === "string" ? p.userId : p.userId?._id;
              return participantId === user.id;
            }
          )
        );
      default:
        return tournaments;
    }
  };

  const filteredTournaments = getFilteredTournaments();

  return (
    <Box bg={bg} minH="100vh" px={{ base: 3, md: 6 }} py={{ base: 4, md: 6 }}>
      <VStack spacing={6} maxW="1200px" mx="auto">
        {/* Header */}
        <Flex
          justify="space-between"
          align={{ base: "flex-start", md: "center" }}
          w="full"
          wrap="wrap"
          gap={4}
        >
          <VStack align="start" spacing={1}>
            <HStack spacing={2}>
              <Icon as={FaTrophy} color="teal.400" boxSize={6} />
              <Text fontSize="2xl" fontWeight="bold">
                Tournaments
              </Text>
            </HStack>
            <Text color="gray.500">
              Compete with typists worldwide in exciting tournaments
            </Text>
          </VStack>
          {user && (
            <Button
              colorScheme="teal"
              leftIcon={<FaPlus />}
              size={{ base: "md", md: "md" }}
              w={{ base: "full", sm: "auto" }}
              onClick={() => (window.location.href = "/tournaments/create")}
            >
              Create Tournament
            </Button>
          )}
        </Flex>

        <Box
          bg={cardBg}
          borderRadius="xl"
          w="full"
          boxShadow="sm"
          p={{ base: 4, md: 5 }}
        >
          <VStack align="start" spacing={3}>
            <Badge colorScheme="teal" variant="subtle">
              Competitive typing events
            </Badge>
            <Text color="gray.200" fontSize={{ base: "sm", md: "md" }}>
              Browse upcoming brackets, join live competitions, and track
              tournament results across StoryType.
            </Text>
            <Text color="gray.500" fontSize="sm">
              This page updates as new tournaments are created, started, and
              completed.
            </Text>
          </VStack>
        </Box>

        {/* Filters */}
        <Box bg={cardBg} p={{ base: 4, md: 5 }} borderRadius="xl" w="full" boxShadow="sm">
          <VStack spacing={4}>
            <Flex gap={4} wrap="wrap" w="full">
              {/* Search */}
              <InputGroup flex="1" minW={{ base: "100%", md: "260px" }}>
                <InputLeftElement pointerEvents="none">
                  <Icon as={FaSearch} color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="Search tournaments..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                />
              </InputGroup>

              {/* Status Filter */}
              <Select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                flex={{ base: "1 1 calc(50% - 8px)", md: "0 0 150px" }}
                minW={{ base: "140px", md: "150px" }}
              >
                <option value="all">All Status</option>
                <option value="upcoming">Upcoming</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </Select>

              {/* Type Filter */}
              <Select
                value={filters.type}
                onChange={(e) => handleFilterChange("type", e.target.value)}
                flex={{ base: "1 1 calc(50% - 8px)", md: "0 0 150px" }}
                minW={{ base: "140px", md: "150px" }}
              >
                <option value="all">All Types</option>
                <option value="weekly">Weekly</option>
                <option value="bracket">Bracket</option>
                <option value="team">Team</option>
                <option value="special">Special</option>
              </Select>

              {/* Theme Filter */}
              <Select
                value={filters.theme}
                onChange={(e) => handleFilterChange("theme", e.target.value)}
                flex={{ base: "1 1 calc(50% - 8px)", md: "0 0 150px" }}
                minW={{ base: "140px", md: "150px" }}
              >
                <option value="all">All Themes</option>
                <option value="speed">Speed</option>
                <option value="accuracy">Accuracy</option>
                <option value="endurance">Endurance</option>
                <option value="mixed">Mixed</option>
              </Select>
            </Flex>

            {/* Tabs */}
            <Tabs index={activeTab} onChange={setActiveTab} w="full">
              <Box overflowX="auto" overflowY="hidden" w="full" pb={1}>
                <TabList minW="max-content" w="max-content" pr={4}>
                  <Tab
                    px={{ base: 3, md: 4 }}
                    fontSize={{ base: "sm", md: "md" }}
                    flexShrink={0}
                    whiteSpace="nowrap"
                  >
                    All Tournaments
                  </Tab>
                  <Tab
                    px={{ base: 3, md: 4 }}
                    fontSize={{ base: "sm", md: "md" }}
                    flexShrink={0}
                    whiteSpace="nowrap"
                  >
                    Upcoming
                  </Tab>
                  <Tab
                    px={{ base: 3, md: 4 }}
                    fontSize={{ base: "sm", md: "md" }}
                    flexShrink={0}
                    whiteSpace="nowrap"
                  >
                    Active
                  </Tab>
                  {user && (
                    <Tab
                      px={{ base: 3, md: 4 }}
                      fontSize={{ base: "sm", md: "md" }}
                      flexShrink={0}
                      whiteSpace="nowrap"
                    >
                      My Tournaments
                    </Tab>
                  )}
                </TabList>
              </Box>
              <TabPanels>
                <TabPanel px={0}>
                  <Text color="gray.500" fontSize="sm">
                    Showing all tournaments
                  </Text>
                </TabPanel>
                <TabPanel px={0}>
                  <Text color="gray.500" fontSize="sm">
                    Tournaments starting soon
                  </Text>
                </TabPanel>
                <TabPanel px={0}>
                  <Text color="gray.500" fontSize="sm">
                    Tournaments currently running
                  </Text>
                </TabPanel>
                {user && (
                  <TabPanel px={0}>
                    <Text color="gray.500" fontSize="sm">
                      Tournaments you&apos;re participating in
                    </Text>
                  </TabPanel>
                )}
              </TabPanels>
            </Tabs>
          </VStack>
        </Box>

        {/* Tournaments Grid */}
        {loading ? (
          <Flex justify="center" align="center" minH="300px">
            <Spinner size="xl" color="teal.400" />
          </Flex>
        ) : filteredTournaments.length === 0 ? (
          <Box
            bg={cardBg}
            p={8}
            borderRadius="xl"
            textAlign="center"
            boxShadow="sm"
          >
            <VStack spacing={4}>
              <Icon as={FaTrophy} boxSize={12} color="gray.400" />
              <Text fontSize="lg" color="gray.500">
                No tournaments found
              </Text>
              <Text fontSize="sm" color="gray.400">
                Try adjusting your filters or check back later for new
                tournaments
              </Text>
            </VStack>
          </Box>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} w="full">
            {filteredTournaments.map((tournament) => (
              <TournamentCard
                key={tournament._id}
                tournament={tournament}
                onJoin={handleJoinTournament}
                onLeave={handleLeaveTournament}
              />
            ))}
          </SimpleGrid>
        )}

        {/* Stats */}
        <Box bg={cardBg} p={{ base: 4, md: 5 }} borderRadius="xl" w="full" boxShadow="sm">
          <HStack justify="center" spacing={{ base: 6, md: 8 }} wrap="wrap">
            <VStack spacing={1}>
              <Text fontSize="2xl" fontWeight="bold" color="teal.400">
                {tournaments.filter((t) => t.status === "upcoming").length}
              </Text>
              <Text fontSize="sm" color="gray.500">
                Upcoming
              </Text>
            </VStack>
            <VStack spacing={1}>
              <Text fontSize="2xl" fontWeight="bold" color="green.400">
                {tournaments.filter((t) => t.status === "active").length}
              </Text>
              <Text fontSize="sm" color="gray.500">
                Active
              </Text>
            </VStack>
            <VStack spacing={1}>
              <Text fontSize="2xl" fontWeight="bold" color="gray.400">
                {tournaments.filter((t) => t.status === "completed").length}
              </Text>
              <Text fontSize="sm" color="gray.500">
                Completed
              </Text>
            </VStack>
            <VStack spacing={1}>
              <Text fontSize="2xl" fontWeight="bold" color="purple.400">
                {tournaments.reduce((sum, t) => sum + t.participants.length, 0)}
              </Text>
              <Text fontSize="sm" color="gray.500">
                Total Participants
              </Text>
            </VStack>
          </HStack>
        </Box>
      </VStack>
    </Box>
  );
}
