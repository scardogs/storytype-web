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
  ModalFooter,
  FormControl,
  FormLabel,
  Textarea,
  Select,
  useToast,
  Text,
  Avatar,
  Flex,
  Skeleton,
  Alert,
  AlertIcon,
  Card,
  CardBody,
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
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const toast = useToast();

  const bgColor = "gray.800";
  const borderColor = "gray.700";
  const tableHeaderBg = "gray.700";
  const isMobile = useBreakpointValue({ base: true, md: false });

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

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, filterUsers]);

  const handleEditUser = (user) => {
    setSelectedUser(user);
    onOpen();
  };

  const handleToggleProStatus = async (user) => {
    try {
      const response = await fetch(`/api/admin/users/${user._id}/pro`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ isPro: !(user.plan === "pro" && user.proStatus === "active") }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to update StoryType Pro");
      }

      toast({
        title: data.message,
        status: "success",
        duration: 2500,
        isClosable: true,
      });

      if (selectedUser && selectedUser._id === user._id) {
        setSelectedUser((prev) =>
          prev
            ? {
                ...prev,
                plan: data.user.plan,
                proStatus: data.user.proStatus,
                proGrantedAt: data.user.proGrantedAt,
                proSource: data.user.proSource,
              }
            : prev
        );
      }

      fetchUsers();
    } catch (error) {
      toast({
        title: error.message || "Failed to update StoryType Pro",
        status: "error",
        duration: 2500,
        isClosable: true,
      });
    }
  };

  // Mobile User Card Component
  const UserCard = ({ user }) => (
    <Card
      bg={bgColor}
      border="1px"
      borderColor={borderColor}
      borderRadius="xl"
      shadow="0 12px 30px rgba(0, 0, 0, 0.3)"
      _hover={{
        borderColor: "teal.400",
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
                <Text fontWeight="semibold" fontSize="sm" color="gray.100">
                  {user.username}
                </Text>
                <HStack spacing={2}>
                  <Text fontSize="xs" color="gray.500">
                    ID: {user._id.slice(-8)}
                  </Text>
                  {user.plan === "pro" && user.proStatus === "active" ? (
                    <Badge colorScheme="yellow">PRO</Badge>
                  ) : null}
                </HStack>
              </VStack>
            </HStack>
            <HStack spacing={2}>
              <IconButton
                aria-label="View user"
                icon={<ViewIcon />}
                size="sm"
                variant="ghost"
                color="blue.300"
                bg="blue.500"
                bgOpacity={0.08}
                onClick={() => handleEditUser(user)}
                _hover={{ bg: "blue.500", bgOpacity: 0.18, transform: "scale(1.05)" }}
              />
              <IconButton
                aria-label="Edit user"
                icon={<EditIcon />}
                size="sm"
                variant="ghost"
                color="teal.300"
                bg="teal.500"
                bgOpacity={0.08}
                onClick={() => handleEditUser(user)}
                _hover={{ bg: "teal.500", bgOpacity: 0.18, transform: "scale(1.05)" }}
              />
              <IconButton
                aria-label="Delete user"
                icon={<DeleteIcon />}
                size="sm"
                variant="ghost"
                color="red.300"
                bg="red.500"
                bgOpacity={0.08}
                onClick={() => handleDeleteUser(user._id)}
                _hover={{ bg: "red.500", bgOpacity: 0.18, transform: "scale(1.05)" }}
              />
            </HStack>
          </Flex>

          <Divider borderColor="gray.700" />

          <VStack spacing={2} align="stretch">
            <Text fontSize="xs" color="gray.400">
              <Text as="span" fontWeight="medium">
                Email:
              </Text>{" "}
              {user.email}
            </Text>
            <Text fontSize="xs" color="gray.400">
              <Text as="span" fontWeight="medium">
                Games:
              </Text>{" "}
              {user.stats.totalGamesPlayed}
            </Text>
            <Text fontSize="xs" color="gray.400">
              <Text as="span" fontWeight="medium">
                Best WPM:
              </Text>{" "}
              {user.stats.bestWPM}
            </Text>
            <Text fontSize="xs" color="gray.400">
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

  const handleDeleteUser = (userId) => {
    setDeleteTargetId(userId);
    setDeleteConfirmText("");
    onDeleteOpen();
  };

  const confirmDeleteUser = async () => {
    if (deleteConfirmText !== "delete") return;

    try {
      const response = await fetch(`/api/admin/users/${deleteTargetId}`, {
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
        fetchUsers();
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
    } finally {
      onDeleteClose();
      setDeleteTargetId(null);
      setDeleteConfirmText("");
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
      <AdminLayout title="User Management">
        <Alert status="error" bg="red.900" color="red.100" borderRadius="xl" border="1px solid" borderColor="red.700">
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
        <Box
          bgGradient="linear(to-r, gray.800, gray.800, blue.900)"
          border="1px solid"
          borderColor="gray.700"
          borderRadius="2xl"
          p={{ base: 5, md: 6 }}
          boxShadow="0 12px 34px rgba(0,0,0,0.28)"
        >
          <Heading size={{ base: "md", md: "lg" }} mb={2} color="gray.100" letterSpacing="-0.01em">
            User Management
          </Heading>
          <Text color="gray.400" fontSize={{ base: "sm", md: "md" }}>
            Manage registered users and their accounts
          </Text>
        </Box>

        {/* Search and Filters */}
        <Box bg="gray.800" border="1px solid" borderColor="gray.700" borderRadius="xl" p={4}>
          <Input
            placeholder="Search users by username or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<SearchIcon />}
            bg="gray.900"
            borderColor={borderColor}
            size={{ base: "md", md: "lg" }}
            borderRadius="lg"
            _focus={{
              borderColor: "teal.400",
              boxShadow: "0 0 0 1px rgba(56, 178, 172, 0.65)",
            }}
            _hover={{
              borderColor: "gray.500",
            }}
            color="gray.100"
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
              <Box textAlign="center" py={8} bg="gray.800" borderRadius="xl" border="1px solid" borderColor="gray.700">
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
            borderRadius="2xl"
            overflow="hidden"
            shadow="0 12px 34px rgba(0,0,0,0.28)"
          >
            <Table variant="simple">
              <Thead bg={tableHeaderBg}>
                <Tr>
                  <Th color="gray.400">User</Th>
                  <Th color="gray.400">Email</Th>
                  <Th color="gray.400">Stats</Th>
                  <Th color="gray.400">Joined</Th>
                  <Th color="gray.400">Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredUsers.map((user) => (
                  <Tr key={user._id} _hover={{ bg: "whiteAlpha.50" }}>
                    <Td>
                      <HStack spacing={3}>
                        <Avatar size="sm" src={user.profilePicture} />
                        <VStack align="flex-start" spacing={0}>
                          <HStack spacing={2}>
                            <Text fontWeight="semibold" color="gray.100">{user.username}</Text>
                            {user.plan === "pro" && user.proStatus === "active" ? (
                              <Badge colorScheme="yellow">PRO</Badge>
                            ) : null}
                          </HStack>
                          <Text fontSize="sm" color="gray.500">
                            ID: {user._id.slice(-8)}
                          </Text>
                        </VStack>
                      </HStack>
                    </Td>
                    <Td color="gray.300">{user.email}</Td>
                    <Td>
                      <VStack align="flex-start" spacing={1}>
                        <Text fontSize="sm" color="gray.300">
                          Games: {user.stats.totalGamesPlayed}
                        </Text>
                        <Text fontSize="sm" color="gray.300">
                          Best WPM: {user.stats.bestWPM}
                        </Text>
                      </VStack>
                    </Td>
                    <Td>
                      <Text fontSize="sm" color="gray.400">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </Text>
                    </Td>
                    <Td>
                      <HStack spacing={2}>
                        <IconButton
                          aria-label="View user"
                          icon={<ViewIcon />}
                          size="sm"
                          variant="ghost"
                          color="blue.300"
                          bg="blue.500"
                          bgOpacity={0.08}
                          onClick={() => handleEditUser(user)}
                          _hover={{ bg: "blue.500", bgOpacity: 0.18, transform: "scale(1.05)" }}
                        />
                        <IconButton
                          aria-label="Edit user"
                          icon={<EditIcon />}
                          size="sm"
                          variant="ghost"
                          color="teal.300"
                          bg="teal.500"
                          bgOpacity={0.08}
                          onClick={() => handleEditUser(user)}
                          _hover={{ bg: "teal.500", bgOpacity: 0.18, transform: "scale(1.05)" }}
                        />
                        <IconButton
                          aria-label="Delete user"
                          icon={<DeleteIcon />}
                          size="sm"
                          variant="ghost"
                          color="red.300"
                          bg="red.500"
                          bgOpacity={0.08}
                          onClick={() => handleDeleteUser(user._id)}
                          _hover={{ bg: "red.500", bgOpacity: 0.18, transform: "scale(1.05)" }}
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
          onTogglePro={handleToggleProStatus}
        />

        {/* Delete Confirmation Modal */}
        <Modal isOpen={isDeleteOpen} onClose={onDeleteClose} isCentered>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Delete User</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4} align="stretch">
                <Alert status="warning" borderRadius="md">
                  <AlertIcon />
                  This action is permanent and cannot be undone. All user data,
                  typing records, and tournament participation will be removed.
                </Alert>
                <Text>
                  Type{" "}
                  <Text as="span" fontWeight="bold" color="red.400">
                    delete
                  </Text>{" "}
                  to confirm.
                </Text>
                <Input
                  placeholder='Type "delete" to confirm'
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  autoFocus
                />
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onDeleteClose}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={confirmDeleteUser}
                isDisabled={deleteConfirmText !== "delete"}
              >
                Delete User
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </VStack>
    </AdminLayout>
  );
}

// Edit User Modal Component
function EditUserModal({ isOpen, onClose, user, onSave, onTogglePro }) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    plan: "free",
    proStatus: "inactive",
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
        plan: user.plan || "free",
        proStatus: user.proStatus || "inactive",
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

              <Box
                w="full"
                border="1px solid"
                borderColor="gray.200"
                borderRadius="lg"
                p={4}
              >
                <HStack justify="space-between" align={{ base: "start", md: "center" }} flexWrap="wrap" spacing={3}>
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="bold">StoryType Pro</Text>
                    <Text fontSize="sm" color="gray.500">
                      {formData.plan === "pro" && formData.proStatus === "active"
                        ? "This user has active Pro analytics access."
                        : "This user is currently on the free plan."}
                    </Text>
                  </VStack>
                  <Button
                    type="button"
                    colorScheme={formData.plan === "pro" && formData.proStatus === "active" ? "red" : "yellow"}
                    variant="outline"
                    onClick={() => onTogglePro(user)}
                  >
                    {formData.plan === "pro" && formData.proStatus === "active"
                      ? "Remove Pro"
                      : "Grant Pro"}
                  </Button>
                </HStack>
              </Box>

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
