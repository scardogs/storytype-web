import React, { useState, useEffect } from 'react';
import Navbar from './navbar';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatGroup,
  Select,
  Spinner,
  useColorModeValue,
  SimpleGrid,
  Badge,
  Flex,
  Icon,
  Divider,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
} from '@chakra-ui/react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { FaTrophy, FaChartLine, FaFire, FaBullseye } from 'react-icons/fa';

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

export default function AnalyticsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30');
  const [selectedGenre, setSelectedGenre] = useState('all');

  const cardBg = useColorModeValue('gray.50', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const bgColor = useColorModeValue('gray.100', 'gray.900');
  const chartTextColor = useColorModeValue('#2D3748', '#E2E8F0');
  const chartGridColor = useColorModeValue('rgba(0, 0, 0, 0.05)', 'rgba(255, 255, 255, 0.05)');
  const chartTickColor = useColorModeValue('#718096', '#A0AEC0');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/profile');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
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

      if (recordsData.success) {
        setRecords(recordsData.records.reverse()); // Oldest first for chart
      }
      if (statsData.success) {
        setStats(statsData);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user) {
    return (
      <>
        <Navbar />
        <Flex minH="100vh" align="center" justify="center" bg={bgColor}>
          <Spinner size="xl" color="teal.400" />
        </Flex>
      </>
    );
  }

  const chartData = {
    labels: records.map((r, i) => {
      const date = new Date(r.timestamp);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }),
    datasets: [
      {
        label: 'WPM',
        data: records.map(r => r.wpm),
        borderColor: 'rgb(56, 178, 172)',
        backgroundColor: 'rgba(56, 178, 172, 0.1)',
        fill: true,
        tension: 0.4,
        yAxisID: 'y',
      },
      {
        label: 'Accuracy %',
        data: records.map(r => r.accuracy),
        borderColor: 'rgb(104, 211, 145)',
        backgroundColor: 'rgba(104, 211, 145, 0.1)',
        fill: true,
        tension: 0.4,
        yAxisID: 'y1',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: chartTextColor,
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: true,
        text: 'Performance Over Time',
        color: chartTextColor,
        font: {
          size: 16,
          weight: 'bold',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#38B2AC',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: {
          color: chartGridColor,
        },
        ticks: {
          color: chartTickColor,
          maxRotation: 45,
          minRotation: 45,
        },
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'WPM',
          color: chartTextColor,
        },
        grid: {
          color: chartGridColor,
        },
        ticks: {
          color: chartTickColor,
        },
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Accuracy %',
          color: chartTextColor,
        },
        min: 0,
        max: 100,
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          color: chartTickColor,
        },
      },
    },
  };

  return (
    <>
      <Navbar />
      <Box minH="100vh" bg={bgColor} px={4} py={8}>
        <VStack spacing={6} maxW="1400px" mx="auto">
          {/* Header */}
          <Flex justify="space-between" align="center" w="full">
            <Heading size="xl" color="teal.300">
              <Icon as={FaChartLine} mr={2} />
              Analytics
            </Heading>
            <HStack spacing={4}>
              <Select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                w="150px"
                bg={cardBg}
              >
                <option value="all">All Genres</option>
                <option value="Fantasy">Fantasy</option>
                <option value="Mystery">Mystery</option>
                <option value="Sci-Fi">Sci-Fi</option>
                <option value="Romance">Romance</option>
              </Select>
              <Select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                w="150px"
                bg={cardBg}
              >
                <option value="7">Last 7 Days</option>
                <option value="30">Last 30 Days</option>
                <option value="90">Last 90 Days</option>
                <option value="365">Last Year</option>
              </Select>
            </HStack>
          </Flex>

          {loading ? (
            <Spinner size="xl" color="teal.400" />
          ) : stats && stats.stats.totalTests > 0 ? (
            <>
              {/* Stats Cards */}
              <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4} w="full">
                <Box bg={cardBg} p={6} borderRadius="lg" boxShadow="md" border="1px" borderColor={borderColor}>
                  <Stat>
                    <StatLabel color="gray.400">
                      <Icon as={FaTrophy} color="yellow.400" mr={2} />
                      Highest WPM
                    </StatLabel>
                    <StatNumber fontSize="3xl" color="teal.300">
                      {stats.stats.highestWPM}
                    </StatNumber>
                    <StatHelpText>
                      Avg: {stats.stats.averageWPM} WPM
                    </StatHelpText>
                  </Stat>
                </Box>

                <Box bg={cardBg} p={6} borderRadius="lg" boxShadow="md" border="1px" borderColor={borderColor}>
                  <Stat>
                    <StatLabel color="gray.400">
                      <Icon as={FaBullseye} color="green.400" mr={2} />
                      Avg Accuracy
                    </StatLabel>
                    <StatNumber fontSize="3xl" color="green.300">
                      {stats.stats.averageAccuracy}%
                    </StatNumber>
                    <StatHelpText>
                      Best: {stats.stats.highestWPM > 0 ? '100%' : '0%'}
                    </StatHelpText>
                  </Stat>
                </Box>

                <Box bg={cardBg} p={6} borderRadius="lg" boxShadow="md" border="1px" borderColor={borderColor}>
                  <Stat>
                    <StatLabel color="gray.400">
                      <Icon as={FaFire} color="orange.400" mr={2} />
                      Improvement
                    </StatLabel>
                    <StatNumber fontSize="3xl" color={stats.stats.improvement >= 0 ? 'green.300' : 'red.300'}>
                      {stats.stats.improvement >= 0 ? '+' : ''}{stats.stats.improvement}
                    </StatNumber>
                    <StatHelpText>
                      WPM change
                    </StatHelpText>
                  </Stat>
                </Box>

                <Box bg={cardBg} p={6} borderRadius="lg" boxShadow="md" border="1px" borderColor={borderColor}>
                  <Stat>
                    <StatLabel color="gray.400">Total Tests</StatLabel>
                    <StatNumber fontSize="3xl" color="teal.300">
                      {stats.stats.totalTests}
                    </StatNumber>
                    <StatHelpText>
                      Consistency: {stats.stats.consistency}%
                    </StatHelpText>
                  </Stat>
                </Box>
              </SimpleGrid>

              {/* Main Chart */}
              <Box bg={cardBg} p={6} borderRadius="lg" boxShadow="md" w="full" border="1px" borderColor={borderColor}>
                <Box h="400px">
                  <Line data={chartData} options={chartOptions} />
                </Box>
              </Box>

              {/* Genre Breakdown */}
              {stats.byGenre && Object.keys(stats.byGenre).length > 0 && (
                <Box bg={cardBg} p={6} borderRadius="lg" boxShadow="md" w="full" border="1px" borderColor={borderColor}>
                  <Heading size="md" mb={4} color="teal.300">
                    Performance by Genre
                  </Heading>
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
                    {Object.entries(stats.byGenre).map(([genre, data]) => (
                      <Box key={genre} p={4} bg={bgColor} borderRadius="md">
                        <Text fontWeight="bold" fontSize="lg" color="teal.200">
                          {genre}
                        </Text>
                        <Divider my={2} />
                        <VStack align="start" spacing={1}>
                          <Text fontSize="sm">
                            <Badge colorScheme="teal">{data.count}</Badge> tests
                          </Text>
                          <Text fontSize="sm">
                            Avg WPM: <strong>{data.averageWPM}</strong>
                          </Text>
                          <Text fontSize="sm">
                            Accuracy: <strong>{data.averageAccuracy}%</strong>
                          </Text>
                        </VStack>
                      </Box>
                    ))}
                  </SimpleGrid>
                </Box>
              )}

              {/* Recent Tests Table */}
              {stats.recentTests && stats.recentTests.length > 0 && (
                <Box bg={cardBg} p={6} borderRadius="lg" boxShadow="md" w="full" border="1px" borderColor={borderColor}>
                  <Heading size="md" mb={4} color="teal.300">
                    Recent Tests
                  </Heading>
                  <Box overflowX="auto">
                    <Table variant="simple" size="sm">
                      <Thead>
                        <Tr>
                          <Th>Date</Th>
                          <Th>Genre</Th>
                          <Th isNumeric>WPM</Th>
                          <Th isNumeric>Accuracy</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {stats.recentTests.map((test, i) => (
                          <Tr key={i}>
                            <Td>{new Date(test.timestamp).toLocaleDateString()}</Td>
                            <Td>
                              <Badge colorScheme="teal">{test.genre}</Badge>
                            </Td>
                            <Td isNumeric fontWeight="bold" color="teal.300">
                              {test.wpm}
                            </Td>
                            <Td isNumeric color={test.accuracy >= 95 ? 'green.300' : test.accuracy >= 80 ? 'yellow.300' : 'red.300'}>
                              {test.accuracy}%
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </Box>
                </Box>
              )}
            </>
          ) : (
            <Box bg={cardBg} p={12} borderRadius="lg" boxShadow="md" textAlign="center" w="full">
              <Heading size="lg" color="gray.500" mb={4}>
                No data yet
              </Heading>
              <Text color="gray.400" mb={6}>
                Start typing to see your analytics!
              </Text>
              <Button colorScheme="teal" onClick={() => router.push('/type')}>
                Start Typing
              </Button>
            </Box>
          )}
        </VStack>
      </Box>
    </>
  );
}

