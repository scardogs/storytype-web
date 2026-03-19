import { useState, useEffect, useCallback } from "react";
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
  useToast,
  Text,
  Avatar,
  Flex,
  Spinner,
  Alert,
  AlertIcon,
  useColorModeValue,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Divider,
  useBreakpointValue,
} from "@chakra-ui/react";
import { EditIcon, DeleteIcon, SearchIcon, ViewIcon } from "@chakra-ui/icons";
import AdminLayout from "../../components/admin/admin-layout";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const tableHeaderBg = useColorModeValue("gray.50", "gray.700");
  const isMobile = useBreakpointValue({ base: true, md: false });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, filterUsers]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/users", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      } else {
        setError("Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Failed to fetch users");
    } finally {
      setIsLoading(false);
    }
  };

  const filterUsers = useCallback(() => {
    if (!searchTerm) {
      setFilteredUsers(users);
      return;
    }

    const filtered = users.filter(
      (user) =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [users, searchTerm]);

  const handleEditUser = (user) => {
    setSelectedUser(user);
    onOpen();
  };

  // Mobile User Card Component
  const UserCard = ({ user }) => (
    <Card
      bg={bgColor}
      border="1px"
      borderColor={borderColor}
      borderRadius="lg"
      shadow="sm"
      _hover={{
        shadow: "md",
        transform: "translateY(-2px)",
        transition: "all 0.2s ease-in-out",
      }}
    >
      <CardBody p={4}>
        <VStack spacing={3} align="stretch">
          <Flex justify="space-between" align="center">
            <HStack spacing={3}>
              <Avatar size="sm" src={user.profilePicture} />
              <VStack align="flex-start" spacing={0}>
                <Text fontWeight="medium" fontSize="sm">
                  {user.username}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  ID: {user._id.slice(-8)}
                </Text>
              </VStack>
            </HStack>
            <HStack spacing={2}>
              <IconButton
                aria-label="View user"
                icon={<ViewIcon />}
                size="sm"
                variant="outline"
                colorScheme="blue"
                onClick={() => handleEditUser(user)}
                _hover={{ bg: "blue.50", transform: "scale(1.05)" }}
              />
              <IconButton
                aria-label="Edit user"
                icon={<EditIcon />}
                size="sm"
                variant="outline"
                colorScheme="green"
                onClick={() => handleEditUser(user)}
                _hover={{ bg: "green.50", transform: "scale(1.05)" }}
              />
              <IconButton
                aria-label="Delete user"
                icon={<DeleteIcon />}
                size="sm"
                variant="outline"
                colorScheme="red"
                onClick={() => handleDeleteUser(user._id)}
                _hover={{ bg: "red.50", transform: "scale(1.05)" }}
              />
            </HStack>
          </Flex>

          <Divider />

          <VStack spacing={2} align="stretch">
            <Text fontSize="xs" color="gray.600">
              <Text as="span" fontWeight="medium">
                Email:
              </Text>{" "}
              {user.email}
            </Text>
            <Text fontSize="xs" color="gray.600">
              <Text as="span" fontWeight="medium">
                Games:
              </Text>{" "}
              {user.stats.totalGamesPlayed}
            </Text>
            <Text fontSize="xs" color="gray.600">
              <Text as="span" fontWeight="medium">
                Best WPM:
              </Text>{" "}
              {user.stats.bestWPM}
            </Text>
            <Text fontSize="xs" color="gray.600">
              <Text as="span" fontWeight="medium">
                Joined:
              </Text>{" "}
              {new Date(user.createdAt).toLocaleDateString()}
            </Text>
          </VStack>
        </VStack>
      </CardBody>
    </Card>
  );

  const handleDeleteUser = async (userId) => {
    if (!confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        toast({
          title: "User deleted successfully",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
        fetchUsers(); // Refresh the list
      } else {
        toast({
          title: "Failed to delete user",
          status: "error",
          duration: 2000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error deleting user",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const handleSaveUser = async (userData) => {
    try {
      const response = await fetch(`/api/admin/users/${selectedUser._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        toast({
          title: "User updated successfully",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
        onClose();
        fetchUsers(); // Refresh the list
      } else {
        toast({
          title: "Failed to update user",
          status: "error",
          duration: 2000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        title: "Error updating user",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title="User Management">
        <Flex align="center" justify="center" h="400px">
          <Spinner size="xl" />
        </Flex>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="User Management">
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="User Management">
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box>
          <Heading size={{ base: "md", md: "lg" }} mb={2}>
            User Management
          </Heading>
          <Text color="gray.600" fontSize={{ base: "sm", md: "md" }}>
            Manage registered users and their accounts
          </Text>
        </Box>

        {/* Search and Filters */}
        <Box>
          <Input
            placeholder="Search users by username or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<SearchIcon />}
            bg={bgColor}
            borderColor={borderColor}
            size={{ base: "md", md: "lg" }}
            borderRadius="lg"
            _focus={{
              borderColor: "blue.400",
              boxShadow: "0 0 0 1px blue.400",
            }}
            _hover={{
              borderColor: "gray.400",
            }}
          />
        </Box>

        {/* Users Display */}
        {isMobile ? (
          // Mobile Card View
          <VStack spacing={4} align="stretch">
            {filteredUsers.map((user) => (
              <UserCard key={user._id} user={user} />
            ))}
            {filteredUsers.length === 0 && (
              <Box textAlign="center" py={8}>
                <Text color="gray.500">No users found</Text>
              </Box>
            )}
          </VStack>
        ) : (
          // Desktop Table View
          <Box
            bg={bgColor}
            border="1px"
            borderColor={borderColor}
            borderRadius="lg"
            overflow="hidden"
            shadow="sm"
          >
            <Table variant="simple">
              <Thead bg={tableHeaderBg}>
                <Tr>
                  <Th>User</Th>
                  <Th>Email</Th>
                  <Th>Stats</Th>
                  <Th>Joined</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredUsers.map((user) => (
                  <Tr key={user._id}>
                    <Td>
                      <HStack spacing={3}>
                        <Avatar size="sm" src={user.profilePicture} />
                        <VStack align="flex-start" spacing={0}>
                          <Text fontWeight="medium">{user.username}</Text>
                          <Text fontSize="sm" color="gray.500">
                            ID: {user._id.slice(-8)}
                          </Text>
                        </VStack>
                      </HStack>
                    </Td>
                    <Td>{user.email}</Td>
                    <Td>
                      <VStack align="flex-start" spacing={1}>
                        <Text fontSize="sm">
                          Games: {user.stats.totalGamesPlayed}
                        </Text>
                        <Text fontSize="sm">
                          Best WPM: {user.stats.bestWPM}
                        </Text>
                      </VStack>
                    </Td>
                    <Td>
                      <Text fontSize="sm">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </Text>
                    </Td>
                    <Td>
                      <HStack spacing={2}>
                        <IconButton
                          aria-label="View user"
                          icon={<ViewIcon />}
                          size="sm"
                          variant="outline"
                          colorScheme="blue"
                          onClick={() => handleEditUser(user)}
                          _hover={{ bg: "blue.50", transform: "scale(1.05)" }}
                        />
                        <IconButton
                          aria-label="Edit user"
                          icon={<EditIcon />}
                          size="sm"
                          variant="outline"
                          colorScheme="green"
                          onClick={() => handleEditUser(user)}
                          _hover={{ bg: "green.50", transform: "scale(1.05)" }}
                        />
                        <IconButton
                          aria-label="Delete user"
                          icon={<DeleteIcon />}
                          size="sm"
                          variant="outline"
                          colorScheme="red"
                          onClick={() => handleDeleteUser(user._id)}
                          _hover={{ bg: "red.50", transform: "scale(1.05)" }}
                        />
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
            {filteredUsers.length === 0 && (
              <Box textAlign="center" py={8}>
                <Text color="gray.500">No users found</Text>
              </Box>
            )}
          </Box>
        )}

        {/* Edit User Modal */}
        <EditUserModal
          isOpen={isOpen}
          onClose={onClose}
          user={selectedUser}
          onSave={handleSaveUser}
        />
      </VStack>
    </AdminLayout>
  );
}

// Edit User Modal Component
function EditUserModal({ isOpen, onClose, user, onSave }) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    stats: {
      totalGamesPlayed: 0,
      bestWPM: 0,
      averageWPM: 0,
      bestAccuracy: 0,
      totalWordsTyped: 0,
    },
  });

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        email: user.email,
        stats: user.stats,
      });
    }
  }, [user]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (field, value) => {
    if (field.startsWith("stats.")) {
      const statField = field.split(".")[1];
      setFormData({
        ...formData,
        stats: {
          ...formData.stats,
          [statField]: value,
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
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit User</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Username</FormLabel>
                <Input
                  value={formData.username}
                  onChange={(e) => handleChange("username", e.target.value)}
                  placeholder="Enter username"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="Enter email"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Total Games Played</FormLabel>
                <Input
                  type="number"
                  value={formData.stats.totalGamesPlayed}
                  onChange={(e) =>
                    handleChange(
                      "stats.totalGamesPlayed",
                      parseInt(e.target.value)
                    )
                  }
                />
              </FormControl>

              <FormControl>
                <FormLabel>Best WPM</FormLabel>
                <Input
                  type="number"
                  value={formData.stats.bestWPM}
                  onChange={(e) =>
                    handleChange("stats.bestWPM", parseInt(e.target.value))
                  }
                />
              </FormControl>

              <FormControl>
                <FormLabel>Average WPM</FormLabel>
                <Input
                  type="number"
                  value={formData.stats.averageWPM}
                  onChange={(e) =>
                    handleChange("stats.averageWPM", parseInt(e.target.value))
                  }
                />
              </FormControl>

              <FormControl>
                <FormLabel>Best Accuracy (%)</FormLabel>
                <Input
                  type="number"
                  value={formData.stats.bestAccuracy}
                  onChange={(e) =>
                    handleChange("stats.bestAccuracy", parseInt(e.target.value))
                  }
                />
              </FormControl>

              <FormControl>
                <FormLabel>Total Words Typed</FormLabel>
                <Input
                  type="number"
                  value={formData.stats.totalWordsTyped}
                  onChange={(e) =>
                    handleChange(
                      "stats.totalWordsTyped",
                      parseInt(e.target.value)
                    )
                  }
                />
              </FormControl>

              <HStack spacing={4} w="full" justify="flex-end">
                <Button variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" colorScheme="blue">
                  Save Changes
                </Button>
              </HStack>
            </VStack>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
