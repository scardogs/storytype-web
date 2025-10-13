import React from "react";
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  SimpleGrid,
  useColorModeValue,
  Icon,
  Flex,
  Fade,
  IconButton,
  HStack,
  Container,
  Stack,
  Badge,
  ScaleFade,
} from "@chakra-ui/react";
import {
  InfoOutlineIcon,
  StarIcon,
  CheckCircleIcon,
  ArrowForwardIcon,
} from "@chakra-ui/icons";
import { useRouter } from "next/router";
import {
  FaFacebook,
  FaEnvelope,
  FaPhone,
  FaKeyboard,
  FaChartLine,
  FaTrophy,
  FaUsers,
  FaFire,
  FaBolt,
  FaGraduationCap,
  FaRocket,
  FaHeart,
  FaMagic,
} from "react-icons/fa";

const features = [
  {
    icon: FaKeyboard,
    title: "Immersive Stories",
    description:
      "Practice typing with captivating narratives across multiple genres",
    color: "teal",
  },
  {
    icon: FaChartLine,
    title: "Real-time Analytics",
    description:
      "Track your WPM, accuracy, and improvement over time with detailed graphs",
    color: "purple",
  },
  {
    icon: FaTrophy,
    title: "Global Leaderboards",
    description: "Compete with typists worldwide and climb the ranks",
    color: "yellow",
  },
  {
    icon: FaFire,
    title: "Combo System",
    description: "Build streaks and unlock achievements as you type perfectly",
    color: "orange",
  },
  {
    icon: FaBolt,
    title: "Instant Feedback",
    description: "Get immediate visual and audio feedback on every keystroke",
    color: "blue",
  },
  {
    icon: FaGraduationCap,
    title: "Progress Tracking",
    description:
      "Monitor your growth with comprehensive statistics and insights",
    color: "green",
  },
];

const genres = [
  {
    name: "Fantasy",
    tagline: "Magic & Adventure",
    icon: FaMagic,
    gradient: "linear(to-br, purple.400, pink.600)",
  },
  {
    name: "Mystery",
    tagline: "Solve the Unknown",
    icon: FaBolt,
    gradient: "linear(to-br, blue.400, cyan.600)",
  },
  {
    name: "Sci-Fi",
    tagline: "Future Awaits",
    icon: FaRocket,
    gradient: "linear(to-br, teal.400, green.600)",
  },
  {
    name: "Romance",
    tagline: "Feel the Love",
    icon: FaHeart,
    gradient: "linear(to-br, pink.400, red.600)",
  },
];

const stats = [
  { number: "10K+", label: "Words Available" },
  { number: "100+", label: "Stories" },
  { number: "50+", label: "Active Users" },
  { number: "98%", label: "Satisfaction" },
];

export default function HomePageTab() {
  const router = useRouter();
  const cardBg = useColorModeValue(
    "rgba(255, 255, 255, 0.9)",
    "rgba(26, 32, 44, 0.9)"
  );
  const textColor = useColorModeValue("gray.800", "gray.100");
  const subText = useColorModeValue("gray.600", "gray.400");
  const featureBorderColor = useColorModeValue(
    "whiteAlpha.400",
    "whiteAlpha.200"
  );
  const ctaBg = useColorModeValue("teal.50", "teal.900");

  return (
    <Box
      minH="100vh"
      bgGradient={useColorModeValue(
        "linear(to-br, teal.50, purple.100, pink.50)",
        "linear(to-br, gray.900, teal.900, purple.900)"
      )}
      position="relative"
      overflow="hidden"
    >
      {/* CSS Animations */}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>

      {/* Animated Background Elements */}
      <Box
        position="absolute"
        top="-20%"
        right="-10%"
        w="600px"
        h="600px"
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
        w="500px"
        h="500px"
        bgGradient="radial(purple.400, transparent)"
        opacity={0.3}
        borderRadius="full"
        filter="blur(80px)"
        animation="float 10s ease-in-out infinite reverse"
      />

      <Container
        maxW="7xl"
        px={{ base: 4, md: 8 }}
        py={20}
        position="relative"
        zIndex={1}
      >
        <VStack spacing={20}>
          {/* Hero Section */}
          <ScaleFade initialScale={0.9} in={true}>
            <VStack spacing={8} textAlign="center" maxW="4xl" mx="auto">
              <Badge
                colorScheme="teal"
                fontSize="md"
                px={4}
                py={2}
                borderRadius="full"
                animation="pulse 2s ease-in-out infinite"
              >
                ✨ The Future of Typing Practice
              </Badge>

              <Heading
                as="h1"
                fontSize={{ base: "4xl", md: "6xl", lg: "7xl" }}
                fontWeight="black"
                letterSpacing="tight"
                bgGradient="linear(to-r, teal.400, purple.500, pink.500)"
                bgClip="text"
                lineHeight="1.2"
              >
                Master Typing Through Stories
              </Heading>

              <Text
                fontSize={{ base: "lg", md: "xl" }}
                color={subText}
                maxW="3xl"
                lineHeight="tall"
              >
                Transform boring typing drills into an epic adventure. Practice
                with immersive stories, track your progress in real-time, and
                compete with typists worldwide.
                <Text as="span" fontWeight="bold" color="teal.400">
                  {" "}
                  Level up your skills while having fun!
                </Text>
              </Text>

              <Stack
                direction={{ base: "column", md: "row" }}
                spacing={4}
                pt={4}
              >
                <Button
                  size="lg"
                  colorScheme="teal"
                  bgGradient="linear(to-r, teal.400, purple.500)"
                  color="white"
                  px={8}
                  py={7}
                  fontSize="xl"
                  borderRadius="full"
                  rightIcon={<ArrowForwardIcon />}
                  onClick={() => router.push("/type")}
                  _hover={{
                    bgGradient: "linear(to-r, teal.500, purple.600)",
                    transform: "translateY(-2px)",
                    boxShadow: "xl",
                  }}
                  transition="all 0.3s"
                >
                  Start Your Journey
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  borderWidth="2px"
                  borderColor="teal.400"
                  color="teal.400"
                  px={8}
                  py={7}
                  fontSize="xl"
                  borderRadius="full"
                  rightIcon={<FaChartLine />}
                  onClick={() => router.push("/analytics")}
                  _hover={{
                    bg: "teal.50",
                    transform: "translateY(-2px)",
                  }}
                  transition="all 0.3s"
                >
                  View Analytics
                </Button>
              </Stack>

              {/* Stats */}
              <SimpleGrid
                columns={{ base: 2, md: 4 }}
                spacing={8}
                pt={12}
                w="full"
              >
                {stats.map((stat, idx) => (
                  <VStack key={idx} spacing={2}>
                    <Text
                      fontSize="4xl"
                      fontWeight="black"
                      bgGradient="linear(to-r, teal.400, purple.500)"
                      bgClip="text"
                    >
                      {stat.number}
                    </Text>
                    <Text color={subText} fontSize="sm" fontWeight="medium">
                      {stat.label}
                    </Text>
                  </VStack>
                ))}
              </SimpleGrid>
            </VStack>
          </ScaleFade>

          {/* Features Section */}
          <Box w="full">
            <VStack spacing={12}>
              <VStack spacing={4} textAlign="center">
                <Heading
                  size="2xl"
                  bgGradient="linear(to-r, teal.400, purple.500)"
                  bgClip="text"
                >
                  Powerful Features
                </Heading>
                <Text fontSize="lg" color={subText} maxW="2xl">
                  Everything you need to become a typing master
                </Text>
              </VStack>

              <SimpleGrid
                columns={{ base: 1, md: 2, lg: 3 }}
                spacing={8}
                w="full"
              >
                {features.map((feature, idx) => (
                  <ScaleFade key={idx} in={true} delay={idx * 0.1}>
                    <Box
                      bg={cardBg}
                      backdropFilter="blur(20px)"
                      p={8}
                      borderRadius="2xl"
                      boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                      border="1px solid"
                      borderColor={featureBorderColor}
                      _hover={{
                        transform: "translateY(-8px)",
                        boxShadow: "0 12px 40px 0 rgba(0, 0, 0, 0.5)",
                      }}
                      transition="all 0.3s"
                      h="full"
                    >
                      <VStack align="start" spacing={4}>
                        <Icon
                          as={feature.icon}
                          boxSize={12}
                          color={`${feature.color}.400`}
                        />
                        <Heading size="md" color={textColor}>
                          {feature.title}
                        </Heading>
                        <Text color={subText}>{feature.description}</Text>
                      </VStack>
                    </Box>
                  </ScaleFade>
                ))}
              </SimpleGrid>
            </VStack>
          </Box>

          {/* Genres Section */}
          <Box w="full">
            <VStack spacing={12}>
              <VStack spacing={4} textAlign="center">
                <Heading
                  size="2xl"
                  bgGradient="linear(to-r, teal.400, purple.500)"
                  bgClip="text"
                >
                  Choose Your Story
                </Heading>
                <Text fontSize="lg" color={subText} maxW="2xl">
                  Four unique genres to match your mood
                </Text>
              </VStack>

              <SimpleGrid
                columns={{ base: 1, sm: 2, md: 4 }}
                spacing={6}
                w="full"
              >
                {genres.map((genre, idx) => (
                  <Box
                    key={idx}
                    bgGradient={genre.gradient}
                    p={8}
                    borderRadius="2xl"
                    textAlign="center"
                    cursor="pointer"
                    color="white"
                    _hover={{
                      transform: "translateY(-8px) scale(1.05)",
                      boxShadow: "2xl",
                    }}
                    transition="all 0.3s"
                    onClick={() => router.push("/type")}
                  >
                    <VStack spacing={4}>
                      <Icon as={genre.icon} boxSize={12} />
                      <VStack spacing={1}>
                        <Text fontSize="2xl" fontWeight="bold">
                          {genre.name}
                        </Text>
                        <Text fontSize="sm" opacity={0.9}>
                          {genre.tagline}
                        </Text>
                      </VStack>
                    </VStack>
                  </Box>
                ))}
              </SimpleGrid>
            </VStack>
          </Box>

          {/* CTA Section */}
          <Box
            w="full"
            bg={cardBg}
            backdropFilter="blur(20px)"
            p={12}
            borderRadius="3xl"
            boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
            border="1px solid"
            borderColor={featureBorderColor}
            textAlign="center"
          >
            <VStack spacing={6}>
              <Icon as={FaUsers} boxSize={16} color="teal.400" />
              <Heading size="xl" color={textColor}>
                Join Our Community
              </Heading>
              <Text fontSize="lg" color={subText} maxW="2xl">
                Thousands of users are already improving their typing skills.
                Start your journey today and see the difference!
              </Text>
              <HStack spacing={4}>
                <Button
                  size="lg"
                  bgGradient="linear(to-r, teal.400, purple.500)"
                  color="white"
                  px={8}
                  py={6}
                  fontSize="lg"
                  borderRadius="full"
                  rightIcon={<FaRocket />}
                  onClick={() => router.push("/profile")}
                  _hover={{
                    bgGradient: "linear(to-r, teal.500, purple.600)",
                    transform: "translateY(-2px)",
                    boxShadow: "xl",
                  }}
                  transition="all 0.3s"
                >
                  Get Started Free
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  borderWidth="2px"
                  borderColor="teal.400"
                  color="teal.400"
                  px={8}
                  py={6}
                  fontSize="lg"
                  borderRadius="full"
                  rightIcon={<FaTrophy />}
                  onClick={() => router.push("/leaderboard")}
                  _hover={{
                    bg: ctaBg,
                    transform: "translateY(-2px)",
                  }}
                  transition="all 0.3s"
                >
                  View Leaderboard
                </Button>
              </HStack>
            </VStack>
          </Box>

          {/* Footer/Contact Section */}
          <VStack spacing={6} pt={12}>
            <HStack spacing={6}>
              <IconButton
                as="a"
                href="https://facebook.com/johnmichael.escarlan"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                icon={<FaFacebook />}
                size="lg"
                colorScheme="facebook"
                variant="ghost"
                fontSize="3xl"
                _hover={{ transform: "scale(1.2)" }}
                transition="all 0.2s"
              />
              <IconButton
                as="a"
                href="mailto:johnmichael.escarlan14@gmail.com"
                aria-label="Gmail"
                icon={<FaEnvelope />}
                size="lg"
                colorScheme="red"
                variant="ghost"
                fontSize="3xl"
                _hover={{ transform: "scale(1.2)" }}
                transition="all 0.2s"
              />
              <IconButton
                as="a"
                href="tel:09946760366"
                aria-label="Phone"
                icon={<FaPhone />}
                size="lg"
                colorScheme="teal"
                variant="ghost"
                fontSize="3xl"
                _hover={{ transform: "scale(1.2)" }}
                transition="all 0.2s"
              />
            </HStack>
            <Text color={subText} fontSize="sm" textAlign="center">
              Connect with us: @johnmichael.escarlan |
              johnmichael.escarlan14@gmail.com | 09946760366
            </Text>
            <Text color={subText} fontSize="xs" opacity={0.6}>
              © 2025 StoryType. Made with ❤️ for typists worldwide.
            </Text>
          </VStack>
        </VStack>
      </Container>
    </Box>
  );
}
