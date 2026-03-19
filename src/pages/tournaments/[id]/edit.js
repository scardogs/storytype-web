import React, { useState, useEffect, useCallback } from "react";
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
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { FaTrophy, FaSave, FaArrowLeft } from "react-icons/fa";
import { useRouter } from "next/router";
import { useAuth } from "../../../context/AuthContext";
import Navbar from "../../../components/navbar";

export default function EditTournamentPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user, loading: authLoading } = useAuth();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState(null);

  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const pageBg = useColorModeValue("gray.50", "gray.900");

  const fetchTournament = useCallback(async () => {
    try {
      const response = await fetch(`/api/tournaments/${id}`);
      const data = await response.json();

      if (data.success) {
        const t = data.tournament;

        // Check if current user is the creator
        if (user && t.createdBy._id !== user.id) {
          setError("You are not authorized to edit this tournament.");
          return;
        }

        if (t.status !== "upcoming") {
          setError("Only upcoming tournaments can be edited.");
          return;
        }

        setFormData({
          name: t.name,
          description: t.description,
          type: t.type,
          theme: t.theme,
          rules: { ...t.rules },
          prizes: { ...t.prizes },
          startDate: new Date(t.startDate).toISOString().slice(0, 16),
          endDate: new Date(t.endDate).toISOString().slice(0, 16),
          registrationDeadline: new Date(t.registrationDeadline)
            .toISOString()
            .slice(0, 16),
        });
      } else {
        setError("Tournament not found.");
      }
    } catch (err) {
      console.error("Error fetching tournament:", err);
      setError("Failed to load tournament.");
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    if (id && user) {
      fetchTournament();
    }
  }, [id, user, fetchTournament]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/profile");
    }
  }, [user, authLoading, router]);

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
      const response = await fetch(`/api/tournaments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Tournament updated!",
          status: "success",
          duration: 3000,
        });
        router.push(`/tournaments/${id}`);
      } else {
        toast({
          title: data.message || "Failed to update",
          status: "error",
          duration: 3000,
        });
      }
    } catch (err) {
      console.error("Error updating tournament:", err);
      toast({
        title: "Failed to update tournament",
        status: "error",
        duration: 3000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <>
        <Navbar />
        <Flex justify="center" align="center" minH="400px" bg={pageBg}>
          <Spinner size="xl" color="teal.400" />
        </Flex>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <Box bg={pageBg} minH="100vh" p={6}>
          <VStack spacing={4} maxW="800px" mx="auto">
            <Alert status="error" borderRadius="lg">
              <AlertIcon />
              {error}
            </Alert>
            <Button
              leftIcon={<FaArrowLeft />}
              onClick={() => router.push(`/tournaments/${id}`)}
            >
              Back to Tournament
            </Button>
          </VStack>
        </Box>
      </>
    );
  }

  if (!formData) return null;

  return (
    <>
      <Navbar />
      <Box bg={pageBg} minH="100vh" p={6}>
        <VStack spacing={6} maxW="800px" mx="auto">
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
                <Heading size="lg">Edit Tournament</Heading>
              </HStack>
              <Text color="gray.500">Update tournament settings</Text>
            </VStack>
            <Button
              leftIcon={<FaArrowLeft />}
              variant="ghost"
              onClick={() => router.push(`/tournaments/${id}`)}
            >
              Back to Tournament
            </Button>
          </Flex>

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
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Description</FormLabel>
                    <Textarea
                      value={formData.description}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                      rows={3}
                    />
                  </FormControl>

                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <FormControl isRequired>
                      <FormLabel>Tournament Type</FormLabel>
                      <Select
                        value={formData.type}
                        onChange={(e) =>
                          handleInputChange("type", e.target.value)
                        }
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
                        onChange={(e) =>
                          handleInputChange("startDate", e.target.value)
                        }
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
                          handleInputChange(
                            "prizes.firstPlace",
                            e.target.value
                          )
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
                          handleInputChange(
                            "prizes.thirdPlace",
                            e.target.value
                          )
                        }
                      />
                    </FormControl>
                  </SimpleGrid>
                </VStack>

                <Button
                  type="submit"
                  colorScheme="teal"
                  size="lg"
                  leftIcon={<FaSave />}
                  isLoading={submitting}
                  loadingText="Saving..."
                  w="full"
                >
                  Save Changes
                </Button>
              </VStack>
            </form>
          </Box>
        </VStack>
      </Box>
    </>
  );
}
