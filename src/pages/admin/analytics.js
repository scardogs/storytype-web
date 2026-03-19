import { useState, useEffect, useCallback } from "react";
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
  Spinner,
  Alert,
  AlertIcon,
  useColorModeValue,
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const toast = useToast();

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const chartBg = useColorModeValue("gray.50", "gray.700");
  const performerBg = useColorModeValue("gray.50", "gray.700");
  const performerBorderColor = useColorModeValue("gray.200", "gray.600");
  const performerHoverBg = useColorModeValue("gray.100", "gray.600");
  const redBg = useColorModeValue("red.50", "red.900");
  const orangeBg = useColorModeValue("orange.50", "orange.900");
  const yellowBg = useColorModeValue("yellow.50", "yellow.900");
  const greenBg = useColorModeValue("green.50", "green.900");
  const purpleBg = useColorModeValue("purple.50", "purple.900");

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const fetchAnalytics = useCallback(async () => {
    try {
      setIsLoading(true);

      const response = await fetch(
        `/api/admin/analytics?timeRange=${timeRange}`,
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
      setIsLoading(false);
    }
  }, [timeRange]);

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
          <StatLabel fontSize={{ base: "sm", md: "md" }} color="gray.600">
            {title}
          </StatLabel>
          <StatNumber fontSize={{ base: "xl", md: "2xl" }} color="gray.800">
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
        <Flex align="center" justify="center" h="400px">
          <Spinner size="xl" />
        </Flex>
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
          justify="space-between"
          align={{ base: "flex-start", md: "center" }}
          direction={{ base: "column", md: "row" }}
          gap={{ base: 4, md: 0 }}
        >
          <Box>
            <Heading size={{ base: "md", md: "lg" }} mb={2}>
              Analytics Dashboard
            </Heading>
            <Text color="gray.600" fontSize={{ base: "sm", md: "md" }}>
              Comprehensive analytics and insights
            </Text>
          </Box>
          <HStack spacing={4}>
            <Select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
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
              onClick={fetchAnalytics}
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
                        {analyticsData?.topPerformers?.map((user, index) => (
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
                                color="gray.800"
                              >
                                {user.username}
                              </Text>
                              <Text
                                fontSize={{ base: "xs", md: "sm" }}
                                color="gray.500"
                              >
                                {user.totalTests} tests
                              </Text>
                            </VStack>
                            <VStack align="flex-end" spacing={0}>
                              <Text
                                fontWeight="bold"
                                color="blue.500"
                                fontSize={{ base: "sm", md: "md" }}
                              >
                                {user.bestWPM} WPM
                              </Text>
                              <Text
                                fontSize={{ base: "xs", md: "sm" }}
                                color="green.500"
                              >
                                {user.bestAccuracy}% accuracy
                              </Text>
                            </VStack>
                          </HStack>
                        )) || (
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
                      <Box h="300px" bg="gray.50" rounded="md" p={4}>
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
                          <Text>Peak Usage Hours:</Text>
                          <Badge colorScheme="blue">
                            {analyticsData?.activityPatterns?.peakHours ||
                              "2-4 PM"}
                          </Badge>
                        </HStack>
                        <HStack justify="space-between">
                          <Text>Most Active Day:</Text>
                          <Badge colorScheme="green">
                            {analyticsData?.activityPatterns?.mostActiveDay ||
                              "Tuesday"}
                          </Badge>
                        </HStack>
                        <HStack justify="space-between">
                          <Text>Avg. Session Duration:</Text>
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
                      <Thead>
                        <Tr>
                          <Th>User</Th>
                          <Th>Activity</Th>
                          <Th>Time</Th>
                          <Th>Details</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {analyticsData?.recentActivity?.map(
                          (activity, index) => (
                            <Tr key={index}>
                              <Td>{activity.username}</Td>
                              <Td>
                                <Badge
                                  colorScheme={
                                    activity.type === "test" ? "blue" : "green"
                                  }
                                >
                                  {activity.type}
                                </Badge>
                              </Td>
                              <Td>{activity.timestamp}</Td>
                              <Td>{activity.details}</Td>
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
                        {analyticsData?.popularContent?.map(
                          (content, index) => (
                            <HStack
                              key={index}
                              justify="space-between"
                              p={2}
                              bg="gray.50"
                              rounded="md"
                            >
                              <VStack align="flex-start" spacing={0}>
                                <Text fontWeight="medium">{content.title}</Text>
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
                          )
                        ) || (
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
                        {analyticsData?.moduleUsage?.map((module, index) => (
                          <HStack
                            key={index}
                            justify="space-between"
                            p={2}
                            bg="gray.50"
                            rounded="md"
                          >
                            <VStack align="flex-start" spacing={0}>
                              <Text fontWeight="medium">{module.title}</Text>
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
                        )) || (
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
                        <Text fontSize="sm" color="gray.600">
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
                        <Text fontSize="sm" color="gray.600">
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
                        <Text fontSize="sm" color="gray.600">
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
                        <Text fontSize="sm" color="gray.600">
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
