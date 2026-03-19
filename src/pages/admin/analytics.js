import { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  VStack,
  HStack,
  Select,
  Button,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Text,
  Grid,
  GridItem,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  useToast,
  Flex,
  Skeleton,
  Alert,
  AlertIcon,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from "@chakra-ui/react";
import AdminLayout from "../../components/admin/admin-layout";

export default function AdminAnalytics() {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [timeRange, setTimeRange] = useState("30days");
  const [activityPage, setActivityPage] = useState(1);
  const activityLimit = 10;
  const hasMountedActivityPagination = useRef(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isActivityLoading, setIsActivityLoading] = useState(false);
  const [error, setError] = useState("");
  const toast = useToast();

  const bgColor = "gray.800";
  const borderColor = "gray.700";
  const chartBg = "gray.700";
  const performerBg = "gray.700";
  const performerBorderColor = "gray.600";
  const performerHoverBg = "gray.600";
  const redBg = "red.900";
  const orangeBg = "orange.900";
  const yellowBg = "yellow.900";
  const greenBg = "green.900";
  const purpleBg = "purple.900";

  const fetchAnalytics = useCallback(async ({ page = 1, background = false } = {}) => {
    try {
      if (background) {
        setIsActivityLoading(true);
      } else {
        setIsLoading(true);
      }
      setError("");

      const response = await fetch(
        `/api/admin/analytics?timeRange=${timeRange}&activityPage=${page}&activityLimit=${activityLimit}`,
        {
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data);
      } else {
        setError("Failed to fetch analytics data");
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
      setError("Failed to fetch analytics data");
    } finally {
      if (background) {
        setIsActivityLoading(false);
      } else {
        setIsLoading(false);
      }
    }
  }, [timeRange]);

  useEffect(() => {
    setActivityPage(1);
    fetchAnalytics({ page: 1, background: false });
  }, [timeRange, fetchAnalytics]);

  useEffect(() => {
    if (!hasMountedActivityPagination.current) {
      hasMountedActivityPagination.current = true;
      return;
    }

    fetchAnalytics({ page: activityPage, background: true });
  }, [activityPage, fetchAnalytics]);

  const StatCard = ({
    title,
    value,
    change,
    changeType,
    icon,
    color = "blue",
  }) => (
    <Card
      bg={bgColor}
      border="1px"
      borderColor={borderColor}
      borderRadius="lg"
      shadow="sm"
      _hover={{
        shadow: "md",
        transform: "translateY(-2px)",
        transition: "all 0.2s ease-in-out",
      }}
    >
      <CardBody p={{ base: 4, md: 6 }}>
        <Stat>
          <StatLabel fontSize={{ base: "sm", md: "md" }} color="gray.400">
            {title}
          </StatLabel>
          <StatNumber fontSize={{ base: "xl", md: "2xl" }} color="gray.100">
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
      </CardBody>
    </Card>
  );

  if (isLoading) {
    return (
      <AdminLayout title="Analytics">
        <VStack align="stretch" spacing={5}>
          <Skeleton h="108px" borderRadius="2xl" startColor="gray.700" endColor="gray.600" />
          <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={5}>
            {[1, 2, 3, 4].map((item) => (
              <Skeleton key={item} h="120px" borderRadius="xl" startColor="gray.700" endColor="gray.600" />
            ))}
          </Grid>
          <Skeleton h="420px" borderRadius="2xl" startColor="gray.700" endColor="gray.600" />
        </VStack>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Analytics">
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Analytics Dashboard">
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Flex
          bgGradient="linear(to-r, gray.800, gray.800, blue.900)"
          border="1px solid"
          borderColor="gray.700"
          borderRadius="2xl"
          p={{ base: 5, md: 6 }}
          boxShadow="0 12px 34px rgba(0,0,0,0.28)"
          justify="space-between"
          align={{ base: "flex-start", md: "center" }}
          direction={{ base: "column", md: "row" }}
          gap={{ base: 4, md: 0 }}
        >
          <Box>
            <Heading size={{ base: "md", md: "lg" }} mb={2} color="gray.100">
              Analytics Dashboard
            </Heading>
            <Text color="gray.400" fontSize={{ base: "sm", md: "md" }}>
              Comprehensive analytics and insights
            </Text>
          </Box>
          <HStack spacing={4}>
            <Select
              value={timeRange}
              onChange={(e) => {
                setTimeRange(e.target.value);
                setActivityPage(1);
              }}
              bg={bgColor}
              borderColor={borderColor}
              w={{ base: "150px", md: "200px" }}
              size={{ base: "sm", md: "md" }}
              borderRadius="lg"
            >
              <option value="7days">Last 7 days</option>
              <option value="30days">Last 30 days</option>
              <option value="90days">Last 90 days</option>
              <option value="1year">Last year</option>
            </Select>
            <Button
              onClick={() => fetchAnalytics({ page: activityPage, background: false })}
              size={{ base: "sm", md: "md" }}
              colorScheme="blue"
              variant="outline"
              borderRadius="lg"
            >
              Refresh
            </Button>
          </HStack>
        </Flex>

        {/* Key Metrics */}
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
              value={analyticsData?.overview?.totalUsers || 0}
              change={analyticsData?.overview?.userGrowth || "0%"}
              changeType="increase"
              color="blue"
            />
          </GridItem>

          <GridItem>
            <StatCard
              title="Active Users"
              value={analyticsData?.overview?.activeUsers || 0}
              change={analyticsData?.overview?.activeUserGrowth || "0%"}
              changeType="increase"
              color="green"
            />
          </GridItem>

          <GridItem>
            <StatCard
              title="Total Tests"
              value={analyticsData?.overview?.totalTests || 0}
              change={analyticsData?.overview?.testGrowth || "0%"}
              changeType="increase"
              color="purple"
            />
          </GridItem>

          <GridItem>
            <StatCard
              title="Avg. WPM"
              value={analyticsData?.overview?.averageWPM || 0}
              change={analyticsData?.overview?.wpmGrowth || "0%"}
              changeType="increase"
              color="orange"
            />
          </GridItem>
        </Grid>

        {/* Detailed Analytics Tabs */}
        <Tabs variant="enclosed" colorScheme="blue">
          <TabList
            bg={bgColor}
            borderRadius="lg"
            border="1px"
            borderColor={borderColor}
            p={1}
          >
            <Tab
              fontSize={{ base: "sm", md: "md" }}
              _selected={{
                bg: "blue.500",
                color: "white",
                borderRadius: "md",
              }}
            >
              Performance
            </Tab>
            <Tab
              fontSize={{ base: "sm", md: "md" }}
              _selected={{
                bg: "blue.500",
                color: "white",
                borderRadius: "md",
              }}
            >
              User Activity
            </Tab>
            <Tab
              fontSize={{ base: "sm", md: "md" }}
              _selected={{
                bg: "blue.500",
                color: "white",
                borderRadius: "md",
              }}
            >
              Content Usage
            </Tab>
            <Tab
              fontSize={{ base: "sm", md: "md" }}
              _selected={{
                bg: "blue.500",
                color: "white",
                borderRadius: "md",
              }}
            >
              System Health
            </Tab>
          </TabList>

          <TabPanels>
            {/* Performance Tab */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
                  <Card
                    bg={bgColor}
                    border="1px"
                    borderColor={borderColor}
                    borderRadius="lg"
                    shadow="sm"
                  >
                    <CardHeader pb={{ base: 2, md: 4 }}>
                      <Heading size={{ base: "sm", md: "md" }}>
                        Typing Performance Trends
                      </Heading>
                    </CardHeader>
                    <CardBody pt={0}>
                      <Box
                        h={{ base: "200px", md: "300px" }}
                        bg={chartBg}
                        rounded="lg"
                        p={{ base: 3, md: 4 }}
                      >
                        <Text
                          color="gray.500"
                          textAlign="center"
                          mt={{ base: "50px", md: "100px" }}
                          fontSize={{ base: "sm", md: "md" }}
                        >
                          Performance chart will be implemented here
                        </Text>
                        <Text
                          color="gray.400"
                          textAlign="center"
                          fontSize={{ base: "xs", md: "sm" }}
                        >
                          (WPM trends, accuracy improvements, etc.)
                        </Text>
                      </Box>
                    </CardBody>
                  </Card>

                  <Card
                    bg={bgColor}
                    border="1px"
                    borderColor={borderColor}
                    borderRadius="lg"
                    shadow="sm"
                  >
                    <CardHeader pb={{ base: 2, md: 4 }}>
                      <Heading size={{ base: "sm", md: "md" }}>
                        Top Performers
                      </Heading>
                    </CardHeader>
                    <CardBody pt={0}>
                      <VStack spacing={{ base: 2, md: 3 }} align="stretch">
                        {(analyticsData?.topPerformers || []).length > 0 ? (
                          analyticsData.topPerformers.map((user, index) => (
                            <HStack
                              key={index}
                              justify="space-between"
                              p={{ base: 3, md: 4 }}
                              bg={chartBg}
                              rounded="lg"
                              border="1px"
                              borderColor={performerBorderColor}
                              _hover={{
                                bg: performerHoverBg,
                                transform: "translateY(-1px)",
                                transition: "all 0.2s ease-in-out",
                              }}
                            >
                              <VStack align="flex-start" spacing={0}>
                                <Text
                                  fontWeight="medium"
                                  fontSize={{ base: "sm", md: "md" }}
                                  color="gray.100"
                                >
                                  {user.username}
                                </Text>
                                <Text
                                  fontSize={{ base: "xs", md: "sm" }}
                                  color="gray.400"
                                >
                                  {user.totalTests} tests
                                </Text>
                              </VStack>
                              <VStack align="flex-end" spacing={0}>
                                <Text
                                  fontWeight="bold"
                                  color="blue.400"
                                  fontSize={{ base: "sm", md: "md" }}
                                >
                                  {user.bestWPM} WPM
                                </Text>
                                <Text
                                  fontSize={{ base: "xs", md: "sm" }}
                                  color="green.400"
                                >
                                  {user.bestAccuracy}% accuracy
                                </Text>
                              </VStack>
                            </HStack>
                          ))
                        ) : (
                          <Text color="gray.500" textAlign="center" py={4}>
                            No performance data available
                          </Text>
                        )}
                      </VStack>
                    </CardBody>
                  </Card>
                </Grid>

                <Card
                  bg={bgColor}
                  border="1px"
                  borderColor={borderColor}
                  borderRadius="lg"
                  shadow="sm"
                >
                  <CardHeader pb={{ base: 2, md: 4 }}>
                    <Heading size={{ base: "sm", md: "md" }}>
                      Performance Distribution
                    </Heading>
                  </CardHeader>
                  <CardBody pt={0}>
                    <Grid
                      templateColumns={{
                        base: "repeat(2, 1fr)",
                        md: "repeat(5, 1fr)",
                      }}
                      gap={{ base: 3, md: 4 }}
                    >
                      <Box
                        textAlign="center"
                        p={{ base: 2, md: 3 }}
                        bg={redBg}
                        borderRadius="lg"
                      >
                        <Text
                          fontSize={{ base: "xl", md: "2xl" }}
                          fontWeight="bold"
                          color="red.500"
                        >
                          {analyticsData?.performanceDistribution?.beginner ||
                            0}
                        </Text>
                        <Text
                          fontSize={{ base: "xs", md: "sm" }}
                          color="gray.600"
                        >
                          Beginner (0-30 WPM)
                        </Text>
                      </Box>
                      <Box
                        textAlign="center"
                        p={{ base: 2, md: 3 }}
                        bg={orangeBg}
                        borderRadius="lg"
                      >
                        <Text
                          fontSize={{ base: "xl", md: "2xl" }}
                          fontWeight="bold"
                          color="orange.500"
                        >
                          {analyticsData?.performanceDistribution
                            ?.intermediate || 0}
                        </Text>
                        <Text
                          fontSize={{ base: "xs", md: "sm" }}
                          color="gray.600"
                        >
                          Intermediate (31-50 WPM)
                        </Text>
                      </Box>
                      <Box
                        textAlign="center"
                        p={{ base: 2, md: 3 }}
                        bg={yellowBg}
                        borderRadius="lg"
                      >
                        <Text
                          fontSize={{ base: "xl", md: "2xl" }}
                          fontWeight="bold"
                          color="yellow.500"
                        >
                          {analyticsData?.performanceDistribution?.advanced ||
                            0}
                        </Text>
                        <Text
                          fontSize={{ base: "xs", md: "sm" }}
                          color="gray.600"
                        >
                          Advanced (51-70 WPM)
                        </Text>
                      </Box>
                      <Box
                        textAlign="center"
                        p={{ base: 2, md: 3 }}
                        bg={greenBg}
                        borderRadius="lg"
                      >
                        <Text
                          fontSize={{ base: "xl", md: "2xl" }}
                          fontWeight="bold"
                          color="green.500"
                        >
                          {analyticsData?.performanceDistribution?.expert || 0}
                        </Text>
                        <Text
                          fontSize={{ base: "xs", md: "sm" }}
                          color="gray.600"
                        >
                          Expert (71-90 WPM)
                        </Text>
                      </Box>
                      <Box
                        textAlign="center"
                        p={{ base: 2, md: 3 }}
                        bg={purpleBg}
                        borderRadius="lg"
                      >
                        <Text
                          fontSize={{ base: "xl", md: "2xl" }}
                          fontWeight="bold"
                          color="purple.500"
                        >
                          {analyticsData?.performanceDistribution?.master || 0}
                        </Text>
                        <Text
                          fontSize={{ base: "xs", md: "sm" }}
                          color="gray.600"
                        >
                          Master (90+ WPM)
                        </Text>
                      </Box>
                    </Grid>
                  </CardBody>
                </Card>
              </VStack>
            </TabPanel>

            {/* User Activity Tab */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
                  <Card bg={bgColor} border="1px" borderColor={borderColor}>
                    <CardHeader>
                      <Heading size="md">User Registration Trends</Heading>
                    </CardHeader>
                    <CardBody>
                      <Box h="300px" bg="gray.700" rounded="xl" p={4} border="1px solid" borderColor="gray.600">
                        <Text color="gray.500" textAlign="center" mt="100px">
                          Registration chart will be implemented here
                        </Text>
                        <Text color="gray.400" textAlign="center" fontSize="sm">
                          (Daily/weekly registration trends)
                        </Text>
                      </Box>
                    </CardBody>
                  </Card>

                  <Card bg={bgColor} border="1px" borderColor={borderColor}>
                    <CardHeader>
                      <Heading size="md">Activity Patterns</Heading>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={4} align="stretch">
                        <HStack justify="space-between">
                          <Text color="gray.300">Peak Usage Hours:</Text>
                          <Badge colorScheme="blue">
                            {analyticsData?.activityPatterns?.peakHours ||
                              "2-4 PM"}
                          </Badge>
                        </HStack>
                        <HStack justify="space-between">
                          <Text color="gray.300">Most Active Day:</Text>
                          <Badge colorScheme="green">
                            {analyticsData?.activityPatterns?.mostActiveDay ||
                              "Tuesday"}
                          </Badge>
                        </HStack>
                        <HStack justify="space-between">
                          <Text color="gray.300">Avg. Session Duration:</Text>
                          <Badge colorScheme="purple">
                            {analyticsData?.activityPatterns
                              ?.avgSessionDuration || "15 min"}
                          </Badge>
                        </HStack>
                      </VStack>
                    </CardBody>
                  </Card>
                </Grid>

                <Card bg={bgColor} border="1px" borderColor={borderColor}>
                  <CardHeader>
                    <Heading size="md">Recent User Activity</Heading>
                  </CardHeader>
                  <CardBody>
                    <Table variant="simple">
                      <Thead bg="gray.700">
                        <Tr>
                          <Th color="gray.400">User</Th>
                          <Th color="gray.400">Activity</Th>
                          <Th color="gray.400">Time</Th>
                          <Th color="gray.400">Details</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {analyticsData?.recentActivity?.map(
                          (activity, index) => (
                            <Tr key={index} _hover={{ bg: "whiteAlpha.50" }}>
                              <Td color="gray.200">{activity.username}</Td>
                              <Td>
                                <Badge
                                  colorScheme={
                                    activity.type === "test" ? "blue" : "green"
                                  }
                                >
                                  {activity.type}
                                </Badge>
                              </Td>
                              <Td color="gray.400">{activity.timestamp}</Td>
                              <Td color="gray.300">{activity.details}</Td>
                            </Tr>
                          )
                        ) || (
                          <Tr>
                            <Td colSpan={4} textAlign="center" py={4}>
                              No recent activity
                            </Td>
                          </Tr>
                        )}
                      </Tbody>
                    </Table>

                    <Flex
                      mt={4}
                      align="center"
                      justify="space-between"
                      pt={3}
                      borderTop="1px solid"
                      borderColor="gray.700"
                    >
                      <Text fontSize="sm" color="gray.400">
                        Page {analyticsData?.recentActivityPagination?.page || 1} of{" "}
                        {analyticsData?.recentActivityPagination?.totalPages || 1}
                      </Text>
                      <HStack spacing={2}>
                        {isActivityLoading && (
                          <Text fontSize="xs" color="gray.500" mr={2}>
                            Updating...
                          </Text>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          borderColor="gray.600"
                          color="gray.300"
                          _hover={{ bg: "gray.700" }}
                          isLoading={isActivityLoading}
                          isDisabled={(analyticsData?.recentActivityPagination?.page || 1) <= 1}
                          onClick={() =>
                            setActivityPage((prev) => Math.max(1, prev - 1))
                          }
                        >
                          Previous
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          borderColor="gray.600"
                          color="gray.300"
                          _hover={{ bg: "gray.700" }}
                          isLoading={isActivityLoading}
                          isDisabled={
                            (analyticsData?.recentActivityPagination?.page || 1) >=
                            (analyticsData?.recentActivityPagination?.totalPages || 1)
                          }
                          onClick={() =>
                            setActivityPage((prev) => prev + 1)
                          }
                        >
                          Next
                        </Button>
                      </HStack>
                    </Flex>
                  </CardBody>
                </Card>
              </VStack>
            </TabPanel>

            {/* Content Usage Tab */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
                  <Card bg={bgColor} border="1px" borderColor={borderColor}>
                    <CardHeader>
                      <Heading size="md">Most Popular Content</Heading>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={3} align="stretch">
                        {(analyticsData?.popularContent || []).length > 0 ? (
                          analyticsData.popularContent.map((content, index) => (
                            <HStack
                              key={index}
                              justify="space-between"
                              p={2}
                              bg="gray.700"
                              rounded="xl"
                              border="1px solid"
                              borderColor="gray.600"
                            >
                              <VStack align="flex-start" spacing={0}>
                                <Text fontWeight="medium" color="gray.100">{content.title}</Text>
                                <Text fontSize="sm" color="gray.500">
                                  {content.type}
                                </Text>
                              </VStack>
                              <VStack align="flex-end" spacing={0}>
                                <Text fontWeight="bold" color="blue.500">
                                  {content.usageCount} uses
                                </Text>
                                <Text fontSize="sm" color="gray.500">
                                  {content.avgWPM} avg WPM
                                </Text>
                              </VStack>
                            </HStack>
                          ))
                        ) : (
                          <Text color="gray.500" textAlign="center" py={4}>
                            No content usage data available
                          </Text>
                        )}
                      </VStack>
                    </CardBody>
                  </Card>

                  <Card bg={bgColor} border="1px" borderColor={borderColor}>
                    <CardHeader>
                      <Heading size="md">Training Module Usage</Heading>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={3} align="stretch">
                        {(analyticsData?.moduleUsage || []).length > 0 ? (
                          analyticsData.moduleUsage.map((module, index) => (
                            <HStack
                              key={index}
                              justify="space-between"
                              p={2}
                              bg="gray.700"
                              rounded="xl"
                              border="1px solid"
                              borderColor="gray.600"
                            >
                              <VStack align="flex-start" spacing={0}>
                                <Text fontWeight="medium" color="gray.100">{module.title}</Text>
                                <Text fontSize="sm" color="gray.500">
                                  {module.category}
                                </Text>
                              </VStack>
                              <VStack align="flex-end" spacing={0}>
                                <Text fontWeight="bold" color="green.500">
                                  {module.completionRate}% completion
                                </Text>
                                <Text fontSize="sm" color="gray.500">
                                  {module.totalUsers} users
                                </Text>
                              </VStack>
                            </HStack>
                          ))
                        ) : (
                          <Text color="gray.500" textAlign="center" py={4}>
                            No module usage data available
                          </Text>
                        )}
                      </VStack>
                    </CardBody>
                  </Card>
                </Grid>
              </VStack>
            </TabPanel>

            {/* System Health Tab */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <Grid
                  templateColumns={{
                    base: "1fr",
                    md: "repeat(2, 1fr)",
                    lg: "repeat(3, 1fr)",
                  }}
                  gap={6}
                >
                  <Card bg={bgColor} border="1px" borderColor={borderColor}>
                    <CardBody>
                      <Stat>
                        <StatLabel>System Uptime</StatLabel>
                        <StatNumber color="green.500">99.9%</StatNumber>
                        <StatHelpText>
                          <StatArrow type="increase" />
                          0.1% improvement
                        </StatHelpText>
                      </Stat>
                    </CardBody>
                  </Card>

                  <Card bg={bgColor} border="1px" borderColor={borderColor}>
                    <CardBody>
                      <Stat>
                        <StatLabel>Avg Response Time</StatLabel>
                        <StatNumber color="blue.500">120ms</StatNumber>
                        <StatHelpText>
                          <StatArrow type="decrease" />
                          15ms faster
                        </StatHelpText>
                      </Stat>
                    </CardBody>
                  </Card>

                  <Card bg={bgColor} border="1px" borderColor={borderColor}>
                    <CardBody>
                      <Stat>
                        <StatLabel>Error Rate</StatLabel>
                        <StatNumber color="red.500">0.02%</StatNumber>
                        <StatHelpText>
                          <StatArrow type="decrease" />
                          0.01% improvement
                        </StatHelpText>
                      </Stat>
                    </CardBody>
                  </Card>
                </Grid>

                <Card bg={bgColor} border="1px" borderColor={borderColor}>
                  <CardHeader>
                    <Heading size="md">Database Performance</Heading>
                  </CardHeader>
                  <CardBody>
                    <Grid templateColumns="repeat(4, 1fr)" gap={4}>
                      <Box textAlign="center">
                        <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                          {analyticsData?.dbStats?.totalRecords || "0"}
                        </Text>
                        <Text fontSize="sm" color="gray.400">
                          Total Records
                        </Text>
                      </Box>
                      <Box textAlign="center">
                        <Text
                          fontSize="2xl"
                          fontWeight="bold"
                          color="green.500"
                        >
                          {analyticsData?.dbStats?.avgQueryTime || "5ms"}
                        </Text>
                        <Text fontSize="sm" color="gray.400">
                          Avg Query Time
                        </Text>
                      </Box>
                      <Box textAlign="center">
                        <Text
                          fontSize="2xl"
                          fontWeight="bold"
                          color="orange.500"
                        >
                          {analyticsData?.dbStats?.storageUsed || "2.1GB"}
                        </Text>
                        <Text fontSize="sm" color="gray.400">
                          Storage Used
                        </Text>
                      </Box>
                      <Box textAlign="center">
                        <Text
                          fontSize="2xl"
                          fontWeight="bold"
                          color="purple.500"
                        >
                          {analyticsData?.dbStats?.connections || "12"}
                        </Text>
                        <Text fontSize="sm" color="gray.400">
                          Active Connections
                        </Text>
                      </Box>
                    </Grid>
                  </CardBody>
                </Card>
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>
    </AdminLayout>
  );
}
