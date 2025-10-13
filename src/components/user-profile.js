import React, { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Box,
  Flex,
  Heading,
  Input,
  Button,
  VStack,
  HStack,
  Text,
  Avatar,
  useColorModeValue,
  useToast,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Divider,
  Badge,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Icon,
} from "@chakra-ui/react";
import { FaCamera, FaSave, FaSignOutAlt, FaTrophy } from "react-icons/fa";

export default function UserProfile() {
  const { user, logout, updateProfile } = useAuth();
  const cardBg = useColorModeValue("gray.50", "gray.800");
  const inputBg = useColorModeValue("gray.100", "gray.700");
  const toast = useToast();
  const fileInputRef = useRef(null);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(user?.profilePicture || "");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB",
          status: "error",
          duration: 3000,
        });
        return;
      }

      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file",
          status: "error",
          duration: 3000,
        });
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);

    const data = new FormData();
    data.append("username", formData.username);
    
    if (selectedFile) {
      data.append("profilePicture", selectedFile);
    }

    const result = await updateProfile(data);

    setLoading(false);

    if (result.success) {
      toast({
        title: "Profile updated!",
        description: "Your profile has been updated successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setIsEditing(false);
      setSelectedFile(null);
    } else {
      toast({
        title: "Update failed",
        description: result.error,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleCancel = () => {
    setFormData({ username: user?.username || "" });
    setPreviewUrl(user?.profilePicture || "");
    setSelectedFile(null);
    setErrors({});
    setIsEditing(false);
  };

  return (
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      bg={useColorModeValue("gray.100", "gray.900")}
      px={4}
      py={8}
    >
      <Box
        w={{ base: "100%", sm: "90%", md: "700px" }}
        bg={cardBg}
        boxShadow="2xl"
        borderRadius="2xl"
        p={{ base: 4, md: 8 }}
      >
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <Flex justify="space-between" align="center">
            <Heading size="lg" color="teal.300">
              My Profile
            </Heading>
            <Button
              leftIcon={<FaSignOutAlt />}
              colorScheme="red"
              variant="outline"
              size="sm"
              onClick={logout}
            >
              Logout
            </Button>
          </Flex>

          <Divider />

          {/* Profile Picture Section */}
          <VStack spacing={4}>
            <Box position="relative">
              <Avatar
                size="2xl"
                src={previewUrl}
                name={user?.username}
                bg="teal.500"
              />
              {isEditing && (
                <Button
                  position="absolute"
                  bottom={0}
                  right={0}
                  size="sm"
                  borderRadius="full"
                  colorScheme="teal"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Icon as={FaCamera} />
                </Button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
            </Box>

            {!isEditing && (
              <VStack spacing={1}>
                <Heading size="md">{user?.username}</Heading>
                <Text color="gray.400">{user?.email}</Text>
                <Badge colorScheme="teal" fontSize="sm">
                  Active Member
                </Badge>
              </VStack>
            )}
          </VStack>

          {/* Edit Form */}
          {isEditing ? (
            <form onSubmit={handleSubmit}>
              <VStack spacing={4} align="stretch">
                <FormControl isInvalid={errors.username}>
                  <FormLabel>Username</FormLabel>
                  <Input
                    name="username"
                    bg={inputBg}
                    value={formData.username}
                    onChange={handleChange}
                  />
                  <FormErrorMessage>{errors.username}</FormErrorMessage>
                </FormControl>

                <FormControl>
                  <FormLabel>Email</FormLabel>
                  <Input bg={inputBg} value={user?.email} isReadOnly />
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    Email cannot be changed
                  </Text>
                </FormControl>

                {selectedFile && (
                  <Text fontSize="sm" color="teal.300">
                    New image selected: {selectedFile.name}
                  </Text>
                )}

                <HStack spacing={3}>
                  <Button
                    type="submit"
                    leftIcon={<FaSave />}
                    colorScheme="teal"
                    flex={1}
                    isLoading={loading}
                    loadingText="Saving..."
                  >
                    Save Changes
                  </Button>
                  <Button
                    variant="outline"
                    colorScheme="gray"
                    flex={1}
                    onClick={handleCancel}
                    isDisabled={loading}
                  >
                    Cancel
                  </Button>
                </HStack>
              </VStack>
            </form>
          ) : (
            <Button
              colorScheme="teal"
              variant="outline"
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </Button>
          )}

          <Divider />

          {/* Stats Section */}
          <Box>
            <Heading size="md" mb={4} color="teal.300">
              <Icon as={FaTrophy} mr={2} />
              Statistics
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <Stat
                p={4}
                bg={inputBg}
                borderRadius="lg"
                border="1px"
                borderColor="teal.500"
              >
                <StatLabel>Games Played</StatLabel>
                <StatNumber>{user?.stats?.totalGamesPlayed || 0}</StatNumber>
                <StatHelpText>Total matches</StatHelpText>
              </Stat>

              <Stat
                p={4}
                bg={inputBg}
                borderRadius="lg"
                border="1px"
                borderColor="teal.500"
              >
                <StatLabel>Best WPM</StatLabel>
                <StatNumber>{user?.stats?.bestWPM || 0}</StatNumber>
                <StatHelpText>Words per minute</StatHelpText>
              </Stat>

              <Stat
                p={4}
                bg={inputBg}
                borderRadius="lg"
                border="1px"
                borderColor="teal.500"
              >
                <StatLabel>Average WPM</StatLabel>
                <StatNumber>{user?.stats?.averageWPM || 0}</StatNumber>
                <StatHelpText>Average speed</StatHelpText>
              </Stat>

              <Stat
                p={4}
                bg={inputBg}
                borderRadius="lg"
                border="1px"
                borderColor="teal.500"
              >
                <StatLabel>Best Accuracy</StatLabel>
                <StatNumber>{user?.stats?.bestAccuracy || 0}%</StatNumber>
                <StatHelpText>Highest score</StatHelpText>
              </Stat>
            </SimpleGrid>
          </Box>
        </VStack>
      </Box>
    </Flex>
  );
}

