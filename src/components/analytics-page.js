import React, { useEffect, useMemo, useState } from "react";
import Navbar from "./navbar";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/router";
import {
  Badge,
  Box,
  Button,
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
  FaCrown,
  FaFire,
  FaLock,
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

const previewCards = [
  "Weak character analysis",
  "Pattern-level mistake hotspots",
  "Unlimited ghost history",
  "Improvement recommendations",
];

function ProBadge() {
  return (
    <HStack
      spacing={2}
      px={3}
      py={1.5}
      borderRadius="full"
      bg="yellow.500"
      color="gray.900"
      fontWeight="800"
      fontSize="xs"
      textTransform="uppercase"
      letterSpacing="0.08em"
    >
      <Icon as={FaCrown} boxSize={3} />
      <Text>StoryType Pro</Text>
    </HStack>
  );
}

function Insight({ item }) {
  const color =
    item.tone === "positive" ? "green.300" : item.tone === "warning" ? "orange.300" : "blue.300";

  return (
    <Box border="1px solid" borderColor="whiteAlpha.120" borderRadius="2xl" p={4} bg="whiteAlpha.040">
      <Text color={color} fontSize="xs" fontWeight="800" textTransform="uppercase" mb={2}>
        {item.tone}
      </Text>
      <Text color="white" fontWeight="700" mb={1}>
        {item.title}
      </Text>
      <Text color="gray.400" fontSize="sm">
        {item.body}
      </Text>
    </Box>
  );
}

export default function AnalyticsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30");
  const [selectedGenre, setSelectedGenre] = useState("all");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/profile");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [recordsRes, statsRes] = await Promise.all([
          fetch(`/api/analytics/records?limit=100&days=${timeRange}&genre=${selectedGenre}`),
          fetch(`/api/analytics/stats?days=${timeRange}`),
        ]);
        const recordsData = await recordsRes.json();
        const statsData = await statsRes.json();

        if (recordsData.success) setRecords((recordsData.records || []).reverse());
        if (statsData.success) setStats(statsData);
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, timeRange, selectedGenre]);

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

  const proTrendData = useMemo(() => {
    const trend = stats?.proAnalytics?.longRangeTrend || [];
    return {
      labels: trend.map((entry) => entry.label.slice(5)),
      datasets: [
        {
          label: "Average WPM",
          data: trend.map((entry) => entry.averageWpm),
          borderColor: "#F59E0B",
          backgroundColor: "rgba(245, 158, 11, 0.10)",
          fill: true,
          tension: 0.35,
          borderWidth: 2,
          pointRadius: 0,
        },
      ],
    };
  }, [stats]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { labels: { color: "#E2E8F0", usePointStyle: true } },
    },
    scales: {
      x: { grid: { color: "rgba(255,255,255,0.06)" }, ticks: { color: "#94A3B8" } },
      y: { grid: { color: "rgba(255,255,255,0.06)" }, ticks: { color: "#94A3B8" } },
      y1: { position: "right", min: 0, max: 100, grid: { drawOnChartArea: false }, ticks: { color: "#94A3B8" } },
    },
  };

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
          hint: "Compared to early sample",
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
        <Flex minH="100vh" align="center" justify="center" bg="gray.950">
          <Spinner size="xl" color="teal.300" />
        </Flex>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <Flex minH="100vh" align="center" justify="center" bg="gray.950">
          <Spinner size="xl" color="teal.300" />
        </Flex>
      </>
    );
  }

  const isPro = Boolean(user?.isPro);

  return (
    <>
      <Navbar />
      <Box minH="100vh" bg="gray.950" px={{ base: 3, md: 6 }} py={{ base: 6, md: 10 }}>
        <VStack maxW="1400px" mx="auto" spacing={5} align="stretch">
          <Box bg="gray.900" border="1px solid" borderColor="whiteAlpha.140" borderRadius="3xl" p={{ base: 5, md: 8 }}>
            <Grid templateColumns={{ base: "1fr", xl: "1.35fr 0.85fr" }} gap={6}>
              <VStack align="start" spacing={4}>
                <HStack spacing={2} flexWrap="wrap">
                  <HStack spacing={2} px={3} py={1.5} borderRadius="full" bg="whiteAlpha.060" border="1px solid" borderColor="whiteAlpha.100">
                    <Icon as={FaSparkles} color="teal.300" />
                    <Text color="gray.400" fontSize="sm">Typing performance intelligence</Text>
                  </HStack>
                  {isPro ? <ProBadge /> : null}
                </HStack>
                <Heading color="white" fontSize={{ base: "3xl", md: "5xl" }} lineHeight="1" letterSpacing="-0.04em">
                  Analytics that scale from free insight to Pro depth.
                </Heading>
                <Text color="gray.300" fontSize={{ base: "md", md: "lg" }} maxW="720px" lineHeight="1.8">
                  Review speed, accuracy, genre strength, and long-range trend momentum.
                  StoryType Pro unlocks deeper mistake analysis and unlimited ghost history.
                </Text>
              </VStack>

              <VStack align="stretch" spacing={4} bg="whiteAlpha.040" border="1px solid" borderColor="whiteAlpha.100" borderRadius="2xl" p={4}>
                <HStack justify="space-between">
                  <Text color="teal.300" fontSize="sm" fontWeight="bold" textTransform="uppercase">
                    Controls
                  </Text>
                  {!isPro ? <ProBadge /> : null}
                </HStack>
                <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3}>
                  <Select value={selectedGenre} onChange={(e) => setSelectedGenre(e.target.value)} bg="gray.800" borderColor="whiteAlpha.100" color="gray.300">
                    {["all", "Fantasy", "Mystery", "Sci-Fi", "Romance"].map((genre) => (
                      <option key={genre} value={genre}>
                        {genre === "all" ? "All Genres" : genre}
                      </option>
                    ))}
                  </Select>
                  <Select value={timeRange} onChange={(e) => setTimeRange(e.target.value)} bg="gray.800" borderColor="whiteAlpha.100" color="gray.300">
                    {ranges.map((range) => (
                      <option key={range.value} value={range.value}>
                        {range.label}
                      </option>
                    ))}
                  </Select>
                </SimpleGrid>
                {!isPro ? (
                  <Box border="1px solid" borderColor="yellow.500" borderRadius="xl" p={4} bg="yellow.500" bgOpacity={0.08}>
                    <Text color="yellow.200" fontWeight="700" mb={1}>
                      Upgrade to Pro to unlock deeper analytics
                    </Text>
                    <Text color="gray.300" fontSize="sm">
                      Weak-key analysis, unlimited ghost history, and improvement insights are gated cleanly behind StoryType Pro.
                    </Text>
                  </Box>
                ) : null}
              </VStack>
            </Grid>
          </Box>

          {stats?.stats?.totalTests > 0 ? (
            <>
              <SimpleGrid columns={{ base: 1, sm: 2, xl: 4 }} spacing={4}>
                {statCards.map((card) => (
                  <Box key={card.label} bg="gray.900" border="1px solid" borderColor="whiteAlpha.140" borderRadius="2xl" p={5}>
                    <Stat>
                      <HStack justify="space-between" mb={4}>
                        <StatLabel color="gray.400">{card.label}</StatLabel>
                        <Icon as={card.icon} color={card.color} boxSize={4} />
                      </HStack>
                      <StatNumber color={card.color} fontSize={{ base: "3xl", md: "4xl" }}>
                        {card.value}
                        {card.suffix ? <Text as="span" color="gray.400" fontSize="lg" ml={2}>{card.suffix}</Text> : null}
                      </StatNumber>
                      <StatHelpText color="gray.400" mb={0}>
                        {card.hint}
                      </StatHelpText>
                    </Stat>
                  </Box>
                ))}
              </SimpleGrid>

              <Grid templateColumns={{ base: "1fr", xl: "1.55fr 0.85fr" }} gap={5}>
                <Box bg="gray.900" border="1px solid" borderColor="whiteAlpha.140" borderRadius="3xl" p={{ base: 4, md: 6 }}>
                  <Text color="teal.300" fontSize="sm" fontWeight="bold" textTransform="uppercase" mb={2}>
                    Trendline
                  </Text>
                  <Heading size="md" color="white" mb={4}>
                    Performance over time
                  </Heading>
                  <Box h={{ base: "280px", md: "420px" }}>
                    <Line data={chartData} options={chartOptions} />
                  </Box>
                </Box>

                <Box bg="gray.900" border="1px solid" borderColor="whiteAlpha.140" borderRadius="3xl" p={5}>
                  <Text color="blue.300" fontSize="sm" fontWeight="bold" textTransform="uppercase" mb={4}>
                    Recent tests
                  </Text>
                  <VStack align="stretch" spacing={3}>
                    {(stats.recentTests || []).slice(0, 5).map((test, index) => (
                      <Box key={`${test.timestamp}-${index}`} border="1px solid" borderColor="whiteAlpha.100" borderRadius="xl" p={4}>
                        <HStack justify="space-between" mb={2}>
                          <Badge colorScheme="teal">{test.genre}</Badge>
                          <Text color="gray.500" fontSize="xs">{new Date(test.timestamp).toLocaleDateString()}</Text>
                        </HStack>
                        <Text color="white" fontWeight="700">
                          {test.wpm} WPM • {test.accuracy}% accuracy
                        </Text>
                      </Box>
                    ))}
                  </VStack>
                </Box>
              </Grid>

              {isPro ? (
                <Grid templateColumns={{ base: "1fr", xl: "1fr 1fr" }} gap={5}>
                  <Box bg="gray.900" border="1px solid" borderColor="whiteAlpha.140" borderRadius="3xl" p={{ base: 4, md: 6 }}>
                    <HStack justify="space-between" mb={4}>
                      <VStack align="start" spacing={1}>
                        <Text color="yellow.300" fontSize="sm" fontWeight="bold" textTransform="uppercase">
                          Pro Trend Depth
                        </Text>
                        <Heading size="md" color="white">
                          Long-range momentum
                        </Heading>
                      </VStack>
                      <ProBadge />
                    </HStack>
                    <Box h={{ base: "220px", md: "300px" }}>
                      <Line data={proTrendData} options={chartOptions} />
                    </Box>
                  </Box>

                  <Box bg="gray.900" border="1px solid" borderColor="whiteAlpha.140" borderRadius="3xl" p={{ base: 4, md: 6 }}>
                    <Text color="yellow.300" fontSize="sm" fontWeight="bold" textTransform="uppercase" mb={2}>
                      Improvement Insights
                    </Text>
                    <Heading size="md" color="white" mb={4}>
                      What to focus on next
                    </Heading>
                    <VStack align="stretch" spacing={3}>
                      {(stats.proAnalytics?.insights || []).length ? (
                        stats.proAnalytics.insights.map((item) => (
                          <Insight key={item.id} item={item} />
                        ))
                      ) : (
                        <Text color="gray.500">New richer sessions will start populating these insights.</Text>
                      )}
                    </VStack>
                  </Box>

                  <Box bg="gray.900" border="1px solid" borderColor="whiteAlpha.140" borderRadius="3xl" p={{ base: 4, md: 6 }}>
                    <Text color="yellow.300" fontSize="sm" fontWeight="bold" textTransform="uppercase" mb={2}>
                      Mistake Analysis
                    </Text>
                    <Heading size="md" color="white" mb={4}>
                      Weak characters and patterns
                    </Heading>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      <Box border="1px solid" borderColor="whiteAlpha.100" borderRadius="2xl" p={4}>
                        <Text color="gray.400" fontSize="sm" mb={3}>Weak characters</Text>
                        <VStack align="stretch" spacing={2}>
                          {(stats.proAnalytics?.mistakeCharacters || []).length ? (
                            stats.proAnalytics.mistakeCharacters.map((entry) => (
                              <HStack key={entry.character} justify="space-between">
                                <Text color="white">{entry.character}</Text>
                                <Badge colorScheme="orange">{entry.count}</Badge>
                              </HStack>
                            ))
                          ) : (
                            <Text color="gray.500" fontSize="sm">No character-level data yet.</Text>
                          )}
                        </VStack>
                      </Box>
                      <Box border="1px solid" borderColor="whiteAlpha.100" borderRadius="2xl" p={4}>
                        <Text color="gray.400" fontSize="sm" mb={3}>Weak patterns</Text>
                        <VStack align="stretch" spacing={2}>
                          {(stats.proAnalytics?.mistakePatterns || []).length ? (
                            stats.proAnalytics.mistakePatterns.map((entry) => (
                              <HStack key={entry.pattern} justify="space-between" align="start">
                                <Text color="white" fontSize="sm">{entry.pattern}</Text>
                                <Badge colorScheme="red">{entry.count}</Badge>
                              </HStack>
                            ))
                          ) : (
                            <Text color="gray.500" fontSize="sm">No pattern-level data yet.</Text>
                          )}
                        </VStack>
                      </Box>
                    </SimpleGrid>
                  </Box>

                  <Box bg="gray.900" border="1px solid" borderColor="whiteAlpha.140" borderRadius="3xl" p={{ base: 4, md: 6 }}>
                    <Text color="yellow.300" fontSize="sm" fontWeight="bold" textTransform="uppercase" mb={2}>
                      Error Hotspots
                    </Text>
                    <Heading size="md" color="white" mb={4}>
                      Weak genres and sessions
                    </Heading>
                    <VStack align="stretch" spacing={3}>
                      {(stats.proAnalytics?.worstGenres || []).map((entry) => (
                        <Box key={entry.genre} border="1px solid" borderColor="whiteAlpha.100" borderRadius="xl" p={3}>
                          <Text color="white" fontWeight="700">{entry.genre}</Text>
                          <Text color="gray.400" fontSize="sm">
                            {entry.averageErrorRate}% error rate • {entry.averageWPM} WPM • {entry.averageAccuracy}% accuracy
                          </Text>
                        </Box>
                      ))}
                      {(stats.proAnalytics?.worstSessions || []).map((entry) => (
                        <Box key={entry.id} border="1px solid" borderColor="whiteAlpha.100" borderRadius="xl" p={3}>
                          <Text color="white" fontWeight="700">{entry.genre}</Text>
                          <Text color="gray.400" fontSize="sm">
                            {entry.errorRate}% error rate • {entry.wpm} WPM • {entry.accuracy}% accuracy
                          </Text>
                        </Box>
                      ))}
                    </VStack>
                  </Box>
                </Grid>
              ) : (
                <Box bg="gray.900" border="1px solid" borderColor="whiteAlpha.140" borderRadius="3xl" p={{ base: 4, md: 6 }}>
                  <HStack justify="space-between" mb={4} flexWrap="wrap">
                    <VStack align="start" spacing={1}>
                      <Text color="yellow.300" fontSize="sm" fontWeight="bold" textTransform="uppercase">
                        StoryType Pro Preview
                      </Text>
                      <Heading size="md" color="white">
                        Premium analytics ready behind entitlement gating
                      </Heading>
                    </VStack>
                    <ProBadge />
                  </HStack>
                  <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} spacing={4}>
                    {previewCards.map((item) => (
                      <Box key={item} border="1px solid" borderColor="yellow.500" borderRadius="2xl" p={4} bg="yellow.500" bgOpacity={0.05}>
                        <HStack justify="space-between" mb={3}>
                          <Text color="white" fontWeight="700">{item}</Text>
                          <Icon as={FaLock} color="yellow.300" />
                        </HStack>
                        <Text color="gray.400" fontSize="sm">
                          {stats?.proPreview?.description || "Upgrade to StoryType Pro to unlock deeper analytics."}
                        </Text>
                      </Box>
                    ))}
                  </SimpleGrid>
                </Box>
              )}

              <Button alignSelf="start" variant="outline" colorScheme="teal" leftIcon={<FaBolt />} onClick={() => router.push("/type")}>
                Start another run
              </Button>
            </>
          ) : (
            <Box bg="gray.900" border="1px solid" borderColor="whiteAlpha.140" borderRadius="3xl" p={{ base: 8, md: 12 }} textAlign="center">
              <VStack spacing={5}>
                <Box w="68px" h="68px" borderRadius="2xl" bg="whiteAlpha.080" display="flex" alignItems="center" justifyContent="center">
                  <Icon as={FaChartLine} color="teal.300" boxSize={7} />
                </Box>
                <Heading color="white" size="lg">No analytics yet</Heading>
                <Text color="gray.400" maxW="520px" lineHeight="1.8">
                  Start typing a few sessions and this page will turn into a live dashboard for your speed,
                  accuracy, genre strength, and progression.
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
