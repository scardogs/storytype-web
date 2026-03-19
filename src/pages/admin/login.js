import { useState, useEffect } from "react";
import {
  Box,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Button,
  Text,
  VStack,
  Alert,
  AlertIcon,
  AlertDescription,
  Heading,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  IconButton,
} from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import { ViewIcon, ViewOffIcon, EmailIcon, LockIcon } from "@chakra-ui/icons";
import { useRouter } from "next/router";
import { useToast } from "@chakra-ui/react";

const glowPulse = keyframes`
  0%, 100% { box-shadow: 0 0 40px rgba(49, 196, 190, 0.15), 0 0 80px rgba(49, 196, 190, 0.05); }
  50% { box-shadow: 0 0 60px rgba(49, 196, 190, 0.25), 0 0 120px rgba(49, 196, 190, 0.1); }
`;

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const toast = useToast();

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/admin/auth/me", {
        credentials: "include",
      });

      if (response.ok) {
        router.push("/admin");
      }
    } catch (error) {
      // Not logged in, stay on login page
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Login successful",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
        router.push("/admin");
      } else {
        setError(data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      bg="gray.900"
      bgImage="radial-gradient(circle at 20% 80%, rgba(49, 196, 190, 0.08) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(66, 153, 225, 0.08) 0%, transparent 50%), radial-gradient(circle at 50% 50%, rgba(49, 196, 190, 0.03) 0%, transparent 70%)"
      position="relative"
      overflow="hidden"
    >
      {/* Subtle grid pattern overlay */}
      <Box
        position="absolute"
        inset="0"
        opacity={0.03}
        bgImage="linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)"
        bgSize="60px 60px"
        pointerEvents="none"
      />

      <Box
        w="full"
        maxW="440px"
        mx={4}
        position="relative"
        zIndex={1}
      >
        {/* Login Card */}
        <Box
          bg="gray.800"
          border="1px solid"
          borderColor="gray.700"
          rounded="2xl"
          px={{ base: 8, md: 10 }}
          py={{ base: 10, md: 12 }}
          animation={`${glowPulse} 4s ease-in-out infinite`}
          transition="all 0.3s ease"
          _hover={{
            borderColor: "gray.600",
          }}
        >
          <VStack spacing={8}>
            {/* Brand Header */}
            <VStack spacing={2}>
              <Heading
                fontSize={{ base: "3xl", md: "4xl" }}
                fontWeight="800"
                bgGradient="linear(to-r, teal.400, blue.400)"
                bgClip="text"
                letterSpacing="-0.02em"
              >
                StoryType
              </Heading>
              <Text
                color="gray.500"
                fontSize="sm"
                fontWeight="500"
                textTransform="uppercase"
                letterSpacing="0.15em"
              >
                Admin Portal
              </Text>
            </VStack>

            {/* Error Alert */}
            {error && (
              <Alert
                status="error"
                rounded="xl"
                bg="red.900"
                borderColor="red.700"
                border="1px solid"
                py={3}
              >
                <AlertIcon color="red.300" />
                <AlertDescription color="red.200" fontSize="sm">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} style={{ width: "100%" }}>
              <VStack spacing={5}>
                <FormControl isRequired>
                  <FormLabel
                    color="gray.400"
                    fontSize="xs"
                    fontWeight="600"
                    textTransform="uppercase"
                    letterSpacing="0.08em"
                    mb={2}
                  >
                    Email Address
                  </FormLabel>
                  <InputGroup>
                    <InputLeftElement
                      pointerEvents="none"
                      h="full"
                    >
                      <EmailIcon color="gray.500" />
                    </InputLeftElement>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@storytype.com"
                      size="lg"
                      bg="gray.900"
                      border="1px solid"
                      borderColor="gray.700"
                      color="white"
                      rounded="xl"
                      _placeholder={{ color: "gray.600" }}
                      _hover={{ borderColor: "gray.600" }}
                      _focus={{
                        borderColor: "teal.400",
                        boxShadow: "0 0 0 1px var(--chakra-colors-teal-400)",
                        bg: "gray.900",
                      }}
                      transition="all 0.2s ease"
                    />
                  </InputGroup>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel
                    color="gray.400"
                    fontSize="xs"
                    fontWeight="600"
                    textTransform="uppercase"
                    letterSpacing="0.08em"
                    mb={2}
                  >
                    Password
                  </FormLabel>
                  <InputGroup>
                    <InputLeftElement
                      pointerEvents="none"
                      h="full"
                    >
                      <LockIcon color="gray.500" />
                    </InputLeftElement>
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      size="lg"
                      bg="gray.900"
                      border="1px solid"
                      borderColor="gray.700"
                      color="white"
                      rounded="xl"
                      _placeholder={{ color: "gray.600" }}
                      _hover={{ borderColor: "gray.600" }}
                      _focus={{
                        borderColor: "teal.400",
                        boxShadow: "0 0 0 1px var(--chakra-colors-teal-400)",
                        bg: "gray.900",
                      }}
                      transition="all 0.2s ease"
                    />
                    <InputRightElement h="full" pr={1}>
                      <IconButton
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                        variant="ghost"
                        size="sm"
                        color="gray.500"
                        _hover={{ color: "gray.300", bg: "gray.700" }}
                        rounded="lg"
                        onClick={() => setShowPassword(!showPassword)}
                      />
                    </InputRightElement>
                  </InputGroup>
                </FormControl>

                <Button
                  type="submit"
                  size="lg"
                  w="full"
                  mt={2}
                  bgGradient="linear(to-r, teal.500, teal.400)"
                  color="white"
                  rounded="xl"
                  fontWeight="600"
                  fontSize="md"
                  isLoading={isLoading}
                  loadingText="Signing in..."
                  _hover={{
                    bgGradient: "linear(to-r, teal.400, blue.400)",
                    transform: "translateY(-1px)",
                    boxShadow: "0 4px 20px rgba(49, 196, 190, 0.35)",
                  }}
                  _active={{
                    transform: "translateY(0)",
                    boxShadow: "0 2px 10px rgba(49, 196, 190, 0.25)",
                  }}
                  transition="all 0.2s ease"
                >
                  Sign In
                </Button>
              </VStack>
            </form>
          </VStack>
        </Box>

        {/* Footer text */}
        <Text
          textAlign="center"
          color="gray.600"
          fontSize="xs"
          mt={6}
        >
          Authorized personnel only
        </Text>
      </Box>
    </Flex>
  );
}
