import { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Input,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Textarea,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Switch,
  useToast,
  Text,
  Flex,
  Skeleton,
  Alert,
  AlertIcon,
  Grid,
  GridItem,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from "@chakra-ui/react";
import {
  EditIcon,
  DeleteIcon,
  SearchIcon,
  ViewIcon,
  AddIcon,
} from "@chakra-ui/icons";
import AdminLayout from "../../components/admin/admin-layout";

export default function TrainingManagement() {
  const [modules, setModules] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [filteredModules, setFilteredModules] = useState([]);
  const [filteredLessons, setFilteredLessons] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [editorType, setEditorType] = useState("module");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const bgColor = "gray.800";
  const borderColor = "gray.700";
  const tableHeaderBg = "gray.700";

  const fetchData = async () => {
    try {
      setIsLoading(true);

      // Fetch modules and lessons
      const [modulesResponse, lessonsResponse] = await Promise.all([
        fetch("/api/admin/training/modules", { credentials: "include" }),
        fetch("/api/admin/training/lessons", { credentials: "include" }),
      ]);

      if (modulesResponse.ok) {
        const modulesData = await modulesResponse.json();
        setModules(modulesData.modules);
      }

      if (lessonsResponse.ok) {
        const lessonsData = await lessonsResponse.json();
        setLessons(lessonsData.lessons);
      }
    } catch (error) {
      console.error("Error fetching training data:", error);
      setError("Failed to fetch training data");
    } finally {
      setIsLoading(false);
    }
  };

  const filterData = () => {
    if (!searchTerm) {
      setFilteredModules(modules);
      setFilteredLessons(lessons);
      return;
    }

    const filteredMods = modules.filter(
      (module) =>
        module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        module.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredModules(filteredMods);

    const filteredLess = lessons.filter(
      (lesson) =>
        lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lesson.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredLessons(filteredLess);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterData();
  }, [modules, lessons, searchTerm]);

  const handleEditModule = (module) => {
    setEditorType("module");
    setSelectedModule(module);
    setSelectedLesson(null);
    onOpen();
  };

  const handleEditLesson = (lesson) => {
    setEditorType("lesson");
    setSelectedLesson(lesson);
    setSelectedModule(null);
    onOpen();
  };

  const handleDeleteModule = async (moduleId) => {
    if (!confirm("Are you sure you want to delete this module?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/training/modules/${moduleId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        toast({
          title: "Module deleted successfully",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
        fetchData(); // Refresh the list
      } else {
        toast({
          title: "Failed to delete module",
          status: "error",
          duration: 2000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error deleting module:", error);
      toast({
        title: "Error deleting module",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!confirm("Are you sure you want to delete this lesson?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/training/lessons/${lessonId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        toast({
          title: "Lesson deleted successfully",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
        fetchData(); // Refresh the list
      } else {
        toast({
          title: "Failed to delete lesson",
          status: "error",
          duration: 2000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error deleting lesson:", error);
      toast({
        title: "Error deleting lesson",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const handleSaveItem = async (itemData) => {
    try {
      const isModule = editorType === "module";
      const url = isModule
        ? selectedModule
          ? `/api/admin/training/modules/${selectedModule._id}`
          : "/api/admin/training/modules"
        : selectedLesson
        ? `/api/admin/training/lessons/${selectedLesson._id}`
        : "/api/admin/training/lessons";

      const method = selectedModule || selectedLesson ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(itemData),
      });

      if (response.ok) {
        toast({
          title: `${isModule ? "Module" : "Lesson"} saved successfully`,
          status: "success",
          duration: 2000,
          isClosable: true,
        });
        onClose();
        fetchData(); // Refresh the list
      } else {
        toast({
          title: `Failed to save ${isModule ? "module" : "lesson"}`,
          status: "error",
          duration: 2000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error saving item:", error);
      toast({
        title: "Error saving item",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "easy":
        return "green";
      case "medium":
        return "yellow";
      case "hard":
        return "orange";
      case "expert":
        return "red";
      default:
        return "gray";
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title="Training Management">
        <VStack align="stretch" spacing={5}>
          <Skeleton h="108px" borderRadius="2xl" startColor="gray.700" endColor="gray.600" />
          <Skeleton h="56px" borderRadius="xl" startColor="gray.700" endColor="gray.600" />
          <Skeleton h="420px" borderRadius="2xl" startColor="gray.700" endColor="gray.600" />
        </VStack>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Training Management">
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Training Management">
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
          <VStack align="flex-start" spacing={1}>
            <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold" color="gray.100">
              Training Management
            </Text>
            <Text color="gray.400" fontSize={{ base: "sm", md: "md" }}>
              Manage training modules and lessons
            </Text>
          </VStack>
          <HStack spacing={2}>
            <Button
              leftIcon={<AddIcon />}
              colorScheme="blue"
              size={{ base: "sm", md: "md" }}
              borderRadius="lg"
              onClick={() => {
                setEditorType("module");
                setSelectedModule(null);
                setSelectedLesson(null);
                onOpen();
              }}
            >
              Create Module
            </Button>
            <Button
              leftIcon={<AddIcon />}
              colorScheme="green"
              size={{ base: "sm", md: "md" }}
              borderRadius="lg"
              onClick={() => {
                setEditorType("lesson");
                setSelectedModule(null);
                setSelectedLesson(null);
                onOpen();
              }}
            >
              Create Lesson
            </Button>
          </HStack>
        </Flex>

        {/* Search */}
        <Input
          placeholder="Search modules and lessons..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          leftIcon={<SearchIcon />}
          bg={bgColor}
          borderColor={borderColor}
          borderRadius="lg"
          size={{ base: "sm", md: "md" }}
          _focus={{
            borderColor: "blue.500",
            boxShadow: "0 0 0 1px blue.500",
          }}
          _hover={{
            borderColor: "gray.400",
          }}
        />

        {/* Tabs for Modules and Lessons */}
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
              Training Modules
            </Tab>
            <Tab
              fontSize={{ base: "sm", md: "md" }}
              _selected={{
                bg: "blue.500",
                color: "white",
                borderRadius: "md",
              }}
            >
              Lessons
            </Tab>
          </TabList>

          <TabPanels>
            {/* Modules Tab */}
            <TabPanel>
              <Box
                bg={bgColor}
                border="1px"
                borderColor={borderColor}
                borderRadius="lg"
                shadow="sm"
                overflow="hidden"
              >
                <Table variant="simple">
                  <Thead bg={tableHeaderBg}>
                    <Tr>
                      <Th fontSize={{ base: "xs", md: "sm" }}>Module</Th>
                      <Th fontSize={{ base: "xs", md: "sm" }}>Category</Th>
                      <Th fontSize={{ base: "xs", md: "sm" }}>Difficulty</Th>
                      <Th fontSize={{ base: "xs", md: "sm" }}>Lessons</Th>
                      <Th fontSize={{ base: "xs", md: "sm" }}>Duration</Th>
                      <Th fontSize={{ base: "xs", md: "sm" }}>Status</Th>
                      <Th fontSize={{ base: "xs", md: "sm" }}>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredModules.map((module) => (
                      <Tr key={module._id}>
                        <Td>
                          <VStack align="flex-start" spacing={1}>
                            <HStack spacing={2}>
                              <Text>{module.icon}</Text>
                              <Text fontWeight="medium">{module.title}</Text>
                            </HStack>
                            <Text fontSize="sm" color="gray.500" noOfLines={2}>
                              {module.description}
                            </Text>
                          </VStack>
                        </Td>
                        <Td>
                          <Badge colorScheme="purple" variant="subtle">
                            {module.category}
                          </Badge>
                        </Td>
                        <Td>
                          <Badge
                            colorScheme={getDifficultyColor(module.difficulty)}
                          >
                            {module.difficulty}
                          </Badge>
                        </Td>
                        <Td>
                          <Text fontSize="sm">{module.totalLessons}</Text>
                        </Td>
                        <Td>
                          <Text fontSize="sm">
                            {module.estimatedDuration} min
                          </Text>
                        </Td>
                        <Td>
                          <Badge
                            colorScheme={module.isActive ? "green" : "red"}
                          >
                            {module.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </Td>
                        <Td>
                          <HStack spacing={2}>
                            <IconButton
                              aria-label="Edit module"
                              icon={<EditIcon />}
                              size="sm"
                              variant="outline"
                              colorScheme="blue"
                              _hover={{
                                bg: "blue.50",
                                transform: "scale(1.05)",
                              }}
                              onClick={() => handleEditModule(module)}
                            />
                            <IconButton
                              aria-label="Delete module"
                              icon={<DeleteIcon />}
                              size="sm"
                              variant="outline"
                              colorScheme="red"
                              _hover={{
                                bg: "red.50",
                                transform: "scale(1.05)",
                              }}
                              onClick={() => handleDeleteModule(module._id)}
                            />
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </TabPanel>

            {/* Lessons Tab */}
            <TabPanel>
              <Box
                bg={bgColor}
                border="1px"
                borderColor={borderColor}
                borderRadius="lg"
                shadow="sm"
                overflow="hidden"
              >
                <Table variant="simple">
                  <Thead bg={tableHeaderBg}>
                    <Tr>
                      <Th fontSize={{ base: "xs", md: "sm" }}>Lesson</Th>
                      <Th fontSize={{ base: "xs", md: "sm" }}>Type</Th>
                      <Th fontSize={{ base: "xs", md: "sm" }}>Difficulty</Th>
                      <Th fontSize={{ base: "xs", md: "sm" }}>Module</Th>
                      <Th fontSize={{ base: "xs", md: "sm" }}>Order</Th>
                      <Th fontSize={{ base: "xs", md: "sm" }}>Status</Th>
                      <Th fontSize={{ base: "xs", md: "sm" }}>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredLessons.map((lesson) => (
                      <Tr key={lesson._id}>
                        <Td>
                          <VStack align="flex-start" spacing={1}>
                            <Text fontWeight="medium">{lesson.title}</Text>
                            <Text fontSize="sm" color="gray.500" noOfLines={2}>
                              {lesson.description}
                            </Text>
                          </VStack>
                        </Td>
                        <Td>
                          <Badge colorScheme="blue" variant="subtle">
                            {lesson.lessonType}
                          </Badge>
                        </Td>
                        <Td>
                          <Badge
                            colorScheme={getDifficultyColor(lesson.difficulty)}
                          >
                            {lesson.difficulty}
                          </Badge>
                        </Td>
                        <Td>
                          <Text fontSize="sm">
                            {lesson.moduleId?.title || "N/A"}
                          </Text>
                        </Td>
                        <Td>
                          <Text fontSize="sm">{lesson.order}</Text>
                        </Td>
                        <Td>
                          <Badge
                            colorScheme={lesson.isActive ? "green" : "red"}
                          >
                            {lesson.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </Td>
                        <Td>
                          <HStack spacing={2}>
                            <IconButton
                              aria-label="Edit lesson"
                              icon={<EditIcon />}
                              size="sm"
                              variant="outline"
                              colorScheme="blue"
                              _hover={{
                                bg: "blue.50",
                                transform: "scale(1.05)",
                              }}
                              onClick={() => handleEditLesson(lesson)}
                            />
                            <IconButton
                              aria-label="Delete lesson"
                              icon={<DeleteIcon />}
                              size="sm"
                              variant="outline"
                              colorScheme="red"
                              _hover={{
                                bg: "red.50",
                                transform: "scale(1.05)",
                              }}
                              onClick={() => handleDeleteLesson(lesson._id)}
                            />
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </TabPanel>
          </TabPanels>
        </Tabs>

        {/* Training Item Modal */}
        <TrainingItemModal
          isOpen={isOpen}
          onClose={onClose}
          editorType={editorType}
          module={selectedModule}
          lesson={selectedLesson}
          modules={modules}
          onSave={handleSaveItem}
        />
      </VStack>
    </AdminLayout>
  );
}

// Training Item Modal Component
function TrainingItemModal({
  isOpen,
  onClose,
  editorType,
  module,
  lesson,
  modules,
  onSave,
}) {
  const [formData, setFormData] = useState({
    // Module fields
    title: "",
    description: "",
    category: "beginner",
    difficulty: "easy",
    estimatedDuration: 30,
    icon: "🎯",
    color: "blue",
    isActive: true,

    // Lesson fields
    lessonType: "practice",
    moduleId: "",
    order: 1,
    content: {
      instruction: "",
      practiceText: "",
      expectedWPM: 30,
      timeLimit: 60,
      targetAccuracy: 95,
      specialRules: {
        allowBackspace: true,
        numbersOnly: false,
        symbolsOnly: false,
        caseSensitive: true,
        highlightErrors: true,
      },
      hints: [],
      tips: [],
    },
    skills: [],
    prerequisites: [],
  });

  useEffect(() => {
    if (module) {
      setFormData({
        ...formData,
        title: module.title,
        description: module.description,
        category: module.category,
        difficulty: module.difficulty,
        estimatedDuration: module.estimatedDuration,
        icon: module.icon,
        color: module.color,
        isActive: module.isActive,
      });
    } else if (lesson) {
      setFormData({
        ...formData,
        title: lesson.title,
        description: lesson.description,
        lessonType: lesson.lessonType,
        moduleId: lesson.moduleId?._id || "",
        order: lesson.order,
        difficulty: lesson.difficulty,
        isActive: lesson.isActive,
        content: lesson.content,
        skills: lesson.skills,
        prerequisites: lesson.prerequisites,
      });
    } else {
      // Reset form for new item
      setFormData({
        title: "",
        description: "",
        category: "beginner",
        difficulty: "easy",
        estimatedDuration: 30,
        icon: "🎯",
        color: "blue",
        isActive: true,
        lessonType: "practice",
        moduleId: "",
        order: 1,
        content: {
          instruction: "",
          practiceText: "",
          expectedWPM: 30,
          timeLimit: 60,
          targetAccuracy: 95,
          specialRules: {
            allowBackspace: true,
            numbersOnly: false,
            symbolsOnly: false,
            caseSensitive: true,
            highlightErrors: true,
          },
          hints: [],
          tips: [],
        },
        skills: [],
        prerequisites: [],
      });
    }
  }, [module, lesson]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (field, value) => {
    if (field.startsWith("content.")) {
      const contentField = field.split(".")[1];
      if (contentField.startsWith("specialRules.")) {
        const ruleField = contentField.split(".")[1];
        setFormData({
          ...formData,
          content: {
            ...formData.content,
            specialRules: {
              ...formData.content.specialRules,
              [ruleField]: value,
            },
          },
        });
      } else {
        setFormData({
          ...formData,
          content: {
            ...formData.content,
            [contentField]: value,
          },
        });
      }
    } else {
      setFormData({
        ...formData,
        [field]: value,
      });
    }
  };

  const isModule = editorType === "module";

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl">
      <ModalOverlay />
      <ModalContent maxH="90vh" overflowY="auto">
        <ModalHeader>
          {isModule
            ? "Edit Module"
            : lesson
            ? "Edit Lesson"
            : "Create Training Item"}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
              {/* Basic Information */}
              <Grid templateColumns="repeat(2, 1fr)" gap={4} w="full">
                <FormControl>
                  <FormLabel>Title</FormLabel>
                  <Input
                    value={formData.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    placeholder="Enter title"
                    required
                  />
                </FormControl>

                {!isModule && (
                  <FormControl>
                    <FormLabel>Module</FormLabel>
                    <Select
                      value={formData.moduleId}
                      onChange={(e) => handleChange("moduleId", e.target.value)}
                      required
                    >
                      <option value="">Select Module</option>
                      {modules.map((mod) => (
                        <option key={mod._id} value={mod._id}>
                          {mod.title}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                )}

                <FormControl>
                  <FormLabel>Difficulty</FormLabel>
                  <Select
                    value={formData.difficulty}
                    onChange={(e) => handleChange("difficulty", e.target.value)}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                    {isModule && <option value="expert">Expert</option>}
                  </Select>
                </FormControl>

                {isModule && (
                  <FormControl>
                    <FormLabel>Category</FormLabel>
                    <Select
                      value={formData.category}
                      onChange={(e) => handleChange("category", e.target.value)}
                    >
                      <option value="beginner">Beginner</option>
                      <option value="advanced">Advanced</option>
                      <option value="specialized">Specialized</option>
                      <option value="daily">Daily</option>
                    </Select>
                  </FormControl>
                )}

                {!isModule && (
                  <>
                    <FormControl>
                      <FormLabel>Lesson Type</FormLabel>
                      <Select
                        value={formData.lessonType}
                        onChange={(e) =>
                          handleChange("lessonType", e.target.value)
                        }
                      >
                        <option value="theory">Theory</option>
                        <option value="practice">Practice</option>
                        <option value="drill">Drill</option>
                        <option value="assessment">Assessment</option>
                      </Select>
                    </FormControl>

                    <FormControl>
                      <FormLabel>Order</FormLabel>
                      <NumberInput
                        value={formData.order}
                        onChange={(value) =>
                          handleChange("order", parseInt(value))
                        }
                        min={1}
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </FormControl>
                  </>
                )}
              </Grid>

              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Enter description"
                  rows={3}
                  required
                />
              </FormControl>

              {isModule ? (
                /* Module-specific fields */
                <>
                  <Grid templateColumns="repeat(2, 1fr)" gap={4} w="full">
                    <FormControl>
                      <FormLabel>Estimated Duration (minutes)</FormLabel>
                      <NumberInput
                        value={formData.estimatedDuration}
                        onChange={(value) =>
                          handleChange("estimatedDuration", parseInt(value))
                        }
                        min={5}
                        max={300}
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </FormControl>

                    <FormControl>
                      <FormLabel>Icon</FormLabel>
                      <Input
                        value={formData.icon}
                        onChange={(e) => handleChange("icon", e.target.value)}
                        placeholder="🎯"
                      />
                    </FormControl>
                  </Grid>

                  <FormControl>
                    <FormLabel>Color</FormLabel>
                    <Select
                      value={formData.color}
                      onChange={(e) => handleChange("color", e.target.value)}
                    >
                      <option value="blue">Blue</option>
                      <option value="green">Green</option>
                      <option value="purple">Purple</option>
                      <option value="red">Red</option>
                      <option value="yellow">Yellow</option>
                      <option value="pink">Pink</option>
                    </Select>
                  </FormControl>
                </>
              ) : (
                /* Lesson-specific fields */
                <>
                  <FormControl>
                    <FormLabel>Instruction</FormLabel>
                    <Textarea
                      value={formData.content.instruction}
                      onChange={(e) =>
                        handleChange("content.instruction", e.target.value)
                      }
                      placeholder="Enter instruction text"
                      rows={3}
                      required
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Practice Text</FormLabel>
                    <Textarea
                      value={formData.content.practiceText}
                      onChange={(e) =>
                        handleChange("content.practiceText", e.target.value)
                      }
                      placeholder="Enter practice text for typing"
                      rows={5}
                    />
                  </FormControl>

                  <Grid templateColumns="repeat(3, 1fr)" gap={4} w="full">
                    <FormControl>
                      <FormLabel>Expected WPM</FormLabel>
                      <NumberInput
                        value={formData.content.expectedWPM}
                        onChange={(value) =>
                          handleChange("content.expectedWPM", parseInt(value))
                        }
                        min={10}
                        max={200}
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </FormControl>

                    <FormControl>
                      <FormLabel>Time Limit (seconds)</FormLabel>
                      <NumberInput
                        value={formData.content.timeLimit}
                        onChange={(value) =>
                          handleChange("content.timeLimit", parseInt(value))
                        }
                        min={10}
                        max={600}
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </FormControl>

                    <FormControl>
                      <FormLabel>Target Accuracy (%)</FormLabel>
                      <NumberInput
                        value={formData.content.targetAccuracy}
                        onChange={(value) =>
                          handleChange(
                            "content.targetAccuracy",
                            parseInt(value)
                          )
                        }
                        min={50}
                        max={100}
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </FormControl>
                  </Grid>

                  <VStack spacing={3} w="full">
                    <Text fontWeight="medium">Special Rules</Text>
                    <Grid templateColumns="repeat(2, 1fr)" gap={4} w="full">
                      <FormControl display="flex" alignItems="center">
                        <FormLabel mb="0">Allow Backspace</FormLabel>
                        <Switch
                          isChecked={
                            formData.content.specialRules.allowBackspace
                          }
                          onChange={(e) =>
                            handleChange(
                              "content.specialRules.allowBackspace",
                              e.target.checked
                            )
                          }
                        />
                      </FormControl>

                      <FormControl display="flex" alignItems="center">
                        <FormLabel mb="0">Numbers Only</FormLabel>
                        <Switch
                          isChecked={formData.content.specialRules.numbersOnly}
                          onChange={(e) =>
                            handleChange(
                              "content.specialRules.numbersOnly",
                              e.target.checked
                            )
                          }
                        />
                      </FormControl>

                      <FormControl display="flex" alignItems="center">
                        <FormLabel mb="0">Symbols Only</FormLabel>
                        <Switch
                          isChecked={formData.content.specialRules.symbolsOnly}
                          onChange={(e) =>
                            handleChange(
                              "content.specialRules.symbolsOnly",
                              e.target.checked
                            )
                          }
                        />
                      </FormControl>

                      <FormControl display="flex" alignItems="center">
                        <FormLabel mb="0">Case Sensitive</FormLabel>
                        <Switch
                          isChecked={
                            formData.content.specialRules.caseSensitive
                          }
                          onChange={(e) =>
                            handleChange(
                              "content.specialRules.caseSensitive",
                              e.target.checked
                            )
                          }
                        />
                      </FormControl>
                    </Grid>
                  </VStack>
                </>
              )}

              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0">Active</FormLabel>
                <Switch
                  isChecked={formData.isActive}
                  onChange={(e) => handleChange("isActive", e.target.checked)}
                />
              </FormControl>

              <HStack spacing={4} w="full" justify="flex-end">
                <Button variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" colorScheme="blue">
                  {isModule
                    ? module
                      ? "Update Module"
                      : "Create Module"
                    : lesson
                    ? "Update Lesson"
                    : "Create Lesson"}
                </Button>
              </HStack>
            </VStack>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
