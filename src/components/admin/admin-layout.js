import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Flex,
  Text,
  Button,
  IconButton,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  VStack,
  HStack,
  Divider,
  useColorModeValue,
  Badge,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useToast,
} from "@chakra-ui/react";
import {
  HamburgerIcon,
  SettingsIcon,
  ChevronDownIcon,
  CloseIcon,
} from "@chakra-ui/icons";
import { useRouter } from "next/router";
import Link from "next/link";

const AdminLayout = ({ children, title = "Admin Dashboard" }) => {
  const [admin, setAdmin] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const router = useRouter();
  const toast = useToast();
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const loadingBg = useColorModeValue("gray.50", "gray.900");
  const sidebarBg = useColorModeValue("gray.50", "gray.700");
  const headerBg = useColorModeValue("white", "gray.800");

  const menuItems = [
    { name: "Dashboard", path: "/admin", icon: "📊" },
    {
      name: "Users",
      path: "/admin/users",
      icon: "👥",
      permission: "userManagement",
    },
    {
      name: "Tournaments",
      path: "/admin/tournaments",
      icon: "🏆",
      permission: "tournamentManagement",
    },
    {
      name: "Training",
      path: "/admin/training",
      icon: "🎯",
      permission: "trainingManagement",
    },
    {
      name: "Analytics",
      path: "/admin/analytics",
      icon: "📈",
      permission: "analyticsAccess",
    },
    {
      name: "Content",
      path: "/admin/content",
      icon: "📝",
      permission: "contentManagement",
    },
    {
      name: "Settings",
      path: "/admin/settings",
      icon: "⚙️",
      permission: "systemSettings",
    },
  ];

  useEffect(() => {
    checkAdminAuth();
  }, [checkAdminAuth]);

  const checkAdminAuth = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/auth/me", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setAdmin(data.admin);
      } else {
        router.push("/admin/login");
      }
    } catch (error) {
      console.error("Auth check error:", error);
      router.push("/admin/login");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      toast({
        title: "Logged out successfully",
        status: "success",
        duration: 2000,
        isClosable: true,
      });

      router.push("/admin/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Error logging out",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const hasPermission = (permission) => {
    if (!admin) return false;
    if (admin.role === "super_admin") return true;
    return admin.permissions[permission] === true;
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "super_admin":
        return "red";
      case "admin":
        return "blue";
      case "moderator":
        return "green";
      case "content_manager":
        return "purple";
      default:
        return "gray";
    }
  };

  if (isLoading) {
    return (
      <Box minH="100vh" bg={loadingBg}>
        <Flex align="center" justify="center" h="100vh">
          <Text>Loading...</Text>
        </Flex>
      </Box>
    );
  }

  if (!admin) {
    return null;
  }

  return (
    <Box minH="100vh" bg={loadingBg}>
      {/* Header */}
      <Box
        bg={bgColor}
        borderBottom="1px"
        borderColor={borderColor}
        px={{ base: 3, md: 4 }}
        py={{ base: 2, md: 3 }}
      >
        <Flex align="center" justify="space-between">
          <HStack spacing={{ base: 2, md: 4 }}>
            <IconButton
              aria-label="Open menu"
              icon={<HamburgerIcon />}
              variant="ghost"
              display={{ base: "block", md: "none" }}
              onClick={onOpen}
              size="sm"
            />
            <Text
              fontSize={{ base: "lg", md: "xl" }}
              fontWeight="bold"
              noOfLines={1}
            >
              {title}
            </Text>
          </HStack>

          <HStack spacing={{ base: 2, md: 4 }}>
            <Badge
              colorScheme={getRoleBadgeColor(admin.role)}
              variant="subtle"
              fontSize={{ base: "xs", md: "sm" }}
              display={{ base: "none", sm: "block" }}
            >
              {admin.role.replace("_", " ").toUpperCase()}
            </Badge>

            <Menu>
              <MenuButton
                as={Button}
                rightIcon={<ChevronDownIcon />}
                variant="ghost"
                size={{ base: "sm", md: "md" }}
              >
                <HStack spacing={2}>
                  <Avatar
                    size={{ base: "xs", md: "sm" }}
                    src={admin.profilePicture}
                  />
                  <Text display={{ base: "none", md: "block" }}>
                    {admin.username}
                  </Text>
                </HStack>
              </MenuButton>
              <MenuList>
                <MenuItem
                  icon={<SettingsIcon />}
                  onClick={() => router.push("/admin/settings")}
                >
                  Settings
                </MenuItem>
                <MenuItem icon={<CloseIcon />} onClick={handleLogout}>
                  Logout
                </MenuItem>
              </MenuList>
            </Menu>
          </HStack>
        </Flex>
      </Box>

      <Flex>
        {/* Desktop Sidebar */}
        <Box
          w="250px"
          bg={bgColor}
          borderRight="1px"
          borderColor={borderColor}
          minH="calc(100vh - 65px)"
          display={{ base: "none", md: "block" }}
        >
          <VStack spacing={0} align="stretch" p={4}>
            {menuItems.map((item) => {
              if (item.permission && !hasPermission(item.permission)) {
                return null;
              }

              const isActive = router.pathname === item.path;

              return (
                <Link key={item.path} href={item.path}>
                  <Button
                    w="full"
                    justifyContent="flex-start"
                    variant={isActive ? "solid" : "ghost"}
                    colorScheme={isActive ? "blue" : "gray"}
                    leftIcon={<Text>{item.icon}</Text>}
                    mb={1}
                  >
                    {item.name}
                  </Button>
                </Link>
              );
            })}
          </VStack>
        </Box>

        {/* Mobile Drawer */}
        <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader>Admin Menu</DrawerHeader>
            <DrawerBody>
              <VStack spacing={0} align="stretch">
                {menuItems.map((item) => {
                  if (item.permission && !hasPermission(item.permission)) {
                    return null;
                  }

                  const isActive = router.pathname === item.path;

                  return (
                    <Link key={item.path} href={item.path}>
                      <Button
                        w="full"
                        justifyContent="flex-start"
                        variant={isActive ? "solid" : "ghost"}
                        colorScheme={isActive ? "blue" : "gray"}
                        leftIcon={<Text>{item.icon}</Text>}
                        mb={1}
                        onClick={onClose}
                      >
                        {item.name}
                      </Button>
                    </Link>
                  );
                })}
              </VStack>
            </DrawerBody>
          </DrawerContent>
        </Drawer>

        {/* Main Content */}
        <Box flex="1" p={{ base: 3, md: 6 }} overflow="hidden">
          {children}
        </Box>
      </Flex>
    </Box>
  );
};

export default AdminLayout;
