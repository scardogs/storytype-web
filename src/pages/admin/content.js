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
  InputGroup,
  InputLeftAddon,
  InputRightAddon,
} from "@chakra-ui/react";
import {
  EditIcon,
  DeleteIcon,
  SearchIcon,
  ViewIcon,
  AddIcon,
  ExternalLinkIcon,
} from "@chakra-ui/icons";
import AdminLayout from "../../components/admin/admin-layout";

export default function ContentManagement() {
  const [contents, setContents] = useState([]);
  const [filteredContents, setFilteredContents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [genreFilter, setGenreFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [selectedContent, setSelectedContent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const bgColor = "gray.800";
  const borderColor = "gray.700";
  const tableHeaderBg = "gray.700";

  const fetchContents = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/content", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setContents(data.contents);
      } else {
        setError("Failed to fetch content");
      }
    } catch (error) {
      console.error("Error fetching content:", error);
      setError("Failed to fetch content");
    } finally {
      setIsLoading(false);
    }
  };

  const filterContents = () => {
    let filtered = contents;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (content) =>
          content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          content.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          content.author.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by type
    if (typeFilter !== "all") {
      filtered = filtered.filter((content) => content.type === typeFilter);
    }

    // Filter by genre
    if (genreFilter !== "all") {
      filtered = filtered.filter((content) => content.genre === genreFilter);
    }

    // Filter by difficulty
    if (difficultyFilter !== "all") {
      filtered = filtered.filter(
        (content) => content.difficulty === difficultyFilter
      );
    }

    setFilteredContents(filtered);
  };

  useEffect(() => {
    fetchContents();
  }, []);

  useEffect(() => {
    filterContents();
  }, [contents, searchTerm, typeFilter, genreFilter, difficultyFilter]);

  const handleEditContent = (content) => {
    setSelectedContent(content);
    onOpen();
  };

  const handleDeleteContent = async (contentId) => {
    if (!confirm("Are you sure you want to delete this content?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/content/${contentId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        toast({
          title: "Content deleted successfully",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
        fetchContents(); // Refresh the list
      } else {
        toast({
          title: "Failed to delete content",
          status: "error",
          duration: 2000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error deleting content:", error);
      toast({
        title: "Error deleting content",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const handleSaveContent = async (contentData) => {
    try {
      const url = selectedContent?._id
        ? `/api/admin/content/${selectedContent._id}`
        : "/api/admin/content";

      const method = selectedContent?._id ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(contentData),
      });

      if (response.ok) {
        toast({
          title: selectedContent?._id
            ? "Content updated successfully"
            : "Content created successfully",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
        onClose();
        fetchContents(); // Refresh the list
      } else {
        toast({
          title: "Failed to save content",
          status: "error",
          duration: 2000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error saving content:", error);
      toast({
        title: "Error saving content",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "story":
        return "blue";
      case "quote":
        return "purple";
      case "article":
        return "green";
      case "practice_text":
        return "orange";
      case "poem":
        return "pink";
      case "code":
        return "gray";
      default:
        return "gray";
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "beginner":
        return "green";
      case "intermediate":
        return "yellow";
      case "advanced":
        return "orange";
      case "expert":
        return "red";
      default:
        return "gray";
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title="Content Management">
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
      <AdminLayout title="Content Management">
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Content Management">
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Flex
          justify="space-between"
          align="center"
          bgGradient="linear(to-r, gray.800, gray.800, blue.900)"
          border="1px solid"
          borderColor="gray.700"
          borderRadius="2xl"
          p={{ base: 5, md: 6 }}
          boxShadow="0 12px 34px rgba(0,0,0,0.28)"
        >
          <VStack align="flex-start" spacing={1}>
            <Text fontSize="2xl" fontWeight="bold" color="gray.100">
              Content Management
            </Text>
            <Text color="gray.400">
              Manage stories, texts, and practice content
            </Text>
          </VStack>
          <Button
            leftIcon={<AddIcon />}
            colorScheme="blue"
            onClick={() => {
              setSelectedContent(null);
              onOpen();
            }}
          >
            Add Content
          </Button>
        </Flex>

        {/* Filters */}
        <Grid
          templateColumns={{
            base: "1fr",
            md: "repeat(2, 1fr)",
            lg: "repeat(4, 1fr)",
          }}
          gap={4}
        >
          <Input
            placeholder="Search content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<SearchIcon />}
            bg={bgColor}
            borderColor={borderColor}
          />

          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            bg={bgColor}
            borderColor={borderColor}
          >
            <option value="all">All Types</option>
            <option value="story">Story</option>
            <option value="quote">Quote</option>
            <option value="article">Article</option>
            <option value="practice_text">Practice Text</option>
            <option value="poem">Poem</option>
            <option value="code">Code</option>
          </Select>

          <Select
            value={genreFilter}
            onChange={(e) => setGenreFilter(e.target.value)}
            bg={bgColor}
            borderColor={borderColor}
          >
            <option value="all">All Genres</option>
            <option value="fantasy">Fantasy</option>
            <option value="mystery">Mystery</option>
            <option value="sci-fi">Sci-Fi</option>
            <option value="romance">Romance</option>
            <option value="horror">Horror</option>
            <option value="adventure">Adventure</option>
            <option value="comedy">Comedy</option>
            <option value="drama">Drama</option>
            <option value="general">General</option>
          </Select>

          <Select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            bg={bgColor}
            borderColor={borderColor}
          >
            <option value="all">All Difficulties</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="expert">Expert</option>
          </Select>
        </Grid>

        {/* Content Table */}
        <Box
          bg={bgColor}
          border="1px"
          borderColor={borderColor}
          rounded="lg"
          overflow="hidden"
        >
          <Table variant="simple">
            <Thead bg={tableHeaderBg}>
              <Tr>
                <Th>Content</Th>
                <Th>Type</Th>
                <Th>Genre</Th>
                <Th>Difficulty</Th>
                <Th>Stats</Th>
                <Th>Usage</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredContents.map((content) => (
                <Tr key={content._id}>
                  <Td>
                    <VStack align="flex-start" spacing={1}>
                      <Text fontWeight="medium" noOfLines={1}>
                        {content.title}
                      </Text>
                      <Text fontSize="sm" color="gray.500" noOfLines={2}>
                        {content.description}
                      </Text>
                      <Text fontSize="xs" color="gray.400">
                        by {content.author}
                      </Text>
                    </VStack>
                  </Td>
                  <Td>
                    <Badge
                      colorScheme={getTypeColor(content.type)}
                      variant="subtle"
                    >
                      {content.type}
                    </Badge>
                  </Td>
                  <Td>
                    <Badge colorScheme="purple" variant="outline">
                      {content.genre}
                    </Badge>
                  </Td>
                  <Td>
                    <Badge colorScheme={getDifficultyColor(content.difficulty)}>
                      {content.difficulty}
                    </Badge>
                  </Td>
                  <Td>
                    <VStack align="flex-start" spacing={1}>
                      <Text fontSize="sm">{content.wordCount} words</Text>
                      <Text fontSize="sm">
                        {content.estimatedReadingTimeMinutes} min
                      </Text>
                    </VStack>
                  </Td>
                  <Td>
                    <VStack align="flex-start" spacing={1}>
                      <Text fontSize="sm">{content.usageCount} uses</Text>
                      <Text fontSize="sm">{content.averageWPM} avg WPM</Text>
                    </VStack>
                  </Td>
                  <Td>
                    <VStack align="flex-start" spacing={1}>
                      <Badge
                        colorScheme={content.isActive ? "green" : "red"}
                        size="sm"
                      >
                        {content.isActive ? "Active" : "Inactive"}
                      </Badge>
                      {content.isFeatured && (
                        <Badge colorScheme="yellow" size="sm">
                          Featured
                        </Badge>
                      )}
                    </VStack>
                  </Td>
                  <Td>
                    <HStack spacing={2}>
                      <IconButton
                        aria-label="View content"
                        icon={<ViewIcon />}
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditContent(content)}
                      />
                      <IconButton
                        aria-label="Edit content"
                        icon={<EditIcon />}
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditContent(content)}
                      />
                      <IconButton
                        aria-label="Delete content"
                        icon={<DeleteIcon />}
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        onClick={() => handleDeleteContent(content._id)}
                      />
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>

        {/* Content Modal */}
        <ContentModal
          isOpen={isOpen}
          onClose={onClose}
          content={selectedContent}
          onSave={handleSaveContent}
        />
      </VStack>
    </AdminLayout>
  );
}

// Content Modal Component
function ContentModal({ isOpen, onClose, content, onSave }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
    type: "story",
    genre: "general",
    difficulty: "beginner",
    author: "Anonymous",
    source: "Original",
    tags: [],
    isActive: true,
    isFeatured: false,
  });

  useEffect(() => {
    if (content) {
      setFormData({
        title: content.title,
        description: content.description,
        content: content.content,
        type: content.type,
        genre: content.genre,
        difficulty: content.difficulty,
        author: content.author,
        source: content.source,
        tags: content.tags || [],
        isActive: content.isActive,
        isFeatured: content.isFeatured,
      });
    } else {
      // Reset form for new content
      setFormData({
        title: "",
        description: "",
        content: "",
        type: "story",
        genre: "general",
        difficulty: "beginner",
        author: "Anonymous",
        source: "Original",
        tags: [],
        isActive: true,
        isFeatured: false,
      });
    }
  }, [content]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleTagsChange = (e) => {
    const tags = e.target.value
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag);
    setFormData({
      ...formData,
      tags,
    });
  };

  const wordCount = formData.content.trim().split(/\s+/).length;
  const characterCount = formData.content.length;
  const estimatedTime = Math.round((wordCount / 5) * 60);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl">
      <ModalOverlay />
      <ModalContent maxH="90vh" overflowY="auto">
        <ModalHeader>
          {content ? "Edit Content" : "Add New Content"}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
              <Grid templateColumns="repeat(2, 1fr)" gap={4} w="full">
                <FormControl>
                  <FormLabel>Title</FormLabel>
                  <Input
                    value={formData.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    placeholder="Enter content title"
                    required
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Author</FormLabel>
                  <Input
                    value={formData.author}
                    onChange={(e) => handleChange("author", e.target.value)}
                    placeholder="Enter author name"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Type</FormLabel>
                  <Select
                    value={formData.type}
                    onChange={(e) => handleChange("type", e.target.value)}
                  >
                    <option value="story">Story</option>
                    <option value="quote">Quote</option>
                    <option value="article">Article</option>
                    <option value="practice_text">Practice Text</option>
                    <option value="poem">Poem</option>
                    <option value="code">Code</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Genre</FormLabel>
                  <Select
                    value={formData.genre}
                    onChange={(e) => handleChange("genre", e.target.value)}
                  >
                    <option value="general">General</option>
                    <option value="fantasy">Fantasy</option>
                    <option value="mystery">Mystery</option>
                    <option value="sci-fi">Sci-Fi</option>
                    <option value="romance">Romance</option>
                    <option value="horror">Horror</option>
                    <option value="adventure">Adventure</option>
                    <option value="comedy">Comedy</option>
                    <option value="drama">Drama</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Difficulty</FormLabel>
                  <Select
                    value={formData.difficulty}
                    onChange={(e) => handleChange("difficulty", e.target.value)}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Source</FormLabel>
                  <Input
                    value={formData.source}
                    onChange={(e) => handleChange("source", e.target.value)}
                    placeholder="Enter source"
                  />
                </FormControl>
              </Grid>

              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Enter content description"
                  rows={3}
                  required
                />
              </FormControl>

              <FormControl>
                <FormLabel>Tags (comma-separated)</FormLabel>
                <Input
                  value={formData.tags.join(", ")}
                  onChange={handleTagsChange}
                  placeholder="Enter tags separated by commas"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Content</FormLabel>
                <Textarea
                  value={formData.content}
                  onChange={(e) => handleChange("content", e.target.value)}
                  placeholder="Enter the main content text"
                  rows={15}
                  required
                />
                <HStack spacing={4} mt={2}>
                  <Text fontSize="sm" color="gray.500">
                    Words: {wordCount}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    Characters: {characterCount}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    Est. Time: {Math.round(estimatedTime / 60)} min
                  </Text>
                </HStack>
              </FormControl>

              <Grid templateColumns="repeat(2, 1fr)" gap={4} w="full">
                <FormControl display="flex" alignItems="center">
                  <FormLabel mb="0">Active</FormLabel>
                  <Switch
                    isChecked={formData.isActive}
                    onChange={(e) => handleChange("isActive", e.target.checked)}
                  />
                </FormControl>

                <FormControl display="flex" alignItems="center">
                  <FormLabel mb="0">Featured</FormLabel>
                  <Switch
                    isChecked={formData.isFeatured}
                    onChange={(e) =>
                      handleChange("isFeatured", e.target.checked)
                    }
                  />
                </FormControl>
              </Grid>

              <HStack spacing={4} w="full" justify="flex-end">
                <Button variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" colorScheme="blue">
                  {content ? "Update Content" : "Create Content"}
                </Button>
              </HStack>
            </VStack>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
