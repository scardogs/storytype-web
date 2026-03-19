import { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Grid,
  GridItem,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  VStack,
  HStack,
  Icon,
  useColorModeValue,
  Spinner,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import {
  FiUsers,
  FiAward,
  FiTarget,
  FiBarChart,
  FiTrendingUp,
  FiActivity,
} from "react-icons/fi";
import AdminLayout from "../../components/admin/admin-layout";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  useEffect(() => {
    fetchDashboardData();
  }, []);

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

  if (isLoading) {
    return (
      <AdminLayout title="Admin Dashboard">
        <Flex align="center" justify="center" h="400px">
          <Spinner size="xl" />
        </Flex>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Admin Dashboard">
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      </AdminLayout>
    );
  }

  const StatCard = ({
    title,
    value,
    change,
    changeType,
    icon,
    color = "blue",
  }) => (
    <Card bg={bgColor} border="1px" borderColor={borderColor}>
      <CardBody p={{ base: 4, md: 6 }}>
        <Flex
          direction={{ base: "column", sm: "row" }}
          justify="space-between"
          align={{ base: "flex-start", sm: "center" }}
          gap={3}
        >
          <VStack align="flex-start" spacing={2} flex="1">
            <Text
              fontSize={{ base: "xs", md: "sm" }}
              color="gray.500"
              fontWeight="medium"
            >
              {title}
            </Text>
            <Stat>
              <StatNumber fontSize={{ base: "xl", md: "2xl" }}>
                {value}
              </StatNumber>
              {change && (
                <StatHelpText fontSize={{ base: "xs", md: "sm" }}>
                  <StatArrow
                    type={changeType === "increase" ? "increase" : "decrease"}
                  />
                  {change}
                </StatHelpText>
              )}
            </Stat>
          </VStack>
          <Icon
            as={icon}
            boxSize={{ base: 6, md: 8 }}
            color={`${color}.500`}
            flexShrink={0}
          />
        </Flex>
      </CardBody>
    </Card>
  );

  return (
    <AdminLayout title="Admin Dashboard">
      <VStack spacing={6} align="stretch">
        {/* Welcome Section */}
        <Box>
          <Heading size={{ base: "md", md: "lg" }} mb={2}>
            Welcome to Admin Dashboard
          </Heading>
          <Text color="gray.600" fontSize={{ base: "sm", md: "md" }}>
            Monitor and manage your StoryType application
          </Text>
        </Box>

        {/* Statistics Cards */}
        <Grid
          templateColumns={{
            base: "1fr",
            md: "repeat(2, 1fr)",
            lg: "repeat(4, 1fr)",
          }}
          gap={6}
        >
          <GridItem>
            <StatCard
              title="Total Users"
              value={stats?.totalUsers || 0}
              change={stats?.userGrowth || "0%"}
              changeType="increase"
              icon={FiUsers}
              color="blue"
            />
          </GridItem>

          <GridItem>
            <StatCard
              title="Active Tournaments"
              value={stats?.activeTournaments || 0}
              change={stats?.tournamentGrowth || "0%"}
              changeType="increase"
              icon={FiAward}
              color="yellow"
            />
          </GridItem>

          <GridItem>
            <StatCard
              title="Training Modules"
              value={stats?.trainingModules || 0}
              change={stats?.trainingGrowth || "0%"}
              changeType="increase"
              icon={FiTarget}
              color="green"
            />
          </GridItem>

          <GridItem>
            <StatCard
              title="Avg. WPM"
              value={stats?.averageWPM || 0}
              change={stats?.wpmGrowth || "0%"}
              changeType="increase"
              icon={FiTrendingUp}
              color="purple"
            />
          </GridItem>
        </Grid>

        {/* Charts Row */}
        <Grid
          templateColumns={{ base: "1fr", lg: "2fr 1fr" }}
          gap={{ base: 4, md: 6 }}
        >
          {/* Performance Chart */}
          <GridItem>
            <Card bg={bgColor} border="1px" borderColor={borderColor}>
              <CardHeader pb={{ base: 2, md: 4 }}>
                <Heading size={{ base: "sm", md: "md" }}>
                  Performance Overview
                </Heading>
              </CardHeader>
              <CardBody pt={0}>
                <Box
                  h={{ base: "200px", md: "300px" }}
                  bg="gray.50"
                  rounded="md"
                  p={{ base: 3, md: 4 }}
                >
                  <Text
                    color="gray.500"
                    textAlign="center"
                    mt={{ base: "50px", md: "100px" }}
                    fontSize={{ base: "sm", md: "md" }}
                  >
                    Chart component will be implemented here
                  </Text>
                  <Text
                    color="gray.400"
                    textAlign="center"
                    fontSize={{ base: "xs", md: "sm" }}
                  >
                    (Charts will show user activity, typing performance trends,
                    etc.)
                  </Text>
                </Box>
              </CardBody>
            </Card>
          </GridItem>

          {/* Recent Activity */}
          <GridItem>
            <Card bg={bgColor} border="1px" borderColor={borderColor}>
              <CardHeader pb={{ base: 2, md: 4 }}>
                <Heading size={{ base: "sm", md: "md" }}>
                  Recent Activity
                </Heading>
              </CardHeader>
              <CardBody pt={0}>
                <VStack spacing={{ base: 2, md: 3 }} align="stretch">
                  {recentActivity.length > 0 ? (
                    recentActivity.map((activity, index) => (
                      <Flex
                        key={index}
                        direction={{ base: "column", sm: "row" }}
                        gap={2}
                        align={{ base: "flex-start", sm: "center" }}
                      >
                        <HStack spacing={2} flex="1">
                          <Icon
                            as={FiActivity}
                            color="blue.500"
                            boxSize={{ base: 4, md: 5 }}
                          />
                          <VStack align="flex-start" spacing={0} flex="1">
                            <Text
                              fontSize={{ base: "xs", md: "sm" }}
                              fontWeight="medium"
                              noOfLines={2}
                            >
                              {activity.action}
                            </Text>
                            <Text
                              fontSize={{ base: "xs", md: "xs" }}
                              color="gray.500"
                            >
                              {activity.timestamp}
                            </Text>
                          </VStack>
                        </HStack>
                        <Badge
                          size={{ base: "xs", md: "sm" }}
                          colorScheme="blue"
                          alignSelf={{ base: "flex-start", sm: "center" }}
                        >
                          {activity.type}
                        </Badge>
                      </Flex>
                    ))
                  ) : (
                    <Text
                      color="gray.500"
                      fontSize={{ base: "xs", md: "sm" }}
                      textAlign="center"
                      py={4}
                    >
                      No recent activity
                    </Text>
                  )}
                </VStack>
              </CardBody>
            </Card>
          </GridItem>
        </Grid>

        {/* Quick Actions */}
        <Card bg={bgColor} border="1px" borderColor={borderColor}>
          <CardHeader pb={{ base: 2, md: 4 }}>
            <Heading size={{ base: "sm", md: "md" }}>Quick Actions</Heading>
          </CardHeader>
          <CardBody pt={0}>
            <Grid
              templateColumns={{
                base: "repeat(2, 1fr)",
                md: "repeat(2, 1fr)",
                lg: "repeat(4, 1fr)",
              }}
              gap={{ base: 3, md: 4 }}
            >
              <Card
                variant="outline"
                cursor="pointer"
                _hover={{ shadow: "md" }}
              >
                <CardBody textAlign="center" p={{ base: 3, md: 4 }}>
                  <Icon
                    as={FiUsers}
                    boxSize={{ base: 5, md: 6 }}
                    color="blue.500"
                    mb={2}
                  />
                  <Text fontSize={{ base: "xs", md: "sm" }} fontWeight="medium">
                    Manage Users
                  </Text>
                </CardBody>
              </Card>

              <Card
                variant="outline"
                cursor="pointer"
                _hover={{ shadow: "md" }}
              >
                <CardBody textAlign="center" p={{ base: 3, md: 4 }}>
                  <Icon
                    as={FiAward}
                    boxSize={{ base: 5, md: 6 }}
                    color="yellow.500"
                    mb={2}
                  />
                  <Text fontSize={{ base: "xs", md: "sm" }} fontWeight="medium">
                    Create Tournament
                  </Text>
                </CardBody>
              </Card>

              <Card
                variant="outline"
                cursor="pointer"
                _hover={{ shadow: "md" }}
              >
                <CardBody textAlign="center" p={{ base: 3, md: 4 }}>
                  <Icon
                    as={FiTarget}
                    boxSize={{ base: 5, md: 6 }}
                    color="green.500"
                    mb={2}
                  />
                  <Text fontSize={{ base: "xs", md: "sm" }} fontWeight="medium">
                    Add Training
                  </Text>
                </CardBody>
              </Card>

              <Card
                variant="outline"
                cursor="pointer"
                _hover={{ shadow: "md" }}
              >
                <CardBody textAlign="center" p={{ base: 3, md: 4 }}>
                  <Icon
                    as={FiBarChart}
                    boxSize={{ base: 5, md: 6 }}
                    color="purple.500"
                    mb={2}
                  />
                  <Text fontSize={{ base: "xs", md: "sm" }} fontWeight="medium">
                    View Analytics
                  </Text>
                </CardBody>
              </Card>
            </Grid>
          </CardBody>
        </Card>
      </VStack>
    </AdminLayout>
  );
}
