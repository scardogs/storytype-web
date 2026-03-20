import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/router";
import {
  Box,
  Flex,
  Heading,
  Input,
  Button,
  VStack,
  HStack,
  Checkbox,
  Text,
  Icon,
  useColorModeValue,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  FormControl,
  FormErrorMessage,
  InputGroup,
  InputLeftElement,
  IconButton,
  InputRightElement,
  ScaleFade,
  Fade,
} from "@chakra-ui/react";
import {
  FaUserPlus,
  FaSignInAlt,
  FaUser,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";

export default function LoginRegister({ initialTab = "register" }) {
  const cardBg = useColorModeValue(
    "rgba(255, 255, 255, 0.9)",
    "rgba(26, 32, 44, 0.9)"
  );
  const inputBg = useColorModeValue("white", "gray.700");
  const inputBorder = useColorModeValue("gray.300", "gray.600");
  const inputFocusBg = useColorModeValue("white", "gray.600");
  const { register, login } = useAuth();
  const router = useRouter();
  const toast = useToast();

  // Register form state
  const [registerData, setRegisterData] = useState({
    username: "",
    email: "",
    confirmEmail: "",
    password: "",
    confirmPassword: "",
  });
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerErrors, setRegisterErrors] = useState({});

  // Login form state
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
    rememberMe: true,
  });
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginErrors, setLoginErrors] = useState({});

  // Password visibility
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] =
    useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [tabIndex, setTabIndex] = useState(initialTab === "login" ? 1 : 0);

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    setRegisterErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleLoginChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLoginData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear error for this field
    setLoginErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateRegister = () => {
    const errors = {};

    if (!registerData.username.trim()) {
      errors.username = "Username is required";
    } else if (registerData.username.length < 3) {
      errors.username = "Username must be at least 3 characters";
    }

    if (!registerData.email.trim()) {
      errors.email = "Email is required";
    } else if (
      !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(registerData.email)
    ) {
      errors.email = "Invalid email format";
    }

    if (registerData.email !== registerData.confirmEmail) {
      errors.confirmEmail = "Emails do not match";
    }

    if (!registerData.password) {
      errors.password = "Password is required";
    } else if (registerData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    if (registerData.password !== registerData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setRegisterErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateLogin = () => {
    const errors = {};

    if (!loginData.email.trim()) {
      errors.email = "Email is required";
    }

    if (!loginData.password) {
      errors.password = "Password is required";
    }

    setLoginErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    if (!validateRegister()) {
      return;
    }

    setRegisterLoading(true);

    const result = await register(
      registerData.username,
      registerData.email,
      registerData.password,
      registerData.confirmPassword
    );

    setRegisterLoading(false);

    if (result.success) {
      toast({
        title: "Registration successful!",
        description:
          result.message ||
          (result.user
            ? `Welcome, ${result.user.username}!`
            : "Please check your email to verify your account."),
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      if (result.verificationUrl) {
        toast({
          title: "Manual verification link",
          description: result.verificationUrl,
          status: "info",
          duration: 10000,
          isClosable: true,
        });
      }

      if (result.user) {
        router.push("/type");
      }
    } else {
      toast({
        title: "Registration failed",
        description: result.error,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    if (!validateLogin()) {
      return;
    }

    setLoginLoading(true);

    const result = await login(loginData.email, loginData.password);

    setLoginLoading(false);

    if (result.success) {
      toast({
        title: "Login successful!",
        description: `Welcome back, ${result.user.username}!`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      router.push("/type");
    } else {
      toast({
        title: "Login failed",
        description: result.error,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      bgGradient={useColorModeValue(
        "linear(to-br, teal.50, purple.100, pink.50)",
        "linear(to-br, gray.900, teal.900, purple.900)"
      )}
      px={4}
      position="relative"
      overflow="hidden"
    >
      {/* Animated Background Elements */}
      <Box
        position="absolute"
        top="-20%"
        right="-10%"
        w="500px"
        h="500px"
        bgGradient="radial(teal.400, transparent)"
        opacity={0.3}
        borderRadius="full"
        filter="blur(80px)"
        animation="float 8s ease-in-out infinite"
      />
      <Box
        position="absolute"
        bottom="-20%"
        left="-10%"
        w="400px"
        h="400px"
        bgGradient="radial(purple.400, transparent)"
        opacity={0.3}
        borderRadius="full"
        filter="blur(80px)"
        animation="float 10s ease-in-out infinite reverse"
      />

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) translateX(0px);
          }
          50% {
            transform: translateY(-30px) translateX(20px);
          }
        }
      `}</style>

      <ScaleFade initialScale={0.9} in={true}>
        <Box
          w={{ base: "100%", sm: "90%", md: "520px" }}
          bg={cardBg}
          backdropFilter="blur(20px)"
          boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
          borderRadius="3xl"
          p={{ base: 6, md: 10 }}
          border="1px solid"
          borderColor={useColorModeValue("whiteAlpha.400", "whiteAlpha.200")}
          position="relative"
          zIndex={1}
        >
          {/* Logo/Brand */}
          <VStack spacing={2} mb={6}>
            <Box
              fontSize="4xl"
              fontWeight="black"
              letterSpacing="tight"
              bgGradient="linear(to-r, teal.400, purple.500)"
              bgClip="text"
            >
              storytype
            </Box>
            <Text color="gray.500" fontSize="sm">
              Track your typing journey
            </Text>
          </VStack>

          <Tabs
            variant="soft-rounded"
            colorScheme="teal"
            isFitted
            index={tabIndex}
            onChange={(index) => setTabIndex(index)}
          >
            <TabList
              mb={8}
              bg={useColorModeValue("gray.100", "gray.700")}
              p={1}
              borderRadius="xl"
            >
              <Tab
                fontWeight="bold"
                borderRadius="lg"
                _selected={{
                  bg: "teal.400",
                  color: "white",
                  boxShadow: "md",
                }}
                transition="all 0.3s"
              >
                Register
              </Tab>
              <Tab
                fontWeight="bold"
                borderRadius="lg"
                _selected={{
                  bg: "teal.400",
                  color: "white",
                  boxShadow: "md",
                }}
                transition="all 0.3s"
              >
                Login
              </Tab>
            </TabList>
            <TabPanels>
              {/* Register Tab */}
              <TabPanel>
                <Fade in={true}>
                  <form onSubmit={handleRegisterSubmit}>
                    <VStack spacing={5} align="stretch">
                      <HStack mb={2} justify="center">
                        <Icon as={FaUserPlus} color="teal.400" boxSize={5} />
                        <Heading
                          size="md"
                          bgGradient="linear(to-r, teal.400, purple.500)"
                          bgClip="text"
                        >
                          Create Account
                        </Heading>
                      </HStack>

                      <FormControl isInvalid={registerErrors.username}>
                        <InputGroup>
                          <InputLeftElement pointerEvents="none">
                            <Icon as={FaUser} color="gray.400" />
                          </InputLeftElement>
                          <Input
                            name="username"
                            placeholder="Username"
                            bg={inputBg}
                            border="2px"
                            borderColor={inputBorder}
                            value={registerData.username}
                            onChange={handleRegisterChange}
                            _hover={{ borderColor: "teal.300" }}
                            _focus={{
                              borderColor: "teal.400",
                              bg: inputFocusBg,
                              boxShadow: "0 0 0 1px teal.400",
                            }}
                            transition="all 0.3s"
                          />
                        </InputGroup>
                        <FormErrorMessage>
                          {registerErrors.username}
                        </FormErrorMessage>
                      </FormControl>

                      <FormControl isInvalid={registerErrors.email}>
                        <InputGroup>
                          <InputLeftElement pointerEvents="none">
                            <Icon as={FaEnvelope} color="gray.400" />
                          </InputLeftElement>
                          <Input
                            name="email"
                            placeholder="Email"
                            type="email"
                            bg={inputBg}
                            border="2px"
                            borderColor={inputBorder}
                            value={registerData.email}
                            onChange={handleRegisterChange}
                            _hover={{ borderColor: "teal.300" }}
                            _focus={{
                              borderColor: "teal.400",
                              bg: inputFocusBg,
                              boxShadow: "0 0 0 1px teal.400",
                            }}
                            transition="all 0.3s"
                          />
                        </InputGroup>
                        <FormErrorMessage>
                          {registerErrors.email}
                        </FormErrorMessage>
                      </FormControl>

                      <FormControl isInvalid={registerErrors.confirmEmail}>
                        <InputGroup>
                          <InputLeftElement pointerEvents="none">
                            <Icon as={FaEnvelope} color="gray.400" />
                          </InputLeftElement>
                          <Input
                            name="confirmEmail"
                            placeholder="Confirm Email"
                            type="email"
                            bg={inputBg}
                            border="2px"
                            borderColor={inputBorder}
                            value={registerData.confirmEmail}
                            onChange={handleRegisterChange}
                            _hover={{ borderColor: "teal.300" }}
                            _focus={{
                              borderColor: "teal.400",
                              bg: inputFocusBg,
                              boxShadow: "0 0 0 1px teal.400",
                            }}
                            transition="all 0.3s"
                          />
                        </InputGroup>
                        <FormErrorMessage>
                          {registerErrors.confirmEmail}
                        </FormErrorMessage>
                      </FormControl>

                      <FormControl isInvalid={registerErrors.password}>
                        <InputGroup>
                          <InputLeftElement pointerEvents="none">
                            <Icon as={FaLock} color="gray.400" />
                          </InputLeftElement>
                          <Input
                            name="password"
                            placeholder="Password"
                            type={showRegisterPassword ? "text" : "password"}
                            bg={inputBg}
                            border="2px"
                            borderColor={inputBorder}
                            value={registerData.password}
                            onChange={handleRegisterChange}
                            _hover={{ borderColor: "teal.300" }}
                            _focus={{
                              borderColor: "teal.400",
                              bg: inputFocusBg,
                              boxShadow: "0 0 0 1px teal.400",
                            }}
                            transition="all 0.3s"
                          />
                          <InputRightElement>
                            <IconButton
                              size="sm"
                              variant="ghost"
                              icon={
                                showRegisterPassword ? (
                                  <FaEyeSlash />
                                ) : (
                                  <FaEye />
                                )
                              }
                              onClick={() =>
                                setShowRegisterPassword(!showRegisterPassword)
                              }
                              aria-label={
                                showRegisterPassword
                                  ? "Hide password"
                                  : "Show password"
                              }
                            />
                          </InputRightElement>
                        </InputGroup>
                        <FormErrorMessage>
                          {registerErrors.password}
                        </FormErrorMessage>
                      </FormControl>

                      <FormControl isInvalid={registerErrors.confirmPassword}>
                        <InputGroup>
                          <InputLeftElement pointerEvents="none">
                            <Icon as={FaLock} color="gray.400" />
                          </InputLeftElement>
                          <Input
                            name="confirmPassword"
                            placeholder="Confirm Password"
                            type={
                              showRegisterConfirmPassword ? "text" : "password"
                            }
                            bg={inputBg}
                            border="2px"
                            borderColor={inputBorder}
                            value={registerData.confirmPassword}
                            onChange={handleRegisterChange}
                            _hover={{ borderColor: "teal.300" }}
                            _focus={{
                              borderColor: "teal.400",
                              bg: inputFocusBg,
                              boxShadow: "0 0 0 1px teal.400",
                            }}
                            transition="all 0.3s"
                          />
                          <InputRightElement>
                            <IconButton
                              size="sm"
                              variant="ghost"
                              icon={
                                showRegisterConfirmPassword ? (
                                  <FaEyeSlash />
                                ) : (
                                  <FaEye />
                                )
                              }
                              onClick={() =>
                                setShowRegisterConfirmPassword(
                                  !showRegisterConfirmPassword
                                )
                              }
                              aria-label={
                                showRegisterConfirmPassword
                                  ? "Hide password"
                                  : "Show password"
                              }
                            />
                          </InputRightElement>
                        </InputGroup>
                        <FormErrorMessage>
                          {registerErrors.confirmPassword}
                        </FormErrorMessage>
                      </FormControl>

                      <Button
                        type="submit"
                        leftIcon={<FaUserPlus />}
                        bgGradient="linear(to-r, teal.400, purple.500)"
                        color="white"
                        mt={2}
                        w="100%"
                        size="lg"
                        isLoading={registerLoading}
                        loadingText="Creating account..."
                        _hover={{
                          bgGradient: "linear(to-r, teal.500, purple.600)",
                          transform: "translateY(-2px)",
                          boxShadow: "lg",
                        }}
                        _active={{
                          transform: "translateY(0)",
                        }}
                        transition="all 0.3s"
                      >
                        Sign Up
                      </Button>
                    </VStack>
                  </form>
                </Fade>
              </TabPanel>

              {/* Login Tab */}
              <TabPanel>
                <Fade in={true}>
                  <form onSubmit={handleLoginSubmit}>
                    <VStack spacing={5} align="stretch">
                      <HStack mb={2} justify="center">
                        <Icon as={FaSignInAlt} color="teal.400" boxSize={5} />
                        <Heading
                          size="md"
                          bgGradient="linear(to-r, teal.400, purple.500)"
                          bgClip="text"
                        >
                          Welcome Back
                        </Heading>
                      </HStack>

                      <FormControl isInvalid={loginErrors.email}>
                        <InputGroup>
                          <InputLeftElement pointerEvents="none">
                            <Icon as={FaEnvelope} color="gray.400" />
                          </InputLeftElement>
                          <Input
                            name="email"
                            placeholder="Email"
                            type="email"
                            bg={inputBg}
                            border="2px"
                            borderColor={inputBorder}
                            value={loginData.email}
                            onChange={handleLoginChange}
                            _hover={{ borderColor: "teal.300" }}
                            _focus={{
                              borderColor: "teal.400",
                              bg: inputFocusBg,
                              boxShadow: "0 0 0 1px teal.400",
                            }}
                            transition="all 0.3s"
                          />
                        </InputGroup>
                        <FormErrorMessage>{loginErrors.email}</FormErrorMessage>
                      </FormControl>

                      <FormControl isInvalid={loginErrors.password}>
                        <InputGroup>
                          <InputLeftElement pointerEvents="none">
                            <Icon as={FaLock} color="gray.400" />
                          </InputLeftElement>
                          <Input
                            name="password"
                            placeholder="Password"
                            type={showLoginPassword ? "text" : "password"}
                            bg={inputBg}
                            border="2px"
                            borderColor={inputBorder}
                            value={loginData.password}
                            onChange={handleLoginChange}
                            _hover={{ borderColor: "teal.300" }}
                            _focus={{
                              borderColor: "teal.400",
                              bg: inputFocusBg,
                              boxShadow: "0 0 0 1px teal.400",
                            }}
                            transition="all 0.3s"
                          />
                          <InputRightElement>
                            <IconButton
                              size="sm"
                              variant="ghost"
                              icon={
                                showLoginPassword ? <FaEyeSlash /> : <FaEye />
                              }
                              onClick={() =>
                                setShowLoginPassword(!showLoginPassword)
                              }
                              aria-label={
                                showLoginPassword
                                  ? "Hide password"
                                  : "Show password"
                              }
                            />
                          </InputRightElement>
                        </InputGroup>
                        <FormErrorMessage>
                          {loginErrors.password}
                        </FormErrorMessage>
                      </FormControl>

                      <HStack justify="space-between">
                        <Checkbox
                          name="rememberMe"
                          colorScheme="teal"
                          isChecked={loginData.rememberMe}
                          onChange={handleLoginChange}
                        >
                          Remember me
                        </Checkbox>
                        <Button
                          variant="link"
                          colorScheme="teal"
                          fontSize="sm"
                          isDisabled
                          _hover={{ textDecoration: "underline" }}
                        >
                          Forgot password?
                        </Button>
                      </HStack>

                      <Button
                        type="submit"
                        leftIcon={<FaSignInAlt />}
                        bgGradient="linear(to-r, teal.400, purple.500)"
                        color="white"
                        mt={2}
                        w="100%"
                        size="lg"
                        isLoading={loginLoading}
                        loadingText="Signing in..."
                        _hover={{
                          bgGradient: "linear(to-r, teal.500, purple.600)",
                          transform: "translateY(-2px)",
                          boxShadow: "lg",
                        }}
                        _active={{
                          transform: "translateY(0)",
                        }}
                        transition="all 0.3s"
                      >
                        Sign In
                      </Button>
                    </VStack>
                  </form>
                </Fade>
              </TabPanel>
            </TabPanels>
          </Tabs>

          {/* Footer */}
          <Text textAlign="center" mt={6} fontSize="xs" color="gray.500">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </Box>
      </ScaleFade>
    </Flex>
  );
}
