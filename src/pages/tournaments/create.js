import React, { useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Switch,
  Button,
  useToast,
  useColorModeValue,
  SimpleGrid,
  Divider,
  Icon,
  Flex,
  Spinner,
} from "@chakra-ui/react";
import { FaTrophy, FaPlus, FaArrowLeft } from "react-icons/fa";
import { useRouter } from "next/router";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/navbar";

export default function CreateTournamentPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const toast = useToast();

  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "weekly",
    theme: "speed",
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

  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const loadingBg = useColorModeValue("gray.50", "gray.900");

  // Redirect if not authenticated (but only after loading is complete)
  React.useEffect(() => {
    if (!loading && !user) {
      router.push("/profile");
    }
  }, [user, loading, router]);

  const handleInputChange = (field, value) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch("/api/tournaments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Tournament Created!",
          description: "Your tournament has been created successfully.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        router.push(`/tournaments/${data.tournament._id}`);
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to create tournament",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error creating tournament:", error);
      toast({
        title: "Error",
        description: "Failed to create tournament",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const calculateEndDate = () => {
    if (formData.startDate) {
      const start = new Date(formData.startDate);
      const duration =
        formData.type === "weekly" ? 7 : formData.type === "bracket" ? 3 : 1;
      const end = new Date(start.getTime() + duration * 24 * 60 * 60 * 1000);
      return end.toISOString().slice(0, 16);
    }
    return "";
  };

  const calculateRegistrationDeadline = () => {
    if (formData.startDate) {
      const start = new Date(formData.startDate);
      const deadline = new Date(start.getTime() - 24 * 60 * 60 * 1000); // 1 day before
      return deadline.toISOString().slice(0, 16);
    }
    return "";
  };

  // Show loading spinner while authentication is being checked
  if (loading) {
    return (
      <>
        <Navbar />
        <Box
          bg={loadingBg}
          minH="100vh"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <VStack spacing={4}>
            <Spinner size="xl" color="teal.400" />
            <Text>Loading...</Text>
          </VStack>
        </Box>
      </>
    );
  }

  // If not authenticated, will redirect
  if (!user) {
    return null;
  }

  return (
    <>
      <Navbar />
      <Box bg={loadingBg} minH="100vh" p={6}>
        <VStack spacing={6} maxW="800px" mx="auto">
          {/* Header */}
          <Flex
            justify="space-between"
            align="center"
            w="full"
            wrap="wrap"
            gap={4}
          >
            <VStack align="start" spacing={1}>
              <HStack spacing={2}>
                <Icon as={FaTrophy} color="teal.400" boxSize={6} />
                <Heading size="lg">Create Tournament</Heading>
              </HStack>
              <Text color="gray.500">
                Set up a new tournament for the community
              </Text>
            </VStack>
            <Button
              leftIcon={<FaArrowLeft />}
              variant="ghost"
              onClick={() => router.push("/tournaments")}
            >
              Back to Tournaments
            </Button>
          </Flex>

          {/* Form */}
          <Box
            bg={cardBg}
            p={8}
            borderRadius="xl"
            w="full"
            boxShadow="lg"
            border="1px solid"
            borderColor={borderColor}
          >
            <form onSubmit={handleSubmit}>
              <VStack spacing={6}>
                {/* Basic Information */}
                <VStack spacing={4} w="full" align="stretch">
                  <Heading size="md">Basic Information</Heading>

                  <FormControl isRequired>
                    <FormLabel>Tournament Name</FormLabel>
                    <Input
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      placeholder="e.g., Weekly Speed Challenge"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Description</FormLabel>
                    <Textarea
                      value={formData.description}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                      placeholder="Describe your tournament..."
                      rows={3}
                    />
                  </FormControl>

                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <FormControl isRequired>
                      <FormLabel>Tournament Type</FormLabel>
                      <Select
                        value={formData.type}
                        onChange={(e) => {
                          handleInputChange("type", e.target.value);
                          // Auto-calculate end date
                          const newEndDate = calculateEndDate();
                          handleInputChange("endDate", newEndDate);
                          const newDeadline = calculateRegistrationDeadline();
                          handleInputChange(
                            "registrationDeadline",
                            newDeadline
                          );
                        }}
                      >
                        <option value="weekly">Weekly Tournament</option>
                        <option value="bracket">Bracket Competition</option>
                        <option value="team">Team Event</option>
                        <option value="special">Special Rules</option>
                      </Select>
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Theme</FormLabel>
                      <Select
                        value={formData.theme}
                        onChange={(e) =>
                          handleInputChange("theme", e.target.value)
                        }
                      >
                        <option value="speed">Speed Focus</option>
                        <option value="accuracy">Accuracy Focus</option>
                        <option value="endurance">Endurance Focus</option>
                        <option value="mixed">Mixed Skills</option>
                      </Select>
                    </FormControl>
                  </SimpleGrid>
                </VStack>

                <Divider />

                {/* Schedule */}
                <VStack spacing={4} w="full" align="stretch">
                  <Heading size="md">Schedule</Heading>

                  <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                    <FormControl isRequired>
                      <FormLabel>Start Date & Time</FormLabel>
                      <Input
                        type="datetime-local"
                        value={formData.startDate}
                        onChange={(e) => {
                          handleInputChange("startDate", e.target.value);
                          // Auto-calculate end date and deadline
                          const newEndDate = calculateEndDate();
                          handleInputChange("endDate", newEndDate);
                          const newDeadline = calculateRegistrationDeadline();
                          handleInputChange(
                            "registrationDeadline",
                            newDeadline
                          );
                        }}
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>End Date & Time</FormLabel>
                      <Input
                        type="datetime-local"
                        value={formData.endDate}
                        onChange={(e) =>
                          handleInputChange("endDate", e.target.value)
                        }
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Registration Deadline</FormLabel>
                      <Input
                        type="datetime-local"
                        value={formData.registrationDeadline}
                        onChange={(e) =>
                          handleInputChange(
                            "registrationDeadline",
                            e.target.value
                          )
                        }
                      />
                    </FormControl>
                  </SimpleGrid>
                </VStack>

                <Divider />

                {/* Rules */}
                <VStack spacing={4} w="full" align="stretch">
                  <Heading size="md">Tournament Rules</Heading>

                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <FormControl>
                      <FormLabel>Time Limit (seconds)</FormLabel>
                      <Input
                        type="number"
                        value={formData.rules.timeLimit}
                        onChange={(e) =>
                          handleInputChange(
                            "rules.timeLimit",
                            parseInt(e.target.value)
                          )
                        }
                        min="15"
                        max="300"
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Max Participants</FormLabel>
                      <Input
                        type="number"
                        value={formData.rules.maxParticipants}
                        onChange={(e) =>
                          handleInputChange(
                            "rules.maxParticipants",
                            parseInt(e.target.value)
                          )
                        }
                        min="2"
                        max="1000"
                      />
                    </FormControl>
                  </SimpleGrid>

                  <VStack spacing={3} align="stretch">
                    <FormControl display="flex" alignItems="center">
                      <FormLabel mb="0">Allow Backspace</FormLabel>
                      <Switch
                        isChecked={formData.rules.allowBackspace}
                        onChange={(e) =>
                          handleInputChange(
                            "rules.allowBackspace",
                            e.target.checked
                          )
                        }
                      />
                    </FormControl>

                    <FormControl display="flex" alignItems="center">
                      <FormLabel mb="0">Numbers Only</FormLabel>
                      <Switch
                        isChecked={formData.rules.numbersOnly}
                        onChange={(e) =>
                          handleInputChange(
                            "rules.numbersOnly",
                            e.target.checked
                          )
                        }
                      />
                    </FormControl>

                    <FormControl display="flex" alignItems="center">
                      <FormLabel mb="0">Special Characters</FormLabel>
                      <Switch
                        isChecked={formData.rules.specialCharacters}
                        onChange={(e) =>
                          handleInputChange(
                            "rules.specialCharacters",
                            e.target.checked
                          )
                        }
                      />
                    </FormControl>
                  </VStack>
                </VStack>

                <Divider />

                {/* Prizes */}
                <VStack spacing={4} w="full" align="stretch">
                  <Heading size="md">Prizes</Heading>

                  <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                    <FormControl>
                      <FormLabel>1st Place</FormLabel>
                      <Input
                        value={formData.prizes.firstPlace}
                        onChange={(e) =>
                          handleInputChange("prizes.firstPlace", e.target.value)
                        }
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>2nd Place</FormLabel>
                      <Input
                        value={formData.prizes.secondPlace}
                        onChange={(e) =>
                          handleInputChange(
                            "prizes.secondPlace",
                            e.target.value
                          )
                        }
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>3rd Place</FormLabel>
                      <Input
                        value={formData.prizes.thirdPlace}
                        onChange={(e) =>
                          handleInputChange("prizes.thirdPlace", e.target.value)
                        }
                      />
                    </FormControl>
                  </SimpleGrid>
                </VStack>

                {/* Submit Button */}
                <Button
                  type="submit"
                  colorScheme="teal"
                  size="lg"
                  leftIcon={<FaPlus />}
                  isLoading={submitting}
                  loadingText="Creating Tournament..."
                  w="full"
                >
                  Create Tournament
                </Button>
              </VStack>
            </form>
          </Box>
        </VStack>
      </Box>
    </>
  );
}
