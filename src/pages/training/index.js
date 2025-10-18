import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Select,
  SimpleGrid,
  useColorModeValue,
  Flex,
  Spinner,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Icon,
  Badge,
  Input,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react";
import {
  FaGraduationCap,
  FaSearch,
  FaFilter,
  FaStar,
  FaClock,
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

  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  useEffect(() => {
    fetchModules();
  }, [filters]);

  const fetchModules = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.category) params.append("category", filters.category);
      if (filters.difficulty) params.append("difficulty", filters.difficulty);

      const response = await fetch(`/api/training/modules?${params}`);
      const data = await response.json();

      if (data.success) {
        let filteredModules = data.modules;

        // Apply search filter
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
  };

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

  return (
    <>
      <Navbar />
      <Box bg={useColorModeValue("gray.50", "gray.900")} minH="100vh" p={6}>
        <VStack spacing={8} maxW="1400px" mx="auto">
          {/* Header */}
          <Box
            bg={cardBg}
            borderRadius="xl"
            p={8}
            w="full"
            boxShadow="lg"
            border="1px solid"
            borderColor={borderColor}
            textAlign="center"
          >
            <VStack spacing={4}>
              <Icon as={FaGraduationCap} boxSize={12} color="teal.400" />
              <Heading size="xl">Skill-Based Training</Heading>
              <Text color="gray.600" maxW="600px">
                Master typing with structured lessons designed to improve your
                skills progressively. Choose from beginner courses, advanced
                techniques, and specialized training modules.
              </Text>
            </VStack>
          </Box>

          <Tabs variant="enclosed" w="full">
            <TabList>
              <Tab>Training Modules</Tab>
              {user && <Tab>My Progress</Tab>}
            </TabList>

            <TabPanels>
              <TabPanel px={0}>
                <VStack spacing={6} align="stretch">
                  {/* Filters */}
                  <Box
                    bg={cardBg}
                    borderRadius="lg"
                    p={4}
                    border="1px solid"
                    borderColor={borderColor}
                  >
                    <VStack spacing={4}>
                      <HStack spacing={2}>
                        <Icon as={FaFilter} color="gray.500" />
                        <Text fontWeight="medium">Filter Training Modules</Text>
                      </HStack>

                      <SimpleGrid
                        columns={{ base: 1, md: 3 }}
                        spacing={4}
                        w="full"
                      >
                        <InputGroup>
                          <InputLeftElement>
                            <Icon as={FaSearch} color="gray.400" />
                          </InputLeftElement>
                          <Input
                            placeholder="Search modules..."
                            value={filters.search}
                            onChange={(e) =>
                              handleFilterChange("search", e.target.value)
                            }
                          />
                        </InputGroup>

                        <Select
                          value={filters.category}
                          onChange={(e) =>
                            handleFilterChange("category", e.target.value)
                          }
                        >
                          {categories.map((category) => (
                            <option key={category.value} value={category.value}>
                              {category.label}
                            </option>
                          ))}
                        </Select>

                        <Select
                          value={filters.difficulty}
                          onChange={(e) =>
                            handleFilterChange("difficulty", e.target.value)
                          }
                        >
                          {difficulties.map((difficulty) => (
                            <option
                              key={difficulty.value}
                              value={difficulty.value}
                            >
                              {difficulty.label}
                            </option>
                          ))}
                        </Select>
                      </SimpleGrid>
                    </VStack>
                  </Box>

                  {/* Modules Grid */}
                  {loading ? (
                    <Flex justify="center" align="center" minH="400px">
                      <Spinner size="xl" color="teal.400" />
                    </Flex>
                  ) : (
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
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
                      bg={cardBg}
                      borderRadius="lg"
                      p={8}
                      textAlign="center"
                      border="1px solid"
                      borderColor={borderColor}
                    >
                      <Icon
                        as={FaGraduationCap}
                        boxSize={12}
                        color="gray.400"
                        mb={4}
                      />
                      <Heading size="md" mb={2}>
                        No modules found
                      </Heading>
                      <Text color="gray.600">
                        Try adjusting your filters or check back later for new
                        training modules.
                      </Text>
                    </Box>
                  )}
                </VStack>
              </TabPanel>

              {user && (
                <TabPanel px={0}>
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
