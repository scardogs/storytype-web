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
  Spinner,
  Alert,
  AlertIcon,
  useColorModeValue,
  Grid,
  GridItem,
  Card,
  CardBody,
  CardHeader,
  Heading,
} from "@chakra-ui/react";
import {
  EditIcon,
  DeleteIcon,
  SearchIcon,
  ViewIcon,
  AddIcon,
} from "@chakra-ui/icons";
import AdminLayout from "../../components/admin/admin-layout";

export default function TournamentManagement() {
  const [tournaments, setTournaments] = useState([]);
  const [filteredTournaments, setFilteredTournaments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const tableHeaderBg = useColorModeValue("gray.50", "gray.700");

  useEffect(() => {
    fetchTournaments();
  }, []);

  useEffect(() => {
    filterTournaments();
  }, [tournaments, searchTerm, statusFilter]);

  const fetchTournaments = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/tournaments", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setTournaments(data.tournaments);
      } else {
        setError("Failed to fetch tournaments");
      }
    } catch (error) {
      console.error("Error fetching tournaments:", error);
      setError("Failed to fetch tournaments");
    } finally {
      setIsLoading(false);
    }
  };

  const filterTournaments = () => {
    let filtered = tournaments;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (tournament) =>
          tournament.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tournament.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (tournament) => tournament.status === statusFilter
      );
    }

    setFilteredTournaments(filtered);
  };

  const handleEditTournament = (tournament) => {
    setSelectedTournament(tournament);
    onOpen();
  };

  const handleDeleteTournament = async (tournamentId) => {
    if (!confirm("Are you sure you want to delete this tournament?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/tournaments/${tournamentId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        toast({
          title: "Tournament deleted successfully",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
        fetchTournaments(); // Refresh the list
      } else {
        toast({
          title: "Failed to delete tournament",
          status: "error",
          duration: 2000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error deleting tournament:", error);
      toast({
        title: "Error deleting tournament",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const handleSaveTournament = async (tournamentData) => {
    try {
      const url = selectedTournament?._id
        ? `/api/admin/tournaments/${selectedTournament._id}`
        : "/api/admin/tournaments";

      const method = selectedTournament?._id ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(tournamentData),
      });

      if (response.ok) {
        toast({
          title: selectedTournament?._id
            ? "Tournament updated successfully"
            : "Tournament created successfully",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
        onClose();
        fetchTournaments(); // Refresh the list
      } else {
        toast({
          title: "Failed to save tournament",
          status: "error",
          duration: 2000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error saving tournament:", error);
      toast({
        title: "Error saving tournament",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "upcoming":
        return "blue";
      case "active":
        return "green";
      case "completed":
        return "gray";
      case "cancelled":
        return "red";
      default:
        return "gray";
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title="Tournament Management">
        <Flex align="center" justify="center" h="400px">
          <Spinner size="xl" />
        </Flex>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Tournament Management">
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Tournament Management">
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Flex
          justify="space-between"
          align={{ base: "flex-start", md: "center" }}
          direction={{ base: "column", md: "row" }}
          gap={{ base: 4, md: 0 }}
        >
          <VStack align="flex-start" spacing={1}>
            <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold">
              Tournament Management
            </Text>
            <Text color="gray.600" fontSize={{ base: "sm", md: "md" }}>
              Create and manage typing tournaments
            </Text>
          </VStack>
          <Button
            leftIcon={<AddIcon />}
            colorScheme="blue"
            size={{ base: "sm", md: "md" }}
            borderRadius="lg"
            onClick={() => {
              setSelectedTournament(null);
              onOpen();
            }}
          >
            Create Tournament
          </Button>
        </Flex>

        {/* Search and Filters */}
        <HStack spacing={4} direction={{ base: "column", md: "row" }}>
          <Input
            placeholder="Search tournaments..."
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
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            bg={bgColor}
            borderColor={borderColor}
            borderRadius="lg"
            size={{ base: "sm", md: "md" }}
            w={{ base: "full", md: "200px" }}
            _focus={{
              borderColor: "blue.500",
              boxShadow: "0 0 0 1px blue.500",
            }}
            _hover={{
              borderColor: "gray.400",
            }}
          >
            <option value="all">All Status</option>
            <option value="upcoming">Upcoming</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </Select>
        </HStack>

        {/* Tournaments Table */}
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
                <Th fontSize={{ base: "xs", md: "sm" }}>Tournament</Th>
                <Th fontSize={{ base: "xs", md: "sm" }}>Type</Th>
                <Th fontSize={{ base: "xs", md: "sm" }}>Status</Th>
                <Th fontSize={{ base: "xs", md: "sm" }}>Participants</Th>
                <Th fontSize={{ base: "xs", md: "sm" }}>Dates</Th>
                <Th fontSize={{ base: "xs", md: "sm" }}>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredTournaments.map((tournament) => (
                <Tr key={tournament._id}>
                  <Td>
                    <VStack align="flex-start" spacing={1}>
                      <Text fontWeight="medium">{tournament.name}</Text>
                      <Text fontSize="sm" color="gray.500" noOfLines={2}>
                        {tournament.description}
                      </Text>
                    </VStack>
                  </Td>
                  <Td>
                    <VStack align="flex-start" spacing={1}>
                      <Badge colorScheme="purple" variant="subtle">
                        {tournament.type}
                      </Badge>
                      <Badge colorScheme="orange" variant="subtle">
                        {tournament.theme}
                      </Badge>
                    </VStack>
                  </Td>
                  <Td>
                    <Badge colorScheme={getStatusColor(tournament.status)}>
                      {tournament.status}
                    </Badge>
                  </Td>
                  <Td>
                    <Text fontSize="sm">
                      {tournament.participants.length}/
                      {tournament.rules.maxParticipants}
                    </Text>
                  </Td>
                  <Td>
                    <VStack align="flex-start" spacing={1}>
                      <Text fontSize="sm">
                        Start:{" "}
                        {new Date(tournament.startDate).toLocaleDateString()}
                      </Text>
                      <Text fontSize="sm">
                        End: {new Date(tournament.endDate).toLocaleDateString()}
                      </Text>
                    </VStack>
                  </Td>
                  <Td>
                    <HStack spacing={2}>
                      <IconButton
                        aria-label="View tournament"
                        icon={<ViewIcon />}
                        size="sm"
                        variant="outline"
                        colorScheme="green"
                        _hover={{
                          bg: "green.50",
                          transform: "scale(1.05)",
                        }}
                        onClick={() => handleEditTournament(tournament)}
                      />
                      <IconButton
                        aria-label="Edit tournament"
                        icon={<EditIcon />}
                        size="sm"
                        variant="outline"
                        colorScheme="blue"
                        _hover={{
                          bg: "blue.50",
                          transform: "scale(1.05)",
                        }}
                        onClick={() => handleEditTournament(tournament)}
                      />
                      <IconButton
                        aria-label="Delete tournament"
                        icon={<DeleteIcon />}
                        size="sm"
                        variant="outline"
                        colorScheme="red"
                        _hover={{
                          bg: "red.50",
                          transform: "scale(1.05)",
                        }}
                        onClick={() => handleDeleteTournament(tournament._id)}
                      />
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>

        {/* Tournament Modal */}
        <TournamentModal
          isOpen={isOpen}
          onClose={onClose}
          tournament={selectedTournament}
          onSave={handleSaveTournament}
        />
      </VStack>
    </AdminLayout>
  );
}

// Tournament Modal Component
function TournamentModal({ isOpen, onClose, tournament, onSave }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "weekly",
    theme: "speed",
    status: "upcoming",
    rules: {
      allowBackspace: true,
      numbersOnly: false,
      specialCharacters: false,
      timeLimit: 60,
      maxParticipants: 100,
    },
    prizes: {
      firstPlace: "Gold Trophy",
      secondPlace: "Silver Trophy",
      thirdPlace: "Bronze Trophy",
      badges: [],
    },
    startDate: "",
    endDate: "",
    registrationDeadline: "",
  });

  useEffect(() => {
    if (tournament) {
      setFormData({
        name: tournament.name,
        description: tournament.description,
        type: tournament.type,
        theme: tournament.theme,
        status: tournament.status,
        rules: tournament.rules,
        prizes: tournament.prizes,
        startDate: tournament.startDate
          ? new Date(tournament.startDate).toISOString().slice(0, 16)
          : "",
        endDate: tournament.endDate
          ? new Date(tournament.endDate).toISOString().slice(0, 16)
          : "",
        registrationDeadline: tournament.registrationDeadline
          ? new Date(tournament.registrationDeadline).toISOString().slice(0, 16)
          : "",
      });
    } else {
      // Reset form for new tournament
      setFormData({
        name: "",
        description: "",
        type: "weekly",
        theme: "speed",
        status: "upcoming",
        rules: {
          allowBackspace: true,
          numbersOnly: false,
          specialCharacters: false,
          timeLimit: 60,
          maxParticipants: 100,
        },
        prizes: {
          firstPlace: "Gold Trophy",
          secondPlace: "Silver Trophy",
          thirdPlace: "Bronze Trophy",
          badges: [],
        },
        startDate: "",
        endDate: "",
        registrationDeadline: "",
      });
    }
  }, [tournament]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Convert date strings to Date objects
    const tournamentData = {
      ...formData,
      startDate: new Date(formData.startDate),
      endDate: new Date(formData.endDate),
      registrationDeadline: new Date(formData.registrationDeadline),
    };

    onSave(tournamentData);
  };

  const handleChange = (field, value) => {
    if (field.startsWith("rules.")) {
      const ruleField = field.split(".")[1];
      setFormData({
        ...formData,
        rules: {
          ...formData.rules,
          [ruleField]: value,
        },
      });
    } else if (field.startsWith("prizes.")) {
      const prizeField = field.split(".")[1];
      setFormData({
        ...formData,
        prizes: {
          ...formData.prizes,
          [prizeField]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [field]: value,
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl">
      <ModalOverlay />
      <ModalContent maxH="90vh" overflowY="auto">
        <ModalHeader>
          {tournament ? "Edit Tournament" : "Create Tournament"}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
              <Grid templateColumns="repeat(2, 1fr)" gap={4} w="full">
                <FormControl>
                  <FormLabel>Tournament Name</FormLabel>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="Enter tournament name"
                    required
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Type</FormLabel>
                  <Select
                    value={formData.type}
                    onChange={(e) => handleChange("type", e.target.value)}
                  >
                    <option value="weekly">Weekly</option>
                    <option value="bracket">Bracket</option>
                    <option value="team">Team</option>
                    <option value="special">Special</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Theme</FormLabel>
                  <Select
                    value={formData.theme}
                    onChange={(e) => handleChange("theme", e.target.value)}
                  >
                    <option value="speed">Speed</option>
                    <option value="accuracy">Accuracy</option>
                    <option value="endurance">Endurance</option>
                    <option value="mixed">Mixed</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Status</FormLabel>
                  <Select
                    value={formData.status}
                    onChange={(e) => handleChange("status", e.target.value)}
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </Select>
                </FormControl>
              </Grid>

              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Enter tournament description"
                  rows={3}
                  required
                />
              </FormControl>

              <Grid templateColumns="repeat(3, 1fr)" gap={4} w="full">
                <FormControl>
                  <FormLabel>Start Date</FormLabel>
                  <Input
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => handleChange("startDate", e.target.value)}
                    required
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>End Date</FormLabel>
                  <Input
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => handleChange("endDate", e.target.value)}
                    required
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Registration Deadline</FormLabel>
                  <Input
                    type="datetime-local"
                    value={formData.registrationDeadline}
                    onChange={(e) =>
                      handleChange("registrationDeadline", e.target.value)
                    }
                    required
                  />
                </FormControl>
              </Grid>

              <Grid templateColumns="repeat(2, 1fr)" gap={4} w="full">
                <FormControl>
                  <FormLabel>Time Limit (seconds)</FormLabel>
                  <NumberInput
                    value={formData.rules.timeLimit}
                    onChange={(value) =>
                      handleChange("rules.timeLimit", parseInt(value))
                    }
                    min={30}
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
                  <FormLabel>Max Participants</FormLabel>
                  <NumberInput
                    value={formData.rules.maxParticipants}
                    onChange={(value) =>
                      handleChange("rules.maxParticipants", parseInt(value))
                    }
                    min={2}
                    max={1000}
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
                <Text fontWeight="medium">Rules</Text>
                <Grid templateColumns="repeat(2, 1fr)" gap={4} w="full">
                  <FormControl display="flex" alignItems="center">
                    <FormLabel mb="0">Allow Backspace</FormLabel>
                    <Switch
                      isChecked={formData.rules.allowBackspace}
                      onChange={(e) =>
                        handleChange("rules.allowBackspace", e.target.checked)
                      }
                    />
                  </FormControl>

                  <FormControl display="flex" alignItems="center">
                    <FormLabel mb="0">Numbers Only</FormLabel>
                    <Switch
                      isChecked={formData.rules.numbersOnly}
                      onChange={(e) =>
                        handleChange("rules.numbersOnly", e.target.checked)
                      }
                    />
                  </FormControl>

                  <FormControl display="flex" alignItems="center">
                    <FormLabel mb="0">Special Characters</FormLabel>
                    <Switch
                      isChecked={formData.rules.specialCharacters}
                      onChange={(e) =>
                        handleChange(
                          "rules.specialCharacters",
                          e.target.checked
                        )
                      }
                    />
                  </FormControl>
                </Grid>
              </VStack>

              <HStack spacing={4} w="full" justify="flex-end">
                <Button variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" colorScheme="blue">
                  {tournament ? "Update Tournament" : "Create Tournament"}
                </Button>
              </HStack>
            </VStack>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
