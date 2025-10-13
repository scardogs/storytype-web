import React, { useState } from "react";
import Navbar from "../components/navbar";
import {
  Box,
  Flex,
  Heading,
  Input,
  Button,
  VStack,
  HStack,
  Divider,
  Checkbox,
  Text,
  Icon,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Center,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from "@chakra-ui/react";
import {
  AtSignIcon,
  LockIcon,
  ArrowForwardIcon,
  AddIcon,
} from "@chakra-ui/icons";
import { FaGoogle, FaGithub, FaUserPlus, FaSignInAlt } from "react-icons/fa";

export default function ProfilePage() {
  const cardBg = useColorModeValue("gray.50", "gray.800");
  const inputBg = useColorModeValue("gray.100", "gray.700");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [modalType, setModalType] = useState("");

  const handleComingSoon = (type) => {
    setModalType(type);
    onOpen();
  };

  return (
    <>
      <Navbar />
      <Flex
        minH="100vh"
        align="center"
        justify="center"
        bg={useColorModeValue("gray.100", "gray.900")}
        px={4}
      >
        <Box
          w={{ base: "100%", sm: "90%", md: "500px" }}
          bg={cardBg}
          boxShadow="2xl"
          borderRadius="2xl"
          p={{ base: 4, md: 8 }}
        >
          <Tabs variant="soft-rounded" colorScheme="teal" isFitted>
            <TabList mb={6}>
              <Tab fontWeight="bold">Register</Tab>
              <Tab fontWeight="bold">Login</Tab>
            </TabList>
            <TabPanels>
              {/* Register Tab */}
              <TabPanel>
                <VStack spacing={4} align="stretch">
                  <HStack mb={2} justify="center">
                    <Icon as={FaUserPlus} color="teal.400" />
                    <Heading size="md" color="teal.300">
                      Register
                    </Heading>
                  </HStack>
                  <Input placeholder="Username" bg={inputBg} />
                  <Input placeholder="Email" type="email" bg={inputBg} />
                  <Input placeholder="Verify Email" type="email" bg={inputBg} />
                  <Input placeholder="Password" type="password" bg={inputBg} />
                  <Input
                    placeholder="Verify Password"
                    type="password"
                    bg={inputBg}
                  />
                  <Button
                    leftIcon={<FaUserPlus />}
                    colorScheme="teal"
                    mt={2}
                    w="100%"
                    onClick={() => handleComingSoon("signup")}
                  >
                    Sign Up
                  </Button>
                </VStack>
              </TabPanel>
              {/* Login Tab */}
              <TabPanel>
                <VStack spacing={4} align="stretch">
                  <HStack mb={2} justify="center">
                    <Icon as={FaSignInAlt} color="teal.400" />
                    <Heading size="md" color="teal.300">
                      Login
                    </Heading>
                  </HStack>
                  <HStack spacing={2} flexWrap="wrap">
                    <Button
                      leftIcon={<FaGoogle />}
                      colorScheme="gray"
                      flex={1}
                      variant="outline"
                      minW={"120px"}
                    >
                      Google
                    </Button>
                    <Button
                      leftIcon={<FaGithub />}
                      colorScheme="gray"
                      flex={1}
                      variant="outline"
                      minW={"120px"}
                    >
                      GitHub
                    </Button>
                  </HStack>
                  <HStack>
                    <Divider />
                    <Text color="gray.400" fontSize="sm">
                      or
                    </Text>
                    <Divider />
                  </HStack>
                  <Input placeholder="Email" type="email" bg={inputBg} />
                  <Input placeholder="Password" type="password" bg={inputBg} />
                  <Checkbox colorScheme="teal" defaultChecked>
                    Remember me
                  </Checkbox>
                  <Button
                    leftIcon={<FaSignInAlt />}
                    colorScheme="teal"
                    mt={2}
                    w="100%"
                    onClick={() => handleComingSoon("signin")}
                  >
                    Sign In
                  </Button>
                  <Button
                    variant="link"
                    colorScheme="teal"
                    alignSelf="flex-end"
                    fontSize="sm"
                  >
                    Forgot password?
                  </Button>
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </Flex>
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent bg={useColorModeValue("gray.50", "gray.800")}>
          <ModalHeader textAlign="center">🚧 Coming Soon</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Center>
              <Text color="gray.500" fontSize="lg">
                {modalType === "signup" ? "Sign up" : "Sign in"} is under
                construction. Stay tuned!
              </Text>
            </Center>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
