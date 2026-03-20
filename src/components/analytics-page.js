import React, { useEffect, useMemo, useState } from "react";
import Navbar from "./navbar";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/router";
import {
  Badge,
  Box,
  Button,
  Divider,
  Flex,
  Grid,
  Heading,
  HStack,
  Icon,
  Select,
  SimpleGrid,
  Spinner,
  Stat,
  StatHelpText,
  StatLabel,
  StatNumber,
  Text,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import {
  FaArrowTrendUp,
  FaBolt,
  FaBullseye,
  FaChartLine,
  FaClock,
  FaFire,
  FaSparkles,
  FaTrophy,
} from "react-icons/fa6";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ranges = [
  { value: "7", label: "Last 7 Days" },
  { value: "30", label: "Last 30 Days" },
  { value: "90", label: "Last 90 Days" },
  { value: "365", label: "Last Year" },
];

export default function AnalyticsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30");
  const [selectedGenre, setSelectedGenre] = useState("all");

  const pageBg = useColorModeValue("gray.950", "gray.950");
  const panelBg = useColorModeValue("gray.900", "gray.900");
  const borderColor = useColorModeValue("whiteAlpha.140", "whiteAlpha.140");
  const softBorder = useColorModeValue("whiteAlpha.100", "whiteAlpha.100");
  const headingColor = useColorModeValue("white", "white");
  const bodyColor = useColorModeValue("gray.300", "gray.300");
  const mutedColor = useColorModeValue("gray.400", "gray.400");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/profile");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, timeRange, selectedGenre]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [recordsRes, statsRes] = await Promise.all([
        fetch(`/api/analytics/records?limit=100&days=${timeRange}&genre=${selectedGenre}`),
        fetch(`/api/analytics/stats?days=${timeRange}`),
      ]);
      const recordsData = await recordsRes.json();
      const statsData = await statsRes.json();
      if (recordsData.success) setRecords(recordsData.records.reverse());
      if (statsData.success) setStats(statsData);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = useMemo(
    () => ({
      labels: records.map((record) => {
        const date = new Date(record.timestamp);
        return `${date.getMonth() + 1}/${date.getDate()}`;
      }),
      datasets: [
        {
          label: "WPM",
          data: records.map((record) => record.wpm),
          borderColor: "#2DD4BF",
          backgroundColor: "rgba(45, 212, 191, 0.16)",
          fill: true,
          tension: 0.35,
          borderWidth: 3,
          pointRadius: 0,
        },
        {
          label: "Accuracy %",
          data: records.map((record) => record.accuracy),
          borderColor: "#60A5FA",
          backgroundColor: "rgba(96, 165, 250, 0.08)",
          fill: true,
          tension: 0.35,
          borderWidth: 2,
          pointRadius: 0,
          yAxisID: "y1",
        },
      ],
    }),
    [records]
  );

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: {
          labels: {
            color: "#E2E8F0",
            usePointStyle: true,
          },
        },
        tooltip: {
          backgroundColor: "rgba(15, 23, 42, 0.92)",
          borderColor: "rgba(45, 212, 191, 0.35)",
          borderWidth: 1,
        },
      },
      scales: {
        x: { grid: { color: "rgba(255,255,255,0.06)" }, ticks: { color: "#94A3B8" } },
        y: { grid: { color: "rgba(255,255,255,0.06)" }, ticks: { color: "#94A3B8" } },
        y1: {
          position: "right",
          min: 0,
          max: 100,
          grid: { drawOnChartArea: false },
          ticks: { color: "#94A3B8" },
        },
      },
    }),
    []
  );

  const topGenre = useMemo(() => {
    if (!stats?.byGenre) return null;
    const entries = Object.entries(stats.byGenre);
    if (!entries.length) return null;
    return entries.sort((a, b) => b[1].averageWPM - a[1].averageWPM)[0];
  }, [stats]);

  const statCards = stats
    ? [
        {
          label: "Peak Speed",
          value: stats.stats.highestWPM,
          suffix: "WPM",
          hint: `Average ${stats.stats.averageWPM} WPM`,
          icon: FaTrophy,
          color: "teal.300",
        },
        {
          label: "Accuracy",
          value: stats.stats.averageAccuracy,
          suffix: "%",
          hint: `${stats.stats.totalTests} tests logged`,
          icon: FaBullseye,
          color: "blue.300",
        },
        {
          label: "Improvement",
          value: `${stats.stats.improvement >= 0 ? "+" : ""}${stats.stats.improvement}`,
          suffix: "",
          hint: "Compared to early sessions",
          icon: FaArrowTrendUp,
          color: stats.stats.improvement >= 0 ? "green.300" : "red.300",
        },
        {
          label: "Consistency",
          value: stats.stats.consistency,
          suffix: "%",
          hint: `Lowest ${stats.stats.lowestWPM} WPM`,
          icon: FaFire,
          color: "orange.300",
        },
      ]
    : [];

  if (authLoading || !user) {
    return (
      <>
        <Navbar />
        <Flex minH="100vh" align="center" justify="center" bg={pageBg}>
          <Spinner size="xl" color="teal.300" />
        </Flex>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Box minH="100vh" bg={pageBg} px={{ base: 3, md: 6 }} py={{ base: 6, md: 10 }}>
        <VStack maxW="1400px" mx="auto" spacing={5} align="stretch">
          <Box
            bg={panelBg}
            border="1px solid"
            borderColor={borderColor}
            borderRadius={{ base: "2xl", md: "3xl" }}
            p={{ base: 5, md: 8 }}
            position="relative"
            overflow="hidden"
            boxShadow="0 24px 80px rgba(0,0,0,0.28)"
          >
            <Box
              position="absolute"
              top="-80px"
              right="-60px"
              w={{ base: "180px", md: "320px" }}
              h={{ base: "180px", md: "320px" }}
              bgGradient="radial(teal.500, transparent 70%)"
              opacity={0.12}
              filter="blur(40px)"
            />
            <Grid templateColumns={{ base: "1fr", xl: "1.35fr 0.85fr" }} gap={6}>
              <VStack align="start" spacing={4}>
                <HStack spacing={2} px={3} py={1.5} borderRadius="full" bg="whiteAlpha.060" border="1px solid" borderColor={softBorder}>
                  <Icon as={FaSparkles} color="teal.300" />
                  <Text color={mutedColor} fontSize="sm">Typing performance intelligence</Text>
                </HStack>
                <Heading color={headingColor} fontSize={{ base: "3xl", md: "5xl" }} lineHeight="1" letterSpacing="-0.04em">
                  Analytics that feel like a real cockpit, not a default chart page.
                </Heading>
                <Text color={bodyColor} fontSize={{ base: "md", md: "lg" }} maxW="720px" lineHeight="1.8">
                  Review speed, accuracy, genre strength, and trend momentum in a
                  cleaner layout designed to make progress obvious at a glance.
                </Text>
                <HStack spacing={3} flexWrap="wrap">
                  <Badge colorScheme="teal" variant="subtle" px={3} py={1} borderRadius="full">
                    {stats?.stats?.totalTests || 0} tests
                  </Badge>
                  <Badge colorScheme="blue" variant="subtle" px={3} py={1} borderRadius="full">
                    {selectedGenre === "all" ? "All genres" : selectedGenre}
                  </Badge>
                  <Badge colorScheme="orange" variant="subtle" px={3} py={1} borderRadius="full">
                    {ranges.find((item) => item.value === timeRange)?.label}
                  </Badge>
                </HStack>
              </VStack>

              <VStack align="stretch" spacing={4} bg="whiteAlpha.040" border="1px solid" borderColor={softBorder} borderRadius="2xl" p={4}>
                <Text color="teal.300" fontSize="sm" fontWeight="bold" textTransform="uppercase" letterSpacing="0.12em">
                  Controls
                </Text>
                <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3}>
                  <Select value={selectedGenre} onChange={(e) => setSelectedGenre(e.target.value)} bg="gray.800" borderColor={softBorder} color={bodyColor}>
                    {["all", "Fantasy", "Mystery", "Sci-Fi", "Romance"].map((genre) => (
                      <option key={genre} value={genre}>
                        {genre === "all" ? "All Genres" : genre}
                      </option>
                    ))}
                  </Select>
                  <Select value={timeRange} onChange={(e) => setTimeRange(e.target.value)} bg="gray.800" borderColor={softBorder} color={bodyColor}>
                    {ranges.map((range) => (
                      <option key={range.value} value={range.value}>
                        {range.label}
                      </option>
                    ))}
                  </Select>
                </SimpleGrid>
                <Divider borderColor={softBorder} />
                <SimpleGrid columns={2} spacing={3}>
                  <Box border="1px solid" borderColor={softBorder} borderRadius="xl" p={4}>
                    <HStack spacing={3} align="start">
                      <Icon as={FaClock} color="blue.300" mt={1} />
                      <VStack align="start" spacing={1}>
                        <Text color={mutedColor} fontSize="xs">Top Genre</Text>
                        <Text color={headingColor} fontWeight="semibold">
                          {topGenre ? topGenre[0] : "None yet"}
                        </Text>
                      </VStack>
                    </HStack>
                  </Box>
                  <Box border="1px solid" borderColor={softBorder} borderRadius="xl" p={4}>
                    <HStack spacing={3} align="start">
                      <Icon as={FaChartLine} color="teal.300" mt={1} />
                      <VStack align="start" spacing={1}>
                        <Text color={mutedColor} fontSize="xs">Best WPM</Text>
                        <Text color={headingColor} fontWeight="semibold">
                          {stats?.stats?.highestWPM || 0}
                        </Text>
                      </VStack>
                    </HStack>
                  </Box>
                </SimpleGrid>
              </VStack>
            </Grid>
          </Box>

          {loading ? (
            <Flex justify="center" py={16}>
              <Spinner size="xl" color="teal.300" />
            </Flex>
          ) : stats && stats.stats.totalTests > 0 ? (
            <>
              <SimpleGrid columns={{ base: 1, sm: 2, xl: 4 }} spacing={4}>
                {statCards.map((card) => (
                  <Box key={card.label} bg={panelBg} border="1px solid" borderColor={borderColor} borderRadius="2xl" p={5}>
                    <Stat>
                      <HStack justify="space-between" mb={4}>
                        <StatLabel color={mutedColor}>{card.label}</StatLabel>
                        <Icon as={card.icon} color={card.color} boxSize={4} />
                      </HStack>
                      <StatNumber color={card.color} fontSize={{ base: "3xl", md: "4xl" }}>
                        {card.value}
                        {card.suffix && (
                          <Text as="span" color={mutedColor} fontSize="lg" ml={2}>
                            {card.suffix}
                          </Text>
                        )}
                      </StatNumber>
                      <StatHelpText color={mutedColor} mb={0}>
                        {card.hint}
                      </StatHelpText>
                    </Stat>
                  </Box>
                ))}
              </SimpleGrid>

              <Grid templateColumns={{ base: "1fr", xl: "1.55fr 0.85fr" }} gap={5}>
                <Box bg={panelBg} border="1px solid" borderColor={borderColor} borderRadius="3xl" p={{ base: 4, md: 6 }}>
                  <VStack align="stretch" spacing={4}>
                    <VStack align="start" spacing={1}>
                      <Text color="teal.300" fontSize="sm" fontWeight="bold" textTransform="uppercase" letterSpacing="0.12em">
                        Trendline
                      </Text>
                      <Heading size="md" color={headingColor}>
                        Performance over time
                      </Heading>
                    </VStack>
                    <Box h={{ base: "280px", md: "420px" }}>
                      <Line data={chartData} options={chartOptions} />
                    </Box>
                  </VStack>
                </Box>

                <VStack spacing={5} align="stretch">
                  <Box bg={panelBg} border="1px solid" borderColor={borderColor} borderRadius="3xl" p={5}>
                    <Text color="orange.300" fontSize="sm" fontWeight="bold" textTransform="uppercase" letterSpacing="0.12em" mb={4}>
                      Snapshot
                    </Text>
                    <SimpleGrid columns={2} spacing={3}>
                      <Box border="1px solid" borderColor={softBorder} borderRadius="xl" p={4}>
                        <Text color={mutedColor} fontSize="xs">Average WPM</Text>
                        <Text color="teal.300" fontSize="2xl" fontWeight="bold">
                          {stats.stats.averageWPM}
                        </Text>
                      </Box>
                      <Box border="1px solid" borderColor={softBorder} borderRadius="xl" p={4}>
                        <Text color={mutedColor} fontSize="xs">Accuracy</Text>
                        <Text color="blue.300" fontSize="2xl" fontWeight="bold">
                          {stats.stats.averageAccuracy}%
                        </Text>
                      </Box>
                    </SimpleGrid>
                  </Box>

                  <Box bg={panelBg} border="1px solid" borderColor={borderColor} borderRadius="3xl" p={5}>
                    <Text color="blue.300" fontSize="sm" fontWeight="bold" textTransform="uppercase" letterSpacing="0.12em" mb={4}>
                      Genre breakdown
                    </Text>
                    <VStack align="stretch" spacing={3}>
                      {Object.entries(stats.byGenre || {})
                        .sort((a, b) => b[1].averageWPM - a[1].averageWPM)
                        .slice(0, 4)
                        .map(([genre, data], index) => (
                          <Box key={genre} border="1px solid" borderColor={softBorder} borderRadius="xl" p={4} bg={index === 0 ? "whiteAlpha.060" : "transparent"}>
                            <HStack justify="space-between" mb={3}>
                              <Text color="white" fontWeight="semibold">{genre}</Text>
                              <Badge colorScheme={index === 0 ? "teal" : "gray"}>#{index + 1}</Badge>
                            </HStack>
                            <SimpleGrid columns={3} spacing={3}>
                              <Box>
                                <Text color={mutedColor} fontSize="xs">Sessions</Text>
                                <Text color="white" fontWeight="bold">{data.count}</Text>
                              </Box>
                              <Box>
                                <Text color={mutedColor} fontSize="xs">WPM</Text>
                                <Text color="teal.300" fontWeight="bold">{data.averageWPM}</Text>
                              </Box>
                              <Box>
                                <Text color={mutedColor} fontSize="xs">Accuracy</Text>
                                <Text color="blue.300" fontWeight="bold">{data.averageAccuracy}%</Text>
                              </Box>
                            </SimpleGrid>
                          </Box>
                        ))}
                    </VStack>
                  </Box>
                </VStack>
              </Grid>

              <Box bg={panelBg} border="1px solid" borderColor={borderColor} borderRadius="3xl" p={{ base: 4, md: 6 }}>
                <HStack justify="space-between" align="center" flexWrap="wrap" mb={5}>
                  <VStack align="start" spacing={1}>
                    <Text color="teal.300" fontSize="sm" fontWeight="bold" textTransform="uppercase" letterSpacing="0.12em">
                      Recent sessions
                    </Text>
                    <Heading size="md" color={headingColor}>Latest test results</Heading>
                  </VStack>
                  <Button variant="outline" colorScheme="teal" leftIcon={<FaBolt />} onClick={() => router.push("/type")}>
                    Start another run
                  </Button>
                </HStack>
                <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={4}>
                  {stats.recentTests.map((test, index) => (
                    <Box key={`${test.timestamp}-${index}`} border="1px solid" borderColor={softBorder} borderRadius="2xl" p={4} bg="whiteAlpha.040">
                      <HStack justify="space-between" align="start" mb={4}>
                        <VStack align="start" spacing={1}>
                          <Badge colorScheme="teal" borderRadius="full" px={3} py={1}>
                            {test.genre}
                          </Badge>
                          <Text color={mutedColor} fontSize="sm">
                            {new Date(test.timestamp).toLocaleString()}
                          </Text>
                        </VStack>
                        <Icon as={FaChartLine} color="teal.300" boxSize={4} />
                      </HStack>
                      <SimpleGrid columns={2} spacing={3}>
                        <Box>
                          <Text color={mutedColor} fontSize="xs">Speed</Text>
                          <Text color="teal.300" fontSize="2xl" fontWeight="bold">{test.wpm}</Text>
                        </Box>
                        <Box>
                          <Text color={mutedColor} fontSize="xs">Accuracy</Text>
                          <Text
                            color={test.accuracy >= 95 ? "green.300" : test.accuracy >= 80 ? "yellow.300" : "red.300"}
                            fontSize="2xl"
                            fontWeight="bold"
                          >
                            {test.accuracy}%
                          </Text>
                        </Box>
                      </SimpleGrid>
                    </Box>
                  ))}
                </SimpleGrid>
              </Box>
            </>
          ) : (
            <Box bg={panelBg} border="1px solid" borderColor={borderColor} borderRadius="3xl" p={{ base: 8, md: 12 }} textAlign="center">
              <VStack spacing={5}>
                <Box w="68px" h="68px" borderRadius="2xl" bg="whiteAlpha.080" display="flex" alignItems="center" justifyContent="center">
                  <Icon as={FaChartLine} color="teal.300" boxSize={7} />
                </Box>
                <Heading color={headingColor} size="lg">No analytics yet</Heading>
                <Text color={mutedColor} maxW="520px" lineHeight="1.8">
                  Start typing a few sessions and this page will turn into a live dashboard for your speed,
                  accuracy, genre strength, and overall progression.
                </Text>
                <Button colorScheme="teal" size="lg" onClick={() => router.push("/type")}>
                  Start Typing
                </Button>
              </VStack>
            </Box>
          )}
        </VStack>
      </Box>
    </>
  );
}
