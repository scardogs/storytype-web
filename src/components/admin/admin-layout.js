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
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  VStack,
  HStack,
  Badge,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useToast,
  Skeleton,
} from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import {
  FiHome,
  FiUsers,
  FiAward,
  FiTarget,
  FiBarChart2,
  FiFileText,
  FiSettings,
  FiLogOut,
  FiBell,
  FiMenu,
} from "react-icons/fi";
import { useRouter } from "next/router";
import Link from "next/link";

const pulseGlow = keyframes`
  0%, 100% { opacity: 0.45; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.02); }
`;

const shimmer = keyframes`
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
`;

const ADMIN_CACHE_KEY = "storytype_admin_session";

const AdminLayout = ({ children, title = "Admin Dashboard" }) => {
  const [admin, setAdmin] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const router = useRouter();
  const toast = useToast();

  const menuItems = [
    { name: "Dashboard", path: "/admin", icon: FiHome },
    {
      name: "Users",
      path: "/admin/users",
      icon: FiUsers,
      permission: "userManagement",
    },
    {
      name: "Tournaments",
      path: "/admin/tournaments",
      icon: FiAward,
      permission: "tournamentManagement",
    },
    {
      name: "Training",
      path: "/admin/training",
      icon: FiTarget,
      permission: "trainingManagement",
    },
    {
      name: "Analytics",
      path: "/admin/analytics",
      icon: FiBarChart2,
      permission: "analyticsAccess",
    },
    {
      name: "Content",
      path: "/admin/content",
      icon: FiFileText,
      permission: "contentManagement",
    },
    {
      name: "Settings",
      path: "/admin/settings",
      icon: FiSettings,
      permission: "systemSettings",
    },
  ];

  const checkAdminAuth = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/auth/me", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setAdmin(data.admin);
        if (typeof window !== "undefined") {
          window.sessionStorage.setItem(
            ADMIN_CACHE_KEY,
            JSON.stringify(data.admin)
          );
        }
      } else {
        if (typeof window !== "undefined") {
          window.sessionStorage.removeItem(ADMIN_CACHE_KEY);
        }
        setAdmin(null);
        router.push("/admin/login");
      }
    } catch (error) {
      console.error("Auth check error:", error);
      if (typeof window !== "undefined") {
        window.sessionStorage.removeItem(ADMIN_CACHE_KEY);
      }
      setAdmin(null);
      router.push("/admin/login");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const cached = window.sessionStorage.getItem(ADMIN_CACHE_KEY);
      if (cached) {
        setAdmin(JSON.parse(cached));
        setIsLoading(false);
      }
    } catch {
      // Ignore invalid cache payload
    }
  }, []);

  useEffect(() => {
    checkAdminAuth();
  }, [checkAdminAuth]);

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

      if (typeof window !== "undefined") {
        window.sessionStorage.removeItem(ADMIN_CACHE_KEY);
      }

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

  const getPageTitle = () => {
    const activeMenu = menuItems.find((item) => item.path === router.pathname);
    return activeMenu?.name || title;
  };

  const SidebarContent = ({ onItemClick }) => (
    <VStack spacing={1.5} align="stretch" px={3} py={3}>
      {menuItems.map((item) => {
        if (item.permission && !hasPermission(item.permission)) {
          return null;
        }

        const isActive = router.pathname === item.path;
        const Icon = item.icon;

        return (
          <Link key={item.path} href={item.path} style={{ textDecoration: "none" }}>
            <Flex
              align="center"
              px={3.5}
              py={3}
              cursor="pointer"
              borderRadius="xl"
              role="group"
              transition="all 0.25s ease"
              bg={isActive ? "rgba(45, 212, 191, 0.10)" : "transparent"}
              borderLeft="3px solid"
              borderLeftColor={isActive ? "teal.400" : "transparent"}
              _hover={{
                bg: "gray.700",
                transform: "translateX(2px)",
              }}
              onClick={onItemClick}
            >
              <Box
                as={Icon}
                fontSize="18px"
                color={isActive ? "teal.400" : "gray.400"}
                transition="all 0.25s ease"
                _groupHover={{ color: isActive ? "teal.300" : "gray.100" }}
                mr={3}
                flexShrink={0}
              />
              <Text
                fontSize="sm"
                fontWeight={isActive ? "700" : "500"}
                color={isActive ? "white" : "gray.300"}
                transition="color 0.25s ease"
                letterSpacing="0.01em"
                _groupHover={{ color: "white" }}
              >
                {item.name}
              </Text>
            </Flex>
          </Link>
        );
      })}
    </VStack>
  );

  if (isLoading) {
    return (
      <Box minH="100vh" bg="gray.900">
        <Flex>
          <Box
            w="280px"
            minH="100vh"
            bg="gray.800"
            borderRight="1px solid"
            borderColor="gray.700"
            p={6}
            display={{ base: "none", md: "block" }}
          >
            <Skeleton
              height="30px"
              width="160px"
              borderRadius="md"
              startColor="gray.700"
              endColor="gray.600"
            />
            <VStack align="stretch" spacing={3.5} mt={8}>
              {[1, 2, 3, 4, 5, 6].map((index) => (
                <Skeleton
                  key={index}
                  height="48px"
                  borderRadius="xl"
                  startColor="gray.700"
                  endColor="gray.600"
                />
              ))}
            </VStack>
          </Box>

          <Box flex="1">
            <Flex
              h="72px"
              align="center"
              justify="space-between"
              px={{ base: 4, md: 8 }}
              bg="gray.800"
              borderBottom="1px solid"
              borderColor="gray.700"
            >
              <Skeleton height="26px" width="260px" borderRadius="md" />
              <HStack spacing={3}>
                <Skeleton boxSize="34px" borderRadius="lg" />
                <Skeleton height="28px" width="96px" borderRadius="full" />
                <Skeleton boxSize="36px" borderRadius="full" />
              </HStack>
            </Flex>

            <Box p={{ base: 4, md: 8 }}>
              <VStack align="stretch" spacing={5}>
                {[1, 2, 3].map((index) => (
                  <Box
                    key={index}
                    h={index === 1 ? "120px" : "200px"}
                    borderRadius="2xl"
                    bgGradient="linear(to-r, gray.800, gray.700, gray.800)"
                    backgroundSize="200% 100%"
                    animation={`${shimmer} 1.8s linear infinite`}
                    opacity={0.85}
                  />
                ))}
              </VStack>
            </Box>
          </Box>
        </Flex>

        <Flex position="fixed" bottom={7} left={0} right={0} justify="center">
          <Text
            fontSize="xs"
            color="gray.400"
            letterSpacing="0.14em"
            textTransform="uppercase"
            animation={`${pulseGlow} 1.5s ease-in-out infinite`}
          >
            Loading StoryType Admin
          </Text>
        </Flex>
      </Box>
    );
  }

  if (!admin) {
    return null;
  }

  return (
    <Box minH="100vh" bg="gray.900">
      <Flex>
        <Box
          w="280px"
          minH="100vh"
          bg="gray.800"
          display={{ base: "none", md: "block" }}
          borderRight="1px solid"
          borderColor="gray.700"
          position="fixed"
          top={0}
          left={0}
          overflowY="auto"
          css={{
            "&::-webkit-scrollbar": { width: "6px" },
            "&::-webkit-scrollbar-track": { background: "transparent" },
            "&::-webkit-scrollbar-thumb": {
              background: "rgba(255,255,255,0.15)",
              borderRadius: "8px",
            },
          }}
        >
          <Flex align="center" px={6} py={6}>
            <Text
              fontSize="2xl"
              fontWeight="800"
              letterSpacing="-0.03em"
              bgGradient="linear(to-r, teal.400, blue.400)"
              bgClip="text"
            >
              StoryType
            </Text>
            <Badge
              ml={2.5}
              px={2.5}
              py={1}
              borderRadius="full"
              bg="whiteAlpha.200"
              color="gray.100"
              fontSize="10px"
              fontWeight="700"
              letterSpacing="0.08em"
              textTransform="uppercase"
            >
              Admin
            </Badge>
          </Flex>

          <Box
            h="1px"
            mx={6}
            mb={4}
            bgGradient="linear(to-r, transparent, teal.400, blue.400, transparent)"
            opacity={0.35}
          />

          <SidebarContent onItemClick={() => {}} />

          <Box position="sticky" bottom={0} left={0} right={0} px={3} py={4} bg="gray.800">
            <Box h="1px" mb={3} bg="gray.700" />
            <Flex
              align="center"
              px={3.5}
              py={3}
              borderRadius="xl"
              cursor="pointer"
              transition="all 0.2s ease"
              _hover={{ bg: "gray.700" }}
              onClick={handleLogout}
              role="group"
            >
              <Box
                as={FiLogOut}
                fontSize="18px"
                color="gray.400"
                mr={3}
                transition="color 0.2s ease"
                _groupHover={{ color: "red.400" }}
              />
              <Text
                fontSize="sm"
                fontWeight="500"
                color="gray.300"
                letterSpacing="0.01em"
                transition="color 0.2s ease"
                _groupHover={{ color: "red.300" }}
              >
                Sign Out
              </Text>
            </Flex>
          </Box>
        </Box>

        <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
          <DrawerOverlay bg="blackAlpha.700" backdropFilter="blur(6px)" />
          <DrawerContent bg="gray.800" maxW="280px" borderRight="1px solid" borderColor="gray.700">
            <DrawerCloseButton color="gray.400" _hover={{ color: "white", bg: "gray.700" }} />

            <Flex align="center" px={6} pt={6} pb={4}>
              <Text
                fontSize="2xl"
                fontWeight="800"
                letterSpacing="-0.03em"
                bgGradient="linear(to-r, teal.400, blue.400)"
                bgClip="text"
              >
                StoryType
              </Text>
              <Badge
                ml={2.5}
                px={2.5}
                py={1}
                borderRadius="full"
                bg="whiteAlpha.200"
                color="gray.100"
                fontSize="10px"
                fontWeight="700"
                letterSpacing="0.08em"
                textTransform="uppercase"
              >
                Admin
              </Badge>
            </Flex>

            <Box h="1px" mx={6} mb={3} bg="gray.700" />

            <DrawerBody px={0} py={0}>
              <SidebarContent onItemClick={onClose} />

              <Box px={3} mt={4}>
                <Box h="1px" mb={3} bg="gray.700" />
                <Flex
                  align="center"
                  px={3.5}
                  py={3}
                  borderRadius="xl"
                  cursor="pointer"
                  transition="all 0.2s ease"
                  _hover={{ bg: "gray.700" }}
                  onClick={() => {
                    onClose();
                    handleLogout();
                  }}
                  role="group"
                >
                  <Box
                    as={FiLogOut}
                    fontSize="18px"
                    color="gray.400"
                    mr={3}
                    transition="color 0.2s ease"
                    _groupHover={{ color: "red.400" }}
                  />
                  <Text
                    fontSize="sm"
                    fontWeight="500"
                    color="gray.300"
                    letterSpacing="0.01em"
                    transition="color 0.2s ease"
                    _groupHover={{ color: "red.300" }}
                  >
                    Sign Out
                  </Text>
                </Flex>
              </Box>
            </DrawerBody>
          </DrawerContent>
        </Drawer>

        <Box flex="1" ml={{ base: 0, md: "280px" }}>
          <Flex
            align="center"
            justify="space-between"
            h="72px"
            px={{ base: 4, md: 8 }}
            bg="gray.800"
            borderBottom="1px solid"
            borderColor="gray.700"
            position="sticky"
            top={0}
            zIndex={10}
            _after={{
              content: '""',
              position: "absolute",
              bottom: "-1px",
              left: 0,
              right: 0,
              height: "1px",
              bgGradient: "linear(to-r, transparent, teal.400, blue.400, transparent)",
              opacity: 0.55,
            }}
          >
            <HStack spacing={3.5}>
              <IconButton
                aria-label="Open menu"
                icon={<FiMenu />}
                variant="ghost"
                color="gray.300"
                _hover={{ color: "white", bg: "gray.700" }}
                display={{ base: "flex", md: "none" }}
                onClick={onOpen}
                size="sm"
                fontSize="lg"
              />
              <Box>
                <HStack spacing={2} align="baseline">
                  <Text
                    fontSize="xs"
                    color="gray.500"
                    textTransform="uppercase"
                    letterSpacing="0.1em"
                    fontWeight="600"
                  >
                    Admin
                  </Text>
                  <Text fontSize="xs" color="gray.600">
                    /
                  </Text>
                  <Text
                    fontSize={{ base: "sm", md: "md" }}
                    color="gray.100"
                    fontWeight="700"
                    letterSpacing="-0.01em"
                  >
                    {getPageTitle()}
                  </Text>
                </HStack>
                <Text fontSize="xs" color="gray.500" mt={0.5} display={{ base: "none", md: "block" }}>
                  {title}
                </Text>
              </Box>
            </HStack>

            <HStack spacing={3}>
              <IconButton
                aria-label="Notifications"
                icon={<FiBell />}
                variant="ghost"
                color="gray.300"
                _hover={{ color: "white", bg: "gray.700" }}
                size="sm"
                fontSize="lg"
              />

              <Badge
                colorScheme={getRoleBadgeColor(admin.role)}
                variant="subtle"
                fontSize="10px"
                fontWeight="700"
                letterSpacing="0.08em"
                textTransform="uppercase"
                px={3}
                py={1.5}
                borderRadius="full"
                display={{ base: "none", sm: "flex" }}
                boxShadow={`0 0 14px ${
                  admin.role === "super_admin"
                    ? "rgba(245,101,101,0.35)"
                    : admin.role === "admin"
                    ? "rgba(66,153,225,0.35)"
                    : admin.role === "moderator"
                    ? "rgba(72,187,120,0.35)"
                    : admin.role === "content_manager"
                    ? "rgba(159,122,234,0.35)"
                    : "rgba(160,174,192,0.25)"
                }`}
              >
                {admin.role.replace("_", " ").toUpperCase()}
              </Badge>

              <Menu>
                <MenuButton
                  as={Button}
                  variant="ghost"
                  size="sm"
                  px={1.5}
                  _hover={{ bg: "gray.700" }}
                  _active={{ bg: "gray.700" }}
                >
                  <HStack spacing={2}>
                    <Avatar
                      size="sm"
                      src={admin.profilePicture}
                      name={admin.username}
                      bg="teal.500"
                      color="white"
                      boxSize="34px"
                      fontSize="xs"
                    />
                    <Text
                      display={{ base: "none", md: "block" }}
                      color="gray.100"
                      fontSize="sm"
                      fontWeight="600"
                      maxW="140px"
                      noOfLines={1}
                    >
                      {admin.username}
                    </Text>
                  </HStack>
                </MenuButton>
                <MenuList bg="gray.800" borderColor="gray.700" shadow="2xl" py={1} minW="180px">
                  <MenuItem
                    icon={<FiSettings size={14} />}
                    onClick={() => router.push("/admin/settings")}
                    bg="transparent"
                    color="gray.300"
                    fontSize="sm"
                    _hover={{ bg: "gray.700", color: "white" }}
                    transition="all 0.15s ease"
                  >
                    Settings
                  </MenuItem>
                  <MenuItem
                    icon={<FiLogOut size={14} />}
                    onClick={handleLogout}
                    bg="transparent"
                    color="gray.300"
                    fontSize="sm"
                    _hover={{ bg: "gray.700", color: "red.300" }}
                    transition="all 0.15s ease"
                  >
                    Sign Out
                  </MenuItem>
                </MenuList>
              </Menu>
            </HStack>
          </Flex>

          <Box p={{ base: 4, md: 8 }} minH="calc(100vh - 72px)" overflow="hidden">
            {children}
          </Box>
        </Box>
      </Flex>
    </Box>
  );
};

export default AdminLayout;
