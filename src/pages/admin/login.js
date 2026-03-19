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
  useColorModeValue,
  Container,
  Heading,
  InputGroup,
  InputRightElement,
  IconButton,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { useRouter } from "next/router";
import { useToast } from "@chakra-ui/react";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const toast = useToast();
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  useEffect(() => {
    // Check if already logged in
    checkAuth();
  }, []);

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
    <Box minH="100vh" bg={useColorModeValue("gray.50", "gray.900")}>
      <Container maxW="md" py={{ base: 6, md: 12 }} px={{ base: 4, md: 6 }}>
        <Flex
          align="center"
          justify="center"
          minH={{ base: "90vh", md: "80vh" }}
        >
          <Box
            bg={bgColor}
            p={{ base: 6, md: 8 }}
            rounded="lg"
            shadow="lg"
            border="1px"
            borderColor={borderColor}
            w="full"
          >
            <VStack spacing={{ base: 4, md: 6 }}>
              <VStack spacing={2}>
                <Heading
                  size={{ base: "md", md: "lg" }}
                  color={useColorModeValue("gray.800", "white")}
                  textAlign="center"
                >
                  Admin Login
                </Heading>
                <Text
                  color={useColorModeValue("gray.600", "gray.400")}
                  fontSize={{ base: "sm", md: "md" }}
                  textAlign="center"
                >
                  Sign in to access the admin dashboard
                </Text>
              </VStack>

              {error && (
                <Alert
                  status="error"
                  rounded="md"
                  fontSize={{ base: "sm", md: "md" }}
                >
                  <AlertIcon />
                  {error}
                </Alert>
              )}

              <form onSubmit={handleSubmit} style={{ width: "100%" }}>
                <VStack spacing={{ base: 3, md: 4 }}>
                  <FormControl isRequired>
                    <FormLabel fontSize={{ base: "sm", md: "md" }}>
                      Email
                    </FormLabel>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@example.com"
                      bg={useColorModeValue("white", "gray.700")}
                      size={{ base: "md", md: "lg" }}
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel fontSize={{ base: "sm", md: "md" }}>
                      Password
                    </FormLabel>
                    <InputGroup>
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        bg={useColorModeValue("white", "gray.700")}
                        size={{ base: "md", md: "lg" }}
                      />
                      <InputRightElement>
                        <IconButton
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                          icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowPassword(!showPassword)}
                        />
                      </InputRightElement>
                    </InputGroup>
                  </FormControl>

                  <Button
                    type="submit"
                    colorScheme="blue"
                    size={{ base: "md", md: "lg" }}
                    w="full"
                    isLoading={isLoading}
                    loadingText="Signing in..."
                    fontSize={{ base: "sm", md: "md" }}
                  >
                    Sign In
                  </Button>
                </VStack>
              </form>
            </VStack>
          </Box>
        </Flex>
      </Container>
    </Box>
  );
}
