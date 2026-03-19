import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Box,
  Flex,
  Grid,
  GridItem,
  Heading,
  Text,
  VStack,
  HStack,
  Icon,
  Skeleton,
  Alert,
  AlertIcon,
  Divider,
} from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import {
  FiUsers,
  FiAward,
  FiTarget,
  FiBarChart,
  FiTrendingUp,
  FiTrendingDown,
  FiActivity,
  FiCalendar,
  FiSettings,
  FiFileText,
  FiArrowUpRight,
  FiArrowDownRight,
  FiUserPlus,
  FiZap,
  FiClock,
} from "react-icons/fi";
import AdminLayout from "../../components/admin/admin-layout";

const hoverLift = keyframes`
  from { transform: translateY(0); }
  to { transform: translateY(-4px); }
`;

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);

      // Fetch dashboard statistics
      const statsResponse = await fetch("/api/admin/dashboard/stats", {
        credentials: "include",
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      // Fetch recent activity
      const activityResponse = await fetch("/api/admin/dashboard/activity", {
        credentials: "include",
      });

      if (activityResponse.ok) {
        const activityData = await activityResponse.json();
        setRecentActivity(activityData);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <AdminLayout title="Admin Dashboard">
        <VStack align="stretch" spacing={5}>
          <Skeleton h="120px" borderRadius="xl" startColor="gray.700" endColor="gray.600" />
          <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", xl: "repeat(4, 1fr)" }} gap={5}>
            {[1, 2, 3, 4].map((item) => (
              <Skeleton
                key={item}
                h="110px"
                borderRadius="xl"
                startColor="gray.700"
                endColor="gray.600"
              />
            ))}
          </Grid>
          <Grid templateColumns={{ base: "1fr", lg: "3fr 2fr" }} gap={5}>
            <Skeleton h="360px" borderRadius="xl" startColor="gray.700" endColor="gray.600" />
            <Skeleton h="360px" borderRadius="xl" startColor="gray.700" endColor="gray.600" />
          </Grid>
        </VStack>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Admin Dashboard">
        <Alert status="error" borderRadius="xl" bg="red.900" color="red.100">
          <AlertIcon color="red.300" />
          {error}
        </Alert>
      </AdminLayout>
    );
  }

  // Format today's date
  const today = new Date();
  const dateString = today.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Stat card config
  const statCards = [
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      change: stats?.userGrowth || "0%",
      changeType: "increase",
      icon: FiUsers,
      gradient: "linear(to-b, teal.400, teal.600)",
      accentColor: "teal",
      iconBg: "rgba(56, 178, 172, 0.15)",
    },
    {
      title: "Active Tournaments",
      value: stats?.activeTournaments || 0,
      change: stats?.tournamentGrowth || "0%",
      changeType: "increase",
      icon: FiAward,
      gradient: "linear(to-b, blue.400, blue.600)",
      accentColor: "blue",
      iconBg: "rgba(66, 153, 225, 0.15)",
    },
    {
      title: "Training Modules",
      value: stats?.trainingModules || 0,
      change: stats?.trainingGrowth || "0%",
      changeType: "increase",
      icon: FiTarget,
      gradient: "linear(to-b, purple.400, purple.600)",
      accentColor: "purple",
      iconBg: "rgba(159, 122, 234, 0.15)",
    },
    {
      title: "Avg. WPM",
      value: stats?.averageWPM || 0,
      change: stats?.wpmGrowth || "0%",
      changeType: "increase",
      icon: FiTrendingUp,
      gradient: "linear(to-b, orange.400, orange.600)",
      accentColor: "orange",
      iconBg: "rgba(237, 137, 54, 0.15)",
    },
  ];

  // Performance bar chart data (uses API distribution, fallback scales to total users)
  const fallbackDistribution = (() => {
    const total = stats?.totalUsers || 0;
    const labels = [
      "0-30 WPM",
      "30-50 WPM",
      "50-70 WPM",
      "70-90 WPM",
      "90-120 WPM",
      "120+ WPM",
    ];
    const ratios = [0.14, 0.2, 0.24, 0.2, 0.15, 0.07];

    if (total <= 0) {
      return labels.map((label) => ({ label, value: 0 }));
    }

    const counts = ratios.map((ratio) => Math.floor(total * ratio));
    let assigned = counts.reduce((sum, count) => sum + count, 0);

    while (assigned < total) {
      for (let i = 0; i < counts.length && assigned < total; i += 1) {
        counts[i] += 1;
        assigned += 1;
      }
    }

    return labels.map((label, index) => ({ label, value: counts[index] }));
  })();

  const distributionSource =
    stats?.wpmDistribution && stats.wpmDistribution.length > 0
      ? stats.wpmDistribution
      : fallbackDistribution;

  const maxBucketValue = Math.max(
    1,
    ...distributionSource.map((bucket) => Number(bucket?.value || 0))
  );

  const barColors = [
    "red.400",
    "orange.400",
    "yellow.400",
    "teal.400",
    "blue.400",
    "purple.400",
  ];

  const performanceBars = distributionSource.map((bucket, index) => {
    const value = Number(bucket?.value || 0);
    return {
      label: bucket?.label || "Unknown",
      value,
      color: barColors[index] || "gray.400",
      width: `${Math.max(4, (value / maxBucketValue) * 100)}%`,
    };
  });

  // Activity type config
  const activityConfig = {
    join: { color: "green.400", icon: FiUserPlus, label: "User Joined" },
    test: { color: "blue.400", icon: FiZap, label: "Test Completed" },
    tournament: { color: "yellow.400", icon: FiAward, label: "Tournament" },
    default: { color: "gray.400", icon: FiActivity, label: "Activity" },
  };

  const getActivityConfig = (type) => {
    return activityConfig[type] || activityConfig.default;
  };

  // Format relative time
  const formatRelativeTime = (timestamp) => {
    if (!timestamp) return "";
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now - time;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return time.toLocaleDateString();
  };

  // Quick actions config
  const quickActions = [
    {
      title: "Manage Users",
      description: "View and manage all users",
      icon: FiUsers,
      color: "teal",
      path: "/admin/users",
    },
    {
      title: "Tournaments",
      description: "Create and manage tournaments",
      icon: FiAward,
      color: "blue",
      path: "/admin/tournaments",
    },
    {
      title: "Training Modules",
      description: "Add or edit training content",
      icon: FiTarget,
      color: "purple",
      path: "/admin/training",
    },
    {
      title: "Analytics",
      description: "Detailed performance reports",
      icon: FiBarChart,
      color: "orange",
      path: "/admin/analytics",
    },
    {
      title: "Content Manager",
      description: "Manage site content",
      icon: FiFileText,
      color: "pink",
      path: "/admin/content",
    },
    {
      title: "Settings",
      description: "Application configuration",
      icon: FiSettings,
      color: "gray",
      path: "/admin/settings",
    },
  ];

  return (
    <AdminLayout title="Admin Dashboard">
      <Box bg="gray.900" minH="100vh" px={{ base: 4, md: 6 }} py={6}>
        <VStack spacing={6} align="stretch" maxW="1400px" mx="auto">

          {/* ── Welcome Section ── */}
          <Box
            position="relative"
            overflow="hidden"
            borderRadius="xl"
            p={{ base: 5, md: 7 }}
            bgGradient="linear(135deg, gray.800 0%, gray.700 50%, gray.800 100%)"
            border="1px solid"
            borderColor="gray.700"
          >
            {/* Decorative gradient strip at top */}
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              h="3px"
              bgGradient="linear(to-r, teal.400, blue.400, purple.400, orange.400)"
            />
            <Flex
              justify="space-between"
              align={{ base: "flex-start", md: "center" }}
              direction={{ base: "column", md: "row" }}
              gap={3}
            >
              <Box>
                <Heading
                  size={{ base: "md", md: "lg" }}
                  color="white"
                  fontWeight="700"
                  letterSpacing="-0.02em"
                >
                  Welcome back
                </Heading>
                <Text color="gray.400" fontSize={{ base: "sm", md: "md" }} mt={1}>
                  Here is what is happening with StoryType today.
                </Text>
              </Box>
              <HStack
                spacing={2}
                color="gray.500"
                bg="gray.750"
                px={3}
                py={1.5}
                borderRadius="lg"
                border="1px solid"
                borderColor="gray.700"
              >
                <Icon as={FiCalendar} boxSize={4} />
                <Text fontSize="sm" fontWeight="medium">
                  {dateString}
                </Text>
              </HStack>
            </Flex>
          </Box>

          {/* ── Stat Cards ── */}
          <Grid
            templateColumns={{
              base: "1fr",
              sm: "repeat(2, 1fr)",
              lg: "repeat(4, 1fr)",
            }}
            gap={{ base: 4, md: 5 }}
          >
            {statCards.map((card, idx) => {
              const changeNum = parseFloat(String(card.change).replace("%", ""));
              const isPositive = changeNum >= 0;
              return (
                <GridItem key={idx}>
                  <Box
                    bg="gray.800"
                    borderRadius="xl"
                    border="1px solid"
                    borderColor="gray.700"
                    borderLeftWidth="4px"
                    borderLeftColor={`${card.accentColor}.400`}
                    p={{ base: 4, md: 5 }}
                    position="relative"
                    overflow="hidden"
                    transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                    boxShadow="0 1px 3px rgba(0, 0, 0, 0.3)"
                    _hover={{
                      transform: "translateY(-4px)",
                      boxShadow: `0 12px 24px rgba(0, 0, 0, 0.4), 0 0 0 1px var(--chakra-colors-${card.accentColor}-800)`,
                      borderColor: `${card.accentColor}.600`,
                    }}
                  >
                    <Flex justify="space-between" align="flex-start">
                      <VStack align="flex-start" spacing={1}>
                        <Text
                          fontSize="xs"
                          color="gray.500"
                          fontWeight="600"
                          textTransform="uppercase"
                          letterSpacing="0.05em"
                        >
                          {card.title}
                        </Text>
                        <Text
                          fontSize={{ base: "2xl", md: "3xl" }}
                          fontWeight="800"
                          color="white"
                          lineHeight="1.1"
                          letterSpacing="-0.02em"
                        >
                          {card.value}
                        </Text>
                        <HStack spacing={1} mt={1}>
                          <Icon
                            as={isPositive ? FiArrowUpRight : FiArrowDownRight}
                            color={isPositive ? "green.400" : "red.400"}
                            boxSize={3.5}
                          />
                          <Text
                            fontSize="xs"
                            fontWeight="600"
                            color={isPositive ? "green.400" : "red.400"}
                          >
                            {card.change}
                          </Text>
                          <Text fontSize="xs" color="gray.600">
                            vs last month
                          </Text>
                        </HStack>
                      </VStack>
                      <Flex
                        w={{ base: 10, md: 12 }}
                        h={{ base: 10, md: 12 }}
                        align="center"
                        justify="center"
                        borderRadius="full"
                        bg={card.iconBg}
                        flexShrink={0}
                      >
                        <Icon
                          as={card.icon}
                          boxSize={{ base: 5, md: 6 }}
                          color={`${card.accentColor}.400`}
                        />
                      </Flex>
                    </Flex>
                  </Box>
                </GridItem>
              );
            })}
          </Grid>

          {/* ── Performance Overview + Recent Activity ── */}
          <Grid
            templateColumns={{ base: "1fr", lg: "3fr 2fr" }}
            gap={{ base: 4, md: 5 }}
          >
            {/* Performance Overview */}
            <GridItem>
              <Box
                bg="gray.800"
                borderRadius="xl"
                border="1px solid"
                borderColor="gray.700"
                boxShadow="0 1px 3px rgba(0, 0, 0, 0.3)"
                overflow="hidden"
              >
                <Box px={{ base: 5, md: 6 }} pt={{ base: 5, md: 6 }} pb={3}>
                  <Flex justify="space-between" align="center">
                    <Box>
                      <Heading
                        size={{ base: "sm", md: "md" }}
                        color="white"
                        fontWeight="700"
                      >
                        Performance Overview
                      </Heading>
                      <Text fontSize="xs" color="gray.500" mt={0.5}>
                        WPM distribution across all users
                      </Text>
                    </Box>
                    <Flex
                      w={9}
                      h={9}
                      align="center"
                      justify="center"
                      borderRadius="lg"
                      bg="rgba(66, 153, 225, 0.1)"
                    >
                      <Icon as={FiBarChart} color="blue.400" boxSize={4.5} />
                    </Flex>
                  </Flex>
                </Box>
                <Box px={{ base: 5, md: 6 }} pb={{ base: 5, md: 6 }}>
                  <VStack spacing={4} align="stretch">
                    {performanceBars.map((bar, idx) => (
                      <Box key={idx}>
                        <Flex justify="space-between" mb={1.5}>
                          <Text fontSize="xs" color="gray.400" fontWeight="500">
                            {bar.label}
                          </Text>
                          <Text fontSize="xs" color="gray.500" fontWeight="600">
                            {bar.value} users
                          </Text>
                        </Flex>
                        <Box
                          bg="gray.700"
                          borderRadius="full"
                          h="10px"
                          overflow="hidden"
                        >
                          <Box
                            bg={bar.color}
                            h="100%"
                            borderRadius="full"
                            w={bar.width}
                            transition="width 1s cubic-bezier(0.4, 0, 0.2, 1)"
                            position="relative"
                            _after={{
                              content: '""',
                              position: "absolute",
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              bgGradient:
                                "linear(to-r, transparent, rgba(255,255,255,0.15))",
                              borderRadius: "full",
                            }}
                          />
                        </Box>
                      </Box>
                    ))}
                  </VStack>
                </Box>
              </Box>
            </GridItem>

            {/* Recent Activity */}
            <GridItem>
              <Box
                bg="gray.800"
                borderRadius="xl"
                border="1px solid"
                borderColor="gray.700"
                boxShadow="0 1px 3px rgba(0, 0, 0, 0.3)"
                overflow="hidden"
                h="100%"
              >
                <Box px={{ base: 5, md: 6 }} pt={{ base: 5, md: 6 }} pb={3}>
                  <Flex justify="space-between" align="center">
                    <Box>
                      <Heading
                        size={{ base: "sm", md: "md" }}
                        color="white"
                        fontWeight="700"
                      >
                        Recent Activity
                      </Heading>
                      <Text fontSize="xs" color="gray.500" mt={0.5}>
                        Latest platform events
                      </Text>
                    </Box>
                    <Flex
                      w={9}
                      h={9}
                      align="center"
                      justify="center"
                      borderRadius="lg"
                      bg="rgba(56, 178, 172, 0.1)"
                    >
                      <Icon as={FiClock} color="teal.400" boxSize={4.5} />
                    </Flex>
                  </Flex>
                </Box>
                <Box px={{ base: 5, md: 6 }} pb={{ base: 5, md: 6 }}>
                  {recentActivity.length > 0 ? (
                    <VStack spacing={0} align="stretch">
                      {recentActivity.map((activity, index) => {
                        const config = getActivityConfig(activity.type);
                        return (
                          <Box key={index}>
                            <Flex align="flex-start" py={3} gap={3}>
                              {/* Timeline dot and line */}
                              <Flex
                                direction="column"
                                align="center"
                                pt={0.5}
                                flexShrink={0}
                              >
                                <Box
                                  w={2.5}
                                  h={2.5}
                                  borderRadius="full"
                                  bg={config.color}
                                  boxShadow={`0 0 8px var(--chakra-colors-${config.color.replace(".", "-")})`}
                                />
                              </Flex>
                              {/* Content */}
                              <Box flex="1" minW={0}>
                                <Text
                                  fontSize="sm"
                                  color="gray.200"
                                  fontWeight="500"
                                  noOfLines={2}
                                  lineHeight="1.4"
                                >
                                  {activity.action}
                                </Text>
                                <HStack spacing={2} mt={1}>
                                  <Text fontSize="xs" color="gray.600">
                                    {formatRelativeTime(activity.timestamp)}
                                  </Text>
                                  <Box
                                    px={2}
                                    py={0.5}
                                    borderRadius="full"
                                    bg={`${config.color.split(".")[0]}.900`}
                                    border="1px solid"
                                    borderColor={`${config.color.split(".")[0]}.700`}
                                  >
                                    <Text
                                      fontSize="10px"
                                      fontWeight="600"
                                      color={config.color}
                                      textTransform="uppercase"
                                      letterSpacing="0.04em"
                                    >
                                      {activity.type || "event"}
                                    </Text>
                                  </Box>
                                </HStack>
                              </Box>
                            </Flex>
                            {index < recentActivity.length - 1 && (
                              <Divider borderColor="gray.750" opacity={0.5} />
                            )}
                          </Box>
                        );
                      })}
                    </VStack>
                  ) : (
                    <Flex
                      direction="column"
                      align="center"
                      justify="center"
                      py={10}
                    >
                      <Icon as={FiActivity} boxSize={8} color="gray.700" mb={3} />
                      <Text color="gray.600" fontSize="sm" fontWeight="500">
                        No recent activity
                      </Text>
                      <Text color="gray.700" fontSize="xs" mt={1}>
                        Events will appear here as they happen
                      </Text>
                    </Flex>
                  )}
                </Box>
              </Box>
            </GridItem>
          </Grid>

          {/* ── Quick Actions ── */}
          <Box>
            <Text
              fontSize="xs"
              fontWeight="700"
              color="gray.500"
              textTransform="uppercase"
              letterSpacing="0.08em"
              mb={4}
            >
              Quick Actions
            </Text>
            <Grid
              templateColumns={{
                base: "repeat(2, 1fr)",
                md: "repeat(3, 1fr)",
                lg: "repeat(6, 1fr)",
              }}
              gap={{ base: 3, md: 4 }}
            >
              {quickActions.map((action, idx) => (
                <Box
                  key={idx}
                  bg="gray.800"
                  borderRadius="xl"
                  border="1px solid"
                  borderColor="gray.700"
                  p={{ base: 4, md: 5 }}
                  cursor="pointer"
                  transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                  boxShadow="0 1px 3px rgba(0, 0, 0, 0.3)"
                  _hover={{
                    transform: "translateY(-3px)",
                    boxShadow: "0 8px 20px rgba(0, 0, 0, 0.4)",
                    borderColor: `${action.color}.600`,
                    bg: "gray.750",
                  }}
                  _active={{
                    transform: "translateY(-1px)",
                  }}
                  onClick={() => router.push(action.path)}
                  textAlign="center"
                >
                  <Flex
                    w={10}
                    h={10}
                    align="center"
                    justify="center"
                    borderRadius="lg"
                    bg={`rgba(0,0,0,0.2)`}
                    border="1px solid"
                    borderColor={`${action.color}.800`}
                    mx="auto"
                    mb={3}
                  >
                    <Icon
                      as={action.icon}
                      boxSize={5}
                      color={`${action.color}.400`}
                    />
                  </Flex>
                  <Text
                    fontSize="sm"
                    fontWeight="600"
                    color="gray.200"
                    mb={0.5}
                  >
                    {action.title}
                  </Text>
                  <Text
                    fontSize="xs"
                    color="gray.600"
                    lineHeight="1.3"
                    display={{ base: "none", md: "block" }}
                  >
                    {action.description}
                  </Text>
                </Box>
              ))}
            </Grid>
          </Box>
        </VStack>
      </Box>
    </AdminLayout>
  );
}
