import React, { useEffect, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Select,
  Spinner,
  Text,
  Textarea,
  VStack,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import Navbar from "./navbar";
import { useAuth } from "../context/AuthContext";

function formatDate(value) {
  return new Date(value).toLocaleDateString();
}

export default function SuggestionsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    category: "feature",
    description: "",
  });

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/suggestions");
      const data = await response.json();

      if (response.ok && data.success) {
        setSuggestions(data.suggestions || []);
      }
    } catch (error) {
      console.error("Suggestions fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!user) {
      router.push("/profile?tab=login");
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch("/api/suggestions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to submit suggestion");
      }

      setFormData({
        title: "",
        category: "feature",
        description: "",
      });
      setSuggestions((prev) => [data.suggestion, ...prev].slice(0, 50));
      onClose();
      toast({
        title: "Suggestion submitted",
        description: "Your idea is now on the suggestion board.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Could not submit suggestion",
        description: error.message,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <Box minH="100vh" bg="gray.900" py={{ base: 6, md: 10 }}>
        <Container maxW="6xl">
          <VStack spacing={6} align="stretch">
            <Box
              bg="linear-gradient(135deg, rgba(45,212,191,0.16), rgba(17,24,39,0.96))"
              border="1px solid"
              borderColor="teal.900"
              borderRadius="3xl"
              p={{ base: 6, md: 8 }}
              boxShadow="2xl"
            >
              <VStack align="start" spacing={3}>
                <Badge colorScheme="teal" borderRadius="full" px={3} py={1}>
                  Community
                </Badge>
                <Heading color="white" size={{ base: "lg", md: "xl" }}>
                  Suggestion Board
                </Heading>
                <Text color="gray.300" maxW="720px">
                  Drop product ideas, UI improvements, typing modes, and quality-of-life
                  requests in one place. Recent suggestions stay visible so users can
                  see what should be built next.
                </Text>
                <Button
                  colorScheme="teal"
                  onClick={() => {
                    if (!user) {
                      router.push("/profile?tab=login");
                      return;
                    }
                    onOpen();
                  }}
                >
                  {user ? "Submit a Suggestion" : "Login to Submit"}
                </Button>
              </VStack>
            </Box>

            <Box
              bg="gray.800"
              border="1px solid"
              borderColor="whiteAlpha.140"
              borderRadius="2xl"
              p={{ base: 4, md: 6 }}
              boxShadow="xl"
            >
              <VStack align="stretch" spacing={4}>
                <Heading size="md" color="white">
                  Recent Suggestions
                </Heading>
                {loading ? (
                  <Box py={8} textAlign="center">
                    <Spinner color="teal.300" />
                  </Box>
                ) : suggestions.length === 0 ? (
                  <Text color="gray.400">No suggestions yet.</Text>
                ) : (
                  suggestions.map((suggestion) => (
                    <Box
                      key={suggestion.id}
                      bg="whiteAlpha.040"
                      border="1px solid"
                      borderColor="whiteAlpha.100"
                      borderRadius="xl"
                      p={4}
                    >
                      <VStack align="stretch" spacing={2}>
                        <HStack justify="space-between" align={{ base: "start", md: "center" }} flexDir={{ base: "column", md: "row" }}>
                          <Heading size="sm" color="white">
                            {suggestion.title}
                          </Heading>
                          <HStack spacing={2}>
                            <Badge colorScheme="teal">{suggestion.category}</Badge>
                            <Badge colorScheme="purple">{suggestion.status}</Badge>
                          </HStack>
                        </HStack>
                        <Text color="gray.300">{suggestion.description}</Text>
                        <Text color="gray.500" fontSize="sm">
                          {suggestion.authorName} • {formatDate(suggestion.createdAt)}
                        </Text>
                      </VStack>
                    </Box>
                  ))
                )}
              </VStack>
            </Box>
          </VStack>
        </Container>
      </Box>
      <Modal isOpen={isOpen} onClose={onClose} isCentered size="xl">
        <ModalOverlay />
        <ModalContent bg="gray.800" border="1px solid" borderColor="whiteAlpha.140">
          <ModalHeader color="white">Submit a Suggestion</ModalHeader>
          <ModalCloseButton color="gray.400" />
          <ModalBody pb={6}>
            <form onSubmit={handleSubmit}>
              <VStack align="stretch" spacing={4}>
                <Text color="gray.400" fontSize="sm">
                  Write a focused idea with enough detail to build from.
                </Text>

                <FormControl>
                  <FormLabel color="gray.300">Title</FormLabel>
                  <Input
                    value={formData.title}
                    onChange={(event) =>
                      setFormData((prev) => ({ ...prev, title: event.target.value }))
                    }
                    placeholder="Example: Add private tournament rooms"
                    maxLength={120}
                    bg="gray.900"
                    borderColor="gray.600"
                    color="white"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel color="gray.300">Category</FormLabel>
                  <Select
                    value={formData.category}
                    onChange={(event) =>
                      setFormData((prev) => ({ ...prev, category: event.target.value }))
                    }
                    bg="gray.900"
                    borderColor="gray.600"
                    color="white"
                  >
                    <option value="feature">Feature</option>
                    <option value="ui">UI</option>
                    <option value="training">Training</option>
                    <option value="tournament">Tournament</option>
                    <option value="chat">Chat</option>
                    <option value="bugfix">Bug Fix</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel color="gray.300">Description</FormLabel>
                  <Textarea
                    value={formData.description}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: event.target.value,
                      }))
                    }
                    placeholder="Describe the problem and the improvement you want."
                    minH="140px"
                    maxLength={1200}
                    bg="gray.900"
                    borderColor="gray.600"
                    color="white"
                  />
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="teal"
                  alignSelf="start"
                  isLoading={submitting}
                >
                  Submit Suggestion
                </Button>
              </VStack>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
