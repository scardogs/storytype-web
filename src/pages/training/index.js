import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Badge,
  Box,
  Flex,
  Grid,
  Heading,
  HStack,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  SimpleGrid,
  Spinner,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";
import {
  FaBookOpen,
  FaFilter,
  FaGraduationCap,
  FaSearch,
  FaStar,
  FaTarget,
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/navbar";
import TrainingModuleCard from "../../components/training-module-card";
import TrainingProgressTracker from "../../components/training-progress-tracker";

export default function TrainingPage() {
  const { user } = useAuth();
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: "",
    difficulty: "",
    search: "",
  });

  const pageBg = useColorModeValue("gray.950", "gray.950");
  const panelBg = useColorModeValue("gray.900", "gray.900");
  const borderColor = useColorModeValue("whiteAlpha.140", "whiteAlpha.140");
  const softBorder = useColorModeValue("whiteAlpha.100", "whiteAlpha.100");
  const headingColor = useColorModeValue("white", "white");
  const bodyColor = useColorModeValue("gray.300", "gray.300");
  const mutedColor = useColorModeValue("gray.400", "gray.400");

  useEffect(() => {
    fetchModules();
  }, [filters]);

  const fetchModules = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filters.category) params.append("category", filters.category);
      if (filters.difficulty) params.append("difficulty", filters.difficulty);

      const response = await fetch(`/api/training/modules?${params}`);
      const data = await response.json();

      if (data.success) {
        let filteredModules = data.modules;

        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          filteredModules = filteredModules.filter(
            (module) =>
              module.title.toLowerCase().includes(searchLower) ||
              module.description.toLowerCase().includes(searchLower) ||
              module.tags.some((tag) => tag.toLowerCase().includes(searchLower))
          );
        }

        setModules(filteredModules);
      }
    } catch (error) {
      console.error("Error fetching modules:", error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const categories = [
    { value: "", label: "All Categories" },
    { value: "beginner", label: "Beginner" },
    { value: "advanced", label: "Advanced" },
    { value: "specialized", label: "Specialized" },
    { value: "daily", label: "Daily Lessons" },
  ];

  const difficulties = [
    { value: "", label: "All Levels" },
    { value: "easy", label: "Easy" },
    { value: "medium", label: "Medium" },
    { value: "hard", label: "Hard" },
    { value: "expert", label: "Expert" },
  ];

  const moduleStats = useMemo(() => {
    const totalLessons = modules.reduce(
      (sum, module) => sum + (module.totalLessons || 0),
      0
    );

    return {
      totalModules: modules.length,
      totalLessons,
      beginnerTracks: modules.filter((module) => module.category === "beginner")
        .length,
      advancedTracks: modules.filter((module) => module.category !== "beginner")
        .length,
    };
  }, [modules]);

  return (
    <>
      <Navbar />
      <Box minH="100vh" bg={pageBg} px={{ base: 3, md: 6 }} py={{ base: 6, md: 10 }}>
        <VStack spacing={6} maxW="1400px" mx="auto" align="stretch">
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
              top="-120px"
              right="-80px"
              w={{ base: "220px", md: "360px" }}
              h={{ base: "220px", md: "360px" }}
              bgGradient="radial(teal.500, transparent 70%)"
              opacity={0.12}
              filter="blur(40px)"
            />
            <Grid templateColumns={{ base: "1fr", xl: "1.3fr 0.9fr" }} gap={6}>
              <VStack align="start" spacing={4}>
                <HStack spacing={2} px={3} py={1.5} borderRadius="full" bg="whiteAlpha.060" border="1px solid" borderColor={softBorder}>
                  <Icon as={FaGraduationCap} color="teal.300" />
                  <Text color={mutedColor} fontSize="sm">
                    Skill-based training system
                  </Text>
                </HStack>

                <Heading
                  color={headingColor}
                  fontSize={{ base: "3xl", md: "5xl" }}
                  lineHeight="1"
                  letterSpacing="-0.04em"
                >
                  Structured typing practice with a real sense of progression.
                </Heading>

                <Text color={bodyColor} fontSize={{ base: "md", md: "lg" }} maxW="720px" lineHeight="1.8">
                  Build fundamentals, sharpen weak spots, and move through
                  modules that feel more like a crafted curriculum than a pile
                  of random drills.
                </Text>

                <HStack spacing={3} flexWrap="wrap">
                  <Badge colorScheme="teal" variant="subtle" px={3} py={1} borderRadius="full">
                    {moduleStats.totalModules} modules
                  </Badge>
                  <Badge colorScheme="blue" variant="subtle" px={3} py={1} borderRadius="full">
                    {moduleStats.totalLessons} lessons
                  </Badge>
                  <Badge colorScheme="orange" variant="subtle" px={3} py={1} borderRadius="full">
                    {moduleStats.beginnerTracks} beginner tracks
                  </Badge>
                </HStack>
              </VStack>

              <SimpleGrid columns={2} spacing={3} alignSelf="stretch">
                <Box bg="whiteAlpha.050" border="1px solid" borderColor={softBorder} borderRadius="2xl" p={4}>
                  <Icon as={FaBookOpen} color="teal.300" boxSize={5} mb={3} />
                  <Text color={mutedColor} fontSize="xs" textTransform="uppercase" letterSpacing="0.08em">
                    Modules
                  </Text>
                  <Text color={headingColor} fontSize="3xl" fontWeight="bold">
                    {moduleStats.totalModules}
                  </Text>
                  <Text color={mutedColor} fontSize="sm">
                    Curated learning tracks
                  </Text>
                </Box>
                <Box bg="whiteAlpha.050" border="1px solid" borderColor={softBorder} borderRadius="2xl" p={4}>
                  <Icon as={FaTarget} color="blue.300" boxSize={5} mb={3} />
                  <Text color={mutedColor} fontSize="xs" textTransform="uppercase" letterSpacing="0.08em">
                    Lessons
                  </Text>
                  <Text color={headingColor} fontSize="3xl" fontWeight="bold">
                    {moduleStats.totalLessons}
                  </Text>
                  <Text color={mutedColor} fontSize="sm">
                    Practice, drills, and assessments
                  </Text>
                </Box>
                <Box bg="whiteAlpha.050" border="1px solid" borderColor={softBorder} borderRadius="2xl" p={4}>
                  <Icon as={FaGraduationCap} color="green.300" boxSize={5} mb={3} />
                  <Text color={mutedColor} fontSize="xs" textTransform="uppercase" letterSpacing="0.08em">
                    Beginner
                  </Text>
                  <Text color={headingColor} fontSize="3xl" fontWeight="bold">
                    {moduleStats.beginnerTracks}
                  </Text>
                  <Text color={mutedColor} fontSize="sm">
                    Foundation-focused modules
                  </Text>
                </Box>
                <Box bg="whiteAlpha.050" border="1px solid" borderColor={softBorder} borderRadius="2xl" p={4}>
                  <Icon as={FaStar} color="orange.300" boxSize={5} mb={3} />
                  <Text color={mutedColor} fontSize="xs" textTransform="uppercase" letterSpacing="0.08em">
                    Advanced
                  </Text>
                  <Text color={headingColor} fontSize="3xl" fontWeight="bold">
                    {moduleStats.advancedTracks}
                  </Text>
                  <Text color={mutedColor} fontSize="sm">
                    Precision and specialization
                  </Text>
                </Box>
              </SimpleGrid>
            </Grid>
          </Box>

          <Tabs variant="unstyled" w="full">
            <TabList
              bg={panelBg}
              border="1px solid"
              borderColor={borderColor}
              borderRadius="2xl"
              p={2}
              gap={2}
              flexWrap="wrap"
            >
              <Tab
                borderRadius="xl"
                color={mutedColor}
                fontWeight="semibold"
                px={5}
                py={3}
                _selected={{
                  bg: "teal.500",
                  color: "white",
                  boxShadow: "0 12px 24px rgba(20,184,166,0.22)",
                }}
              >
                Training Modules
              </Tab>
              {user && (
                <Tab
                  borderRadius="xl"
                  color={mutedColor}
                  fontWeight="semibold"
                  px={5}
                  py={3}
                  _selected={{
                    bg: "teal.500",
                    color: "white",
                    boxShadow: "0 12px 24px rgba(20,184,166,0.22)",
                  }}
                >
                  My Progress
                </Tab>
              )}
            </TabList>

            <TabPanels>
              <TabPanel px={0} pt={6}>
                <VStack spacing={6} align="stretch">
                  <Box
                    bg={panelBg}
                    borderRadius="2xl"
                    p={{ base: 4, md: 5 }}
                    border="1px solid"
                    borderColor={borderColor}
                  >
                    <VStack spacing={4} align="stretch">
                      <HStack spacing={2} color={mutedColor}>
                        <Icon as={FaFilter} />
                        <Text fontWeight="medium">Refine your training path</Text>
                      </HStack>

                      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} w="full">
                        <InputGroup>
                          <InputLeftElement pointerEvents="none">
                            <Icon as={FaSearch} color="gray.500" />
                          </InputLeftElement>
                          <Input
                            placeholder="Search modules..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange("search", e.target.value)}
                            bg="gray.800"
                            borderColor={softBorder}
                            color={bodyColor}
                            _focus={{
                              borderColor: "teal.400",
                              boxShadow: "0 0 0 1px #2DD4BF",
                            }}
                          />
                        </InputGroup>

                        <Select
                          value={filters.category}
                          onChange={(e) => handleFilterChange("category", e.target.value)}
                          bg="gray.800"
                          borderColor={softBorder}
                          color={bodyColor}
                        >
                          {categories.map((category) => (
                            <option key={category.value} value={category.value}>
                              {category.label}
                            </option>
                          ))}
                        </Select>

                        <Select
                          value={filters.difficulty}
                          onChange={(e) => handleFilterChange("difficulty", e.target.value)}
                          bg="gray.800"
                          borderColor={softBorder}
                          color={bodyColor}
                        >
                          {difficulties.map((difficulty) => (
                            <option key={difficulty.value} value={difficulty.value}>
                              {difficulty.label}
                            </option>
                          ))}
                        </Select>
                      </SimpleGrid>
                    </VStack>
                  </Box>

                  {loading ? (
                    <Flex justify="center" align="center" minH="400px">
                      <Spinner size="xl" color="teal.300" />
                    </Flex>
                  ) : (
                    <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={{ base: 4, md: 6 }}>
                      {modules.map((module) => (
                        <TrainingModuleCard
                          key={module._id}
                          module={module}
                          userProgress={module.progress}
                        />
                      ))}
                    </SimpleGrid>
                  )}

                  {!loading && modules.length === 0 && (
                    <Box
                      bg={panelBg}
                      borderRadius="2xl"
                      p={{ base: 8, md: 10 }}
                      textAlign="center"
                      border="1px solid"
                      borderColor={borderColor}
                    >
                      <Icon as={FaGraduationCap} boxSize={12} color="gray.500" mb={4} />
                      <Heading size="md" mb={2} color={headingColor}>
                        No modules found
                      </Heading>
                      <Text color={mutedColor}>
                        Try changing your filters or search term to explore a
                        different set of lessons.
                      </Text>
                    </Box>
                  )}
                </VStack>
              </TabPanel>

              {user && (
                <TabPanel px={0} pt={6}>
                  <TrainingProgressTracker />
                </TabPanel>
              )}
            </TabPanels>
          </Tabs>
        </VStack>
      </Box>
    </>
  );
}
