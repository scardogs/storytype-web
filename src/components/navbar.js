import React from "react";
import {
  Box,
  Flex,
  IconButton,
  Text,
  Spacer,
  useColorModeValue,
  useColorMode,
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
} from "@chakra-ui/react";
import {
  AtSignIcon,
  InfoOutlineIcon,
  SettingsIcon,
  StarIcon,
  MoonIcon,
  SunIcon,
  ChevronDownIcon,
} from "@chakra-ui/icons";
import { FaKeyboard, FaChartLine } from "react-icons/fa";
import { FiBell, FiUser } from "react-icons/fi";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const bg = useColorModeValue("gray.50", "gray.900");
  const border = useColorModeValue("gray.200", "gray.700");
  const iconColor = useColorModeValue("gray.600", "gray.300");
  const { colorMode, toggleColorMode } = useColorMode();
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();
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
  const isActive = (path) => router.pathname === path;
  const { user, logout } = useAuth();
  const menuBg = useColorModeValue("teal.50", "teal.900");

  return (
    <>
      <Box
        as="nav"
        w="100%"
        px={{ base: 2, md: 8 }}
        py={2}
        bg={navBg}
        borderBottomWidth={1}
        borderColor={navBorder}
        boxShadow="sm"
        position="sticky"
        top={0}
        zIndex={10}
        style={{
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          boxShadow: navShadow,
        }}
        transition="background 0.3s"
      >
        <Flex align="center">
          {/* Logo/Title */}
          <HStack spacing={2}>
            <Box
              fontSize="2xl"
              fontWeight="bold"
              letterSpacing="tight"
              cursor="pointer"
              onClick={() => router.push("/")}
              _hover={{ opacity: 0.8 }}
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
          {/* Navigation Icons */}
          <HStack spacing={1}>
            <Tooltip label="Typing Practice" hasArrow>
              <Box position="relative">
                <IconButton
                  aria-label="Typing Practice"
                  icon={<FaKeyboard />}
                  variant="ghost"
                  color={isActive("/type") ? activeColor : inactiveColor}
                  fontSize="xl"
                  onClick={() => router.push("/type")}
                  _hover={{
                    color: activeColor,
                    bg: useColorModeValue("teal.50", "teal.900"),
                  }}
                />
                {isActive("/type") && (
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
            <Tooltip label="Leaderboard" hasArrow>
              <Box position="relative">
                <IconButton
                  aria-label="Leaderboard"
                  icon={<StarIcon />}
                  variant="ghost"
                  color={isActive("/leaderboard") ? activeColor : inactiveColor}
                  fontSize="xl"
                  onClick={() => router.push("/leaderboard")}
                  _hover={{
                    color: activeColor,
                    bg: useColorModeValue("teal.50", "teal.900"),
                  }}
                />
                {isActive("/leaderboard") && (
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
            <Tooltip label="Analytics" hasArrow>
              <Box position="relative">
                <IconButton
                  aria-label="Analytics"
                  icon={<FaChartLine />}
                  variant="ghost"
                  color={isActive("/analytics") ? activeColor : inactiveColor}
                  fontSize="xl"
                  onClick={() => router.push("/analytics")}
                  _hover={{
                    color: activeColor,
                    bg: useColorModeValue("teal.50", "teal.900"),
                  }}
                />
                {isActive("/analytics") && (
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
            <Tooltip label="Info" hasArrow>
              <Box position="relative">
                <IconButton
                  aria-label="Info"
                  icon={<InfoOutlineIcon />}
                  variant="ghost"
                  color={isActive("/info") ? activeColor : inactiveColor}
                  fontSize="xl"
                  onClick={() => router.push("/info")}
                  _hover={{
                    color: activeColor,
                    bg: useColorModeValue("teal.50", "teal.900"),
                  }}
                />
                {isActive("/info") && (
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
            <Tooltip label="Settings" hasArrow>
              <Box position="relative">
                <IconButton
                  aria-label="Settings"
                  icon={<SettingsIcon />}
                  variant="ghost"
                  color={isActive("/settings") ? activeColor : inactiveColor}
                  fontSize="xl"
                  onClick={() => router.push("/settings")}
                  _hover={{
                    color: activeColor,
                    bg: useColorModeValue("teal.50", "teal.900"),
                  }}
                />
                {isActive("/settings") && (
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
            <Tooltip label="Notifications" hasArrow>
              <Box position="relative">
                <IconButton
                  aria-label="Notifications"
                  icon={<FiBell />}
                  variant="ghost"
                  color={inactiveColor}
                  fontSize="xl"
                  onClick={onOpen}
                  _hover={{
                    color: activeColor,
                    bg: useColorModeValue("teal.50", "teal.900"),
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
          <Spacer />
          {/* User Profile Section */}
          <HStack spacing={4}>
            {user ? (
              <Menu>
                <MenuButton
                  as={Button}
                  variant="ghost"
                  rightIcon={<ChevronDownIcon />}
                  _hover={{
                    bg: menuBg,
                  }}
                >
                  <HStack spacing={2}>
                    <Avatar
                      size="sm"
                      src={user.profilePicture}
                      name={user.username}
                      bg="teal.500"
                    />
                    <Text
                      display={{ base: "none", md: "block" }}
                      fontSize="sm"
                      fontWeight="medium"
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
                leftIcon={<FiUser />}
                colorScheme="teal"
                variant="outline"
                size="sm"
                onClick={() => router.push("/profile")}
              >
                Login
              </Button>
            )}
          </HStack>
        </Flex>
      </Box>
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent bg={bg}>
          <ModalHeader textAlign="center">🔔 Coming Soon</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Center>
              <Text color={inactiveColor} fontSize="lg">
                Notifications are under construction. Stay tuned!
              </Text>
            </Center>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
