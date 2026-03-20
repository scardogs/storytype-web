import React from "react";
import {
  Box,
  Flex,
  IconButton,
  Text,
  Spacer,
  useColorModeValue,
  HStack,
  Tooltip,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Center,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Badge,
  Button,
  VStack,
  Divider,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerCloseButton,
  Icon,
} from "@chakra-ui/react";
import {
  InfoOutlineIcon,
  SettingsIcon,
  StarIcon,
  ChevronDownIcon,
  HamburgerIcon,
  CloseIcon,
} from "@chakra-ui/icons";
import {
  FaKeyboard,
  FaChartLine,
  FaTrophy,
  FaGraduationCap,
  FaHome,
} from "react-icons/fa";
import { FiBell, FiUser } from "react-icons/fi";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const bg = useColorModeValue("gray.50", "gray.900");
  const router = useRouter();
  const {
    isOpen: isNotificationsOpen,
    onOpen: onNotificationsOpen,
    onClose: onNotificationsClose,
  } = useDisclosure();
  const {
    isOpen: isMobileMenuOpen,
    onOpen: onMobileMenuOpen,
    onClose: onMobileMenuClose,
  } = useDisclosure();
  const activeColor = useColorModeValue("teal.500", "teal.300");
  const inactiveColor = useColorModeValue("gray.600", "gray.300");
  const navBg = useColorModeValue(
    "rgba(255,255,255,0.7)",
    "rgba(26,32,44,0.7)"
  );
  const navBorder = useColorModeValue("gray.200", "gray.700");
  const navShadow = useColorModeValue(
    "0 2px 16px rgba(0,0,0,0.08)",
    "0 2px 16px rgba(0,0,0,0.32)"
  );
  const hoverBg = useColorModeValue("teal.50", "teal.900");
  const menuBg = useColorModeValue("teal.50", "teal.900");
  const mobileDrawerBg = useColorModeValue("white", "gray.900");
  const drawerActiveBg = useColorModeValue("teal.50", "whiteAlpha.100");
  const { user, logout } = useAuth();

  const isActive = (path) => router.pathname === path;

  const navItems = [
    { label: "Home", path: "/", icon: FaHome },
    { label: "Typing Practice", path: "/type", icon: FaKeyboard },
    { label: "Leaderboard", path: "/leaderboard", icon: StarIcon },
    { label: "Tournaments", path: "/tournaments", icon: FaTrophy },
    { label: "Training", path: "/training", icon: FaGraduationCap },
    { label: "Analytics", path: "/analytics", icon: FaChartLine },
    { label: "Info", path: "/info", icon: InfoOutlineIcon },
    { label: "Settings", path: "/settings", icon: SettingsIcon },
  ];

  const handleNavigate = (path) => {
    router.push(path);
    onMobileMenuClose();
  };

  const renderDesktopNavButton = (item) => (
    <Tooltip
      key={item.path}
      label={item.label}
      hasArrow
      isDisabled={{ base: true, md: false }}
    >
      <Box position="relative">
        <IconButton
          aria-label={item.label}
          icon={<item.icon />}
          variant="ghost"
          color={isActive(item.path) ? activeColor : inactiveColor}
          fontSize={{ base: "lg", md: "xl" }}
          size={{ base: "sm", md: "md" }}
          onClick={() => router.push(item.path)}
          _hover={{
            color: activeColor,
            bg: hoverBg,
          }}
        />
        {isActive(item.path) && (
          <Box
            position="absolute"
            left="50%"
            bottom={-1}
            transform="translateX(-50%)"
            w="60%"
            h="2px"
            bg={activeColor}
            borderRadius="full"
            transition="all 0.2s"
          />
        )}
      </Box>
    </Tooltip>
  );

  return (
    <>
      <Box
        as="nav"
        w="100%"
        px={{ base: 3, md: 8 }}
        py={{ base: 2, md: 2 }}
        bg={navBg}
        borderBottomWidth={1}
        borderColor={navBorder}
        boxShadow="sm"
        position="sticky"
        top={0}
        zIndex={20}
        style={{
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          boxShadow: navShadow,
        }}
        transition="background 0.3s"
      >
        <Flex align="center" minH={{ base: "44px", md: "56px" }}>
          <HStack spacing={2}>
            <Box
              fontSize={{ base: "xl", md: "2xl" }}
              fontWeight="bold"
              letterSpacing="tight"
              cursor="pointer"
              onClick={() => router.push("/")}
              _hover={{ opacity: 0.8 }}
              whiteSpace="nowrap"
            >
              <Text as="span" color="teal.400">
                story
              </Text>
              <Text as="span" color={inactiveColor}>
                type
              </Text>
            </Box>
          </HStack>

          <Spacer />

          <HStack spacing={1} display={{ base: "none", md: "flex" }}>
            {navItems
              .filter((item) => item.path !== "/")
              .map(renderDesktopNavButton)}

            <Tooltip
              label="Notifications"
              hasArrow
              isDisabled={{ base: true, md: false }}
            >
              <Box position="relative" display={{ base: "none", sm: "block" }}>
                <IconButton
                  aria-label="Notifications"
                  icon={<FiBell />}
                  variant="ghost"
                  color={inactiveColor}
                  fontSize={{ base: "lg", md: "xl" }}
                  size={{ base: "sm", md: "md" }}
                  onClick={onNotificationsOpen}
                  _hover={{
                    color: activeColor,
                    bg: hoverBg,
                  }}
                />
                <Badge
                  colorScheme="red"
                  borderRadius="full"
                  position="absolute"
                  top={1}
                  right={1}
                  fontSize="0.7em"
                  px={1.5}
                  py={0.5}
                  zIndex={1}
                  boxShadow="0 0 0 2px white"
                >
                  3
                </Badge>
              </Box>
            </Tooltip>
          </HStack>

          <Spacer display={{ base: "none", md: "block" }} />

          <HStack spacing={{ base: 1, md: 4 }}>
            {user ? (
              <Menu>
                <MenuButton
                  as={Button}
                  variant="ghost"
                  rightIcon={
                    <ChevronDownIcon display={{ base: "none", sm: "block" }} />
                  }
                  px={{ base: 2, md: 4 }}
                  minW={0}
                  _hover={{
                    bg: menuBg,
                  }}
                >
                  <HStack spacing={{ base: 1, md: 2 }}>
                    <Avatar
                      size={{ base: "xs", md: "sm" }}
                      src={user.profilePicture}
                      name={user.username}
                      bg="teal.500"
                    />
                    <Text
                      display={{ base: "none", md: "block" }}
                      fontSize="sm"
                      fontWeight="medium"
                      noOfLines={1}
                    >
                      {user.username}
                    </Text>
                  </HStack>
                </MenuButton>
                <MenuList>
                  <MenuItem onClick={() => router.push("/profile")}>
                    My Profile
                  </MenuItem>
                  <MenuItem onClick={() => router.push("/settings")}>
                    Settings
                  </MenuItem>
                  <MenuDivider />
                  <MenuItem color="red.400" onClick={logout}>
                    Logout
                  </MenuItem>
                </MenuList>
              </Menu>
            ) : (
              <Button
                colorScheme="teal"
                variant="outline"
                size="sm"
                fontSize={{ base: "xs", md: "sm" }}
                px={{ base: 2, md: 4 }}
                onClick={() => router.push("/profile")}
              >
                <Text display={{ base: "none", sm: "inline" }}>Login</Text>
                <Box display={{ base: "inline-flex", sm: "none" }}>
                  <FiUser />
                </Box>
              </Button>
            )}

            <IconButton
              display={{ base: "inline-flex", md: "none" }}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              icon={isMobileMenuOpen ? <CloseIcon boxSize={3} /> : <HamburgerIcon />}
              variant="ghost"
              color={inactiveColor}
              size="sm"
              onClick={isMobileMenuOpen ? onMobileMenuClose : onMobileMenuOpen}
            />
          </HStack>
        </Flex>
      </Box>

      <Drawer
        isOpen={isMobileMenuOpen}
        placement="left"
        onClose={onMobileMenuClose}
      >
        <DrawerOverlay />
        <DrawerContent bg={mobileDrawerBg}>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px" borderColor={navBorder}>
            <Text as="span" color="teal.400" fontWeight="bold">
              story
            </Text>
            <Text as="span" color={inactiveColor} fontWeight="bold">
              type
            </Text>
          </DrawerHeader>
          <DrawerBody px={0}>
            <VStack spacing={1} align="stretch" py={3}>
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  justifyContent="flex-start"
                  leftIcon={<Icon as={item.icon} />}
                  variant="ghost"
                  borderRadius="none"
                  color={isActive(item.path) ? activeColor : inactiveColor}
                  bg={isActive(item.path) ? drawerActiveBg : "transparent"}
                  px={5}
                  py={6}
                  fontWeight={isActive(item.path) ? "semibold" : "medium"}
                  onClick={() => handleNavigate(item.path)}
                >
                  {item.label}
                </Button>
              ))}

              <Divider my={2} />

              <Button
                justifyContent="flex-start"
                leftIcon={<FiBell />}
                variant="ghost"
                borderRadius="none"
                color={inactiveColor}
                px={5}
                py={6}
                onClick={() => {
                  onMobileMenuClose();
                  onNotificationsOpen();
                }}
              >
                Notifications
              </Button>

              {user ? (
                <>
                  <Button
                    justifyContent="flex-start"
                    leftIcon={<FiUser />}
                    variant="ghost"
                    borderRadius="none"
                    color={inactiveColor}
                    px={5}
                    py={6}
                    onClick={() => handleNavigate("/profile")}
                  >
                    My Profile
                  </Button>
                  <Button
                    justifyContent="flex-start"
                    variant="ghost"
                    borderRadius="none"
                    color="red.400"
                    px={5}
                    py={6}
                    onClick={() => {
                      onMobileMenuClose();
                      logout();
                    }}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <Button
                  justifyContent="flex-start"
                  leftIcon={<FiUser />}
                  variant="ghost"
                  borderRadius="none"
                  color={inactiveColor}
                  px={5}
                  py={6}
                  onClick={() => handleNavigate("/profile")}
                >
                  Login
                </Button>
              )}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      <Modal
        isOpen={isNotificationsOpen}
        onClose={onNotificationsClose}
        isCentered
      >
        <ModalOverlay />
        <ModalContent bg={bg}>
          <ModalHeader textAlign="center">Notifications Coming Soon</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Center>
              <Text color={inactiveColor} fontSize="lg" textAlign="center">
                Notifications are under construction. Stay tuned!
              </Text>
            </Center>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
