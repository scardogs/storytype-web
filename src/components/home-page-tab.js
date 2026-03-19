import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Container,
  Flex,
  IconButton,
  Icon,
  SimpleGrid,
  Grid,
  GridItem,
} from "@chakra-ui/react";
import { ArrowForwardIcon } from "@chakra-ui/icons";
import { useRouter } from "next/router";
import {
  FaFacebook,
  FaEnvelope,
  FaPhone,
  FaKeyboard,
  FaTrophy,
  FaGraduationCap,
  FaChartBar,
  FaBolt,
  FaArrowRight,
} from "react-icons/fa";

const DEMO_TEXT =
  "The old lighthouse keeper watched the storm roll in from the west, its dark clouds swallowing the horizon like ink dropped into water.";

// Fake WPM counter that ticks up with the demo
function TypingDemo() {
  const [typed, setTyped] = useState("");
  const [charIndex, setCharIndex] = useState(0);
  const [wpm, setWpm] = useState(0);
  const startTime = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    const delay = setTimeout(() => {
      startTime.current = Date.now();
      intervalRef.current = setInterval(() => {
        setCharIndex((prev) => {
          if (prev >= DEMO_TEXT.length) {
            clearInterval(intervalRef.current);
            setTimeout(() => {
              setCharIndex(0);
              setTyped("");
              setWpm(0);
              startTime.current = null;
            }, 2500);
            return prev;
          }
          const next = prev + 1;
          setTyped(DEMO_TEXT.slice(0, next));
          // calc wpm
          if (startTime.current) {
            const elapsed = (Date.now() - startTime.current) / 1000 / 60;
            if (elapsed > 0) {
              const words = DEMO_TEXT.slice(0, next).split(/\s+/).length;
              setWpm(Math.round(words / elapsed));
            }
          }
          return next;
        });
      }, 58 + Math.random() * 35);
    }, 1500);

    return () => {
      clearTimeout(delay);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [typed === ""]);

  const accuracy = charIndex > 0 ? 100 : 0;
  const wordsTyped = typed.trim().split(/\s+/).filter(Boolean).length;

  return (
    <Box w="full" maxW="720px" mx="auto">
      {/* Terminal-style window */}
      <Box
        bg="gray.800"
        borderRadius="xl"
        overflow="hidden"
        border="1px solid"
        borderColor="gray.700"
        boxShadow="0 24px 48px -12px rgba(0,0,0,0.5)"
      >
        {/* Title bar */}
        <Flex
          px={4}
          py={2.5}
          bg="gray.850"
          borderBottom="1px solid"
          borderColor="gray.700"
          align="center"
          justify="space-between"
        >
          <HStack spacing={2}>
            <Box w="12px" h="12px" borderRadius="full" bg="red.400" opacity={0.8} />
            <Box w="12px" h="12px" borderRadius="full" bg="yellow.400" opacity={0.8} />
            <Box w="12px" h="12px" borderRadius="full" bg="green.400" opacity={0.8} />
          </HStack>
          <Text fontSize="xs" color="gray.500" fontFamily="mono">
            storytype — Fantasy
          </Text>
          <Box w="52px" />
        </Flex>

        {/* Typing area */}
        <Box
          fontFamily="'JetBrains Mono', 'Fira Code', monospace"
          fontSize={{ base: "sm", md: "md", lg: "lg" }}
          px={{ base: 5, md: 8 }}
          py={{ base: 5, md: 7 }}
          lineHeight="1.8"
          minH={{ base: "100px", md: "120px" }}
        >
          {DEMO_TEXT.split("").map((char, i) => {
            if (i < typed.length) {
              return (
                <Text
                  as="span"
                  key={i}
                  color={typed[i] === char ? "teal.300" : "red.400"}
                  transition="color 0.05s"
                >
                  {char}
                </Text>
              );
            }
            if (i === typed.length) {
              return (
                <Text
                  as="span"
                  key={i}
                  color="white"
                  bg="teal.600"
                  borderRadius="1px"
                  px="1px"
                >
                  {char}
                </Text>
              );
            }
            return (
              <Text as="span" key={i} color="gray.600">
                {char}
              </Text>
            );
          })}
          {charIndex >= DEMO_TEXT.length && (
            <Text
              as="span"
              animation="cursorBlink 1s step-end infinite"
              color="teal.400"
            >
              |
            </Text>
          )}
        </Box>

        {/* Stats bar at bottom */}
        <Flex
          px={{ base: 5, md: 8 }}
          py={3}
          borderTop="1px solid"
          borderColor="gray.700"
          bg="blackAlpha.300"
          gap={{ base: 4, md: 8 }}
          fontSize="xs"
          fontFamily="mono"
        >
          <HStack spacing={2}>
            <Box w="6px" h="6px" borderRadius="full" bg={wpm > 0 ? "teal.400" : "gray.600"} />
            <Text color="gray.500">
              WPM{" "}
              <Text as="span" color={wpm > 0 ? "teal.300" : "gray.600"} fontWeight="700">
                {wpm}
              </Text>
            </Text>
          </HStack>
          <Text color="gray.500">
            ACC{" "}
            <Text as="span" color={accuracy > 0 ? "green.300" : "gray.600"} fontWeight="700">
              {accuracy}%
            </Text>
          </Text>
          <Text color="gray.500">
            WORDS{" "}
            <Text as="span" color="gray.400" fontWeight="700">
              {wordsTyped}
            </Text>
          </Text>
          <Text color="gray.500" ml="auto" display={{ base: "none", md: "block" }}>
            00:{charIndex > 0 ? String(Math.min(Math.floor(charIndex / 12), 59)).padStart(2, "0") : "00"}
          </Text>
        </Flex>
      </Box>
    </Box>
  );
}

// Keyboard key component
function Key({ children, size = "md", ...props }) {
  const sizes = {
    sm: { px: 2, py: 1, fontSize: "2xs" },
    md: { px: 3, py: 1.5, fontSize: "xs" },
  };
  return (
    <Box
      display="inline-flex"
      alignItems="center"
      justifyContent="center"
      bg="gray.800"
      border="1px solid"
      borderColor="gray.600"
      borderBottom="2px solid"
      borderBottomColor="gray.600"
      borderRadius="md"
      color="gray.400"
      fontFamily="mono"
      fontWeight="600"
      userSelect="none"
      {...sizes[size]}
      {...props}
    >
      {children}
    </Box>
  );
}

export default function HomePageTab() {
  const router = useRouter();

  return (
    <Box minH="100vh" bg="gray.900" position="relative" overflow="hidden">
      <style>{`
        @keyframes cursorBlink { 50% { opacity: 0; } }
        @keyframes subtleFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
      `}</style>

      {/* Dot grid background */}
      <Box
        position="absolute"
        inset={0}
        opacity={0.03}
        pointerEvents="none"
        bgImage="radial-gradient(circle, #fff 1px, transparent 1px)"
        bgSize="24px 24px"
      />

      {/* Top ambient glow */}
      <Box
        position="absolute"
        top="-300px"
        left="50%"
        transform="translateX(-50%)"
        w="1000px"
        h="600px"
        bgGradient="radial(teal.800, transparent 70%)"
        opacity={0.15}
        pointerEvents="none"
        filter="blur(40px)"
      />

      <Container
        maxW="6xl"
        px={{ base: 5, md: 8 }}
        position="relative"
        zIndex={1}
      >
        {/* ============ HERO ============ */}
        <Flex
          minH={{ base: "auto", md: "90vh" }}
          pt={{ base: 20, md: 0 }}
          pb={{ base: 16, md: 0 }}
          align="center"
          justify="center"
          direction="column"
          gap={{ base: 12, md: 16 }}
        >
          {/* Tagline + headline */}
          <VStack spacing={{ base: 5, md: 6 }} textAlign="center" maxW="3xl">
            <HStack
              spacing={2}
              bg="whiteAlpha.50"
              border="1px solid"
              borderColor="whiteAlpha.100"
              borderRadius="full"
              px={4}
              py={1.5}
            >
              <Box w="6px" h="6px" borderRadius="full" bg="teal.400" />
              <Text fontSize="xs" color="gray.400" fontWeight="500" letterSpacing="wide">
                Free &middot; No signup needed &middot; Open source
              </Text>
            </HStack>

            <VStack spacing={0}>
              <Heading
                as="h1"
                fontSize={{ base: "4xl", md: "6xl", lg: "7xl" }}
                fontWeight="800"
                color="white"
                lineHeight="1.05"
                letterSpacing="-0.03em"
              >
                Type stories,
              </Heading>
              <Heading
                as="h1"
                fontSize={{ base: "4xl", md: "6xl", lg: "7xl" }}
                fontWeight="800"
                color="teal.400"
                lineHeight="1.05"
                letterSpacing="-0.03em"
              >
                not random words.
              </Heading>
            </VStack>

            <Text
              fontSize={{ base: "md", md: "lg" }}
              color="gray.400"
              maxW="480px"
              lineHeight="1.7"
            >
              A typing test where the text is actually worth reading.
              Pick a genre, set your timer, and see how fast you really are.
            </Text>

            <HStack spacing={3} pt={3}>
              <Button
                size="lg"
                bg="teal.500"
                color="white"
                px={8}
                h="52px"
                fontWeight="600"
                borderRadius="xl"
                rightIcon={<ArrowForwardIcon />}
                onClick={() => router.push("/type")}
                _hover={{
                  bg: "teal.400",
                  transform: "translateY(-1px)",
                  boxShadow: "0 8px 24px -4px rgba(49,151,149,0.4)",
                }}
                _active={{ transform: "translateY(0)" }}
                transition="all 0.2s"
              >
                Start typing
              </Button>
              <Button
                size="lg"
                variant="ghost"
                color="gray.400"
                px={6}
                h="52px"
                fontWeight="500"
                borderRadius="xl"
                onClick={() => router.push("/leaderboard")}
                _hover={{
                  color: "gray.200",
                  bg: "whiteAlpha.50",
                }}
                transition="all 0.2s"
              >
                Leaderboard
              </Button>
            </HStack>

            {/* Keyboard hint */}
            <HStack spacing={2} pt={2} opacity={0.5}>
              <Text fontSize="xs" color="gray.500">Press</Text>
              <Key size="sm">Enter</Key>
              <Text fontSize="xs" color="gray.500">to restart anytime</Text>
            </HStack>
          </VStack>

          {/* Typing demo */}
          <Box w="full">
            <TypingDemo />
            <HStack spacing={5} justify="center" pt={4}>
              <HStack spacing={1.5}>
                <Box w="7px" h="7px" borderRadius="full" bg="teal.300" />
                <Text fontSize="xs" color="gray.500">correct</Text>
              </HStack>
              <HStack spacing={1.5}>
                <Box w="7px" h="7px" borderRadius="full" bg="red.400" />
                <Text fontSize="xs" color="gray.500">error</Text>
              </HStack>
              <HStack spacing={1.5}>
                <Box w="7px" h="7px" borderRadius="full" bg="teal.600" />
                <Text fontSize="xs" color="gray.500">cursor</Text>
              </HStack>
            </HStack>
          </Box>
        </Flex>

        {/* ============ BENTO FEATURES ============ */}
        <Box py={{ base: 16, md: 24 }}>
          <VStack spacing={{ base: 3, md: 4 }} mb={{ base: 10, md: 14 }}>
            <Text
              fontSize="xs"
              color="teal.400"
              fontWeight="600"
              textTransform="uppercase"
              letterSpacing="0.15em"
            >
              Features
            </Text>
            <Heading
              size={{ base: "lg", md: "xl" }}
              color="white"
              fontWeight="700"
              letterSpacing="-0.02em"
              textAlign="center"
            >
              Everything happens in the browser
            </Heading>
          </VStack>

          <Grid
            templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }}
            templateRows={{ base: "auto", md: "repeat(2, auto)" }}
            gap={4}
          >
            {/* Large card - Story typing */}
            <GridItem colSpan={{ base: 1, md: 2 }} rowSpan={{ base: 1, md: 2 }}>
              <Box
                h="full"
                bg="gray.800"
                border="1px solid"
                borderColor="gray.750"
                borderRadius="2xl"
                p={{ base: 6, md: 8 }}
                position="relative"
                overflow="hidden"
                _hover={{ borderColor: "gray.600" }}
                transition="border-color 0.2s"
              >
                <VStack align="start" spacing={4} position="relative" zIndex={1}>
                  <Flex
                    w="44px"
                    h="44px"
                    align="center"
                    justify="center"
                    bg="teal.500"
                    bgGradient="linear(135deg, teal.400, teal.600)"
                    borderRadius="xl"
                  >
                    <Icon as={FaKeyboard} color="white" boxSize={5} />
                  </Flex>
                  <Box>
                    <Text fontWeight="700" color="white" fontSize={{ base: "lg", md: "xl" }}>
                      Story-based typing
                    </Text>
                    <Text color="gray.400" fontSize="md" mt={2} lineHeight="1.7" maxW="420px">
                      4 genres — Fantasy, Mystery, Sci-Fi, Romance. Every session generates
                      a new story fragment so you never type the same thing twice.
                    </Text>
                  </Box>
                </VStack>

                {/* Decorative: faded story text */}
                <Box
                  position="absolute"
                  bottom={0}
                  right={0}
                  w={{ base: "100%", md: "60%" }}
                  p={{ base: 4, md: 6 }}
                  opacity={0.06}
                  fontSize={{ base: "xs", md: "sm" }}
                  fontFamily="mono"
                  color="white"
                  lineHeight="2"
                  textAlign="right"
                  pointerEvents="none"
                >
                  A young wizard in an enchanted forest, seeking a lost artifact,
                  but a shadow was watching. The clever elf at the edge of a magical lake,
                  trying to break a curse, when suddenly the trees whispered a warning.
                  A brave knight on a misty mountain, discovering ancient magic...
                </Box>
              </Box>
            </GridItem>

            {/* Tournaments */}
            <GridItem>
              <Box
                h="full"
                bg="gray.800"
                border="1px solid"
                borderColor="gray.750"
                borderRadius="2xl"
                p={{ base: 6, md: 7 }}
                _hover={{ borderColor: "gray.600" }}
                transition="border-color 0.2s"
              >
                <VStack align="start" spacing={4}>
                  <Flex
                    w="44px"
                    h="44px"
                    align="center"
                    justify="center"
                    bg="orange.500"
                    bgGradient="linear(135deg, orange.400, orange.600)"
                    borderRadius="xl"
                  >
                    <Icon as={FaTrophy} color="white" boxSize={5} />
                  </Flex>
                  <Box>
                    <Text fontWeight="700" color="white" fontSize="lg">
                      Tournaments
                    </Text>
                    <Text color="gray.400" fontSize="sm" mt={1.5} lineHeight="1.7">
                      Compete with real players. Timed rounds, no-backspace mode, custom rules.
                    </Text>
                  </Box>
                </VStack>
              </Box>
            </GridItem>

            {/* Training */}
            <GridItem>
              <Box
                h="full"
                bg="gray.800"
                border="1px solid"
                borderColor="gray.750"
                borderRadius="2xl"
                p={{ base: 6, md: 7 }}
                _hover={{ borderColor: "gray.600" }}
                transition="border-color 0.2s"
              >
                <VStack align="start" spacing={4}>
                  <Flex
                    w="44px"
                    h="44px"
                    align="center"
                    justify="center"
                    bg="purple.500"
                    bgGradient="linear(135deg, purple.400, purple.600)"
                    borderRadius="xl"
                  >
                    <Icon as={FaGraduationCap} color="white" boxSize={5} />
                  </Flex>
                  <Box>
                    <Text fontWeight="700" color="white" fontSize="lg">
                      Structured training
                    </Text>
                    <Text color="gray.400" fontSize="sm" mt={1.5} lineHeight="1.7">
                      Beginner to advanced lessons with real progress tracking.
                    </Text>
                  </Box>
                </VStack>
              </Box>
            </GridItem>
          </Grid>

          {/* Secondary features row */}
          <SimpleGrid columns={{ base: 1, sm: 3 }} gap={4} mt={4}>
            {[
              {
                icon: FaChartBar,
                title: "Live stats",
                desc: "WPM, accuracy, and combo streaks — all in real time",
                accent: "blue",
              },
              {
                icon: FaBolt,
                title: "Instant feedback",
                desc: "Every keystroke lights up green or red as you type",
                accent: "yellow",
              },
              {
                icon: FaChartBar,
                title: "Progress history",
                desc: "Charts that show how you've improved over days and weeks",
                accent: "green",
              },
            ].map((f, i) => (
              <Box
                key={i}
                bg="gray.800"
                border="1px solid"
                borderColor="gray.750"
                borderRadius="2xl"
                p={6}
                _hover={{ borderColor: "gray.600" }}
                transition="border-color 0.2s"
              >
                <HStack spacing={3} align="start">
                  <Flex
                    w="36px"
                    h="36px"
                    align="center"
                    justify="center"
                    bg={`${f.accent}.500`}
                    bgGradient={`linear(135deg, ${f.accent}.400, ${f.accent}.600)`}
                    borderRadius="lg"
                    flexShrink={0}
                  >
                    <Icon as={f.icon} color="white" boxSize={4} />
                  </Flex>
                  <Box>
                    <Text fontWeight="600" color="white" fontSize="sm">
                      {f.title}
                    </Text>
                    <Text color="gray.500" fontSize="xs" mt={1} lineHeight="1.6">
                      {f.desc}
                    </Text>
                  </Box>
                </HStack>
              </Box>
            ))}
          </SimpleGrid>
        </Box>

        {/* ============ HOW IT WORKS ============ */}
        <Box py={{ base: 12, md: 20 }}>
          <VStack spacing={{ base: 3, md: 4 }} mb={{ base: 10, md: 14 }}>
            <Text
              fontSize="xs"
              color="teal.400"
              fontWeight="600"
              textTransform="uppercase"
              letterSpacing="0.15em"
            >
              How it works
            </Text>
            <Heading
              size={{ base: "lg", md: "xl" }}
              color="white"
              fontWeight="700"
              letterSpacing="-0.02em"
              textAlign="center"
            >
              Three steps. That's it.
            </Heading>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={{ base: 6, md: 8 }} maxW="4xl" mx="auto">
            {[
              {
                step: "01",
                title: "Pick a genre",
                desc: "Fantasy, Mystery, Sci-Fi, or Romance. Each generates unique story fragments.",
              },
              {
                step: "02",
                title: "Set your timer",
                desc: "15s for a quick burst, 30s standard, 60s if you want a real test. Or type a custom time.",
              },
              {
                step: "03",
                title: "Just start typing",
                desc: "The timer starts on your first keystroke. Your WPM, accuracy, and combo are tracked live.",
              },
            ].map((item, i) => (
              <VStack key={i} align="start" spacing={3}>
                <Text
                  fontFamily="mono"
                  fontSize="sm"
                  fontWeight="800"
                  color="teal.500"
                >
                  {item.step}
                </Text>
                <Text fontWeight="700" color="white" fontSize="lg">
                  {item.title}
                </Text>
                <Text color="gray.500" fontSize="sm" lineHeight="1.7">
                  {item.desc}
                </Text>
              </VStack>
            ))}
          </SimpleGrid>
        </Box>

        {/* ============ GENRE SELECTOR ============ */}
        <Box py={{ base: 12, md: 20 }}>
          <VStack spacing={{ base: 3, md: 4 }} mb={{ base: 10, md: 12 }}>
            <Text
              fontSize="xs"
              color="teal.400"
              fontWeight="600"
              textTransform="uppercase"
              letterSpacing="0.15em"
            >
              Genres
            </Text>
            <Heading
              size={{ base: "lg", md: "xl" }}
              color="white"
              fontWeight="700"
              letterSpacing="-0.02em"
              textAlign="center"
            >
              What kind of story?
            </Heading>
          </VStack>

          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} maxW="700px" mx="auto">
            {[
              { name: "Fantasy", sample: "A young wizard in an enchanted forest...", accent: "purple" },
              { name: "Mystery", sample: "A sharp detective at the old mansion...", accent: "blue" },
              { name: "Sci-Fi", sample: "A daring astronaut aboard a starship...", accent: "cyan" },
              { name: "Romance", sample: "A shy artist in a cozy cafe...", accent: "pink" },
            ].map((g) => (
              <Box
                key={g.name}
                as="button"
                bg="gray.800"
                border="1px solid"
                borderColor="gray.750"
                borderRadius="xl"
                p={{ base: 4, md: 5 }}
                textAlign="left"
                cursor="pointer"
                onClick={() => router.push(`/type?genre=${encodeURIComponent(g.name)}`)}
                _hover={{
                  borderColor: `${g.accent}.500`,
                  bg: "gray.750",
                }}
                transition="all 0.15s"
                w="full"
              >
                <Box
                  w="8px"
                  h="8px"
                  borderRadius="full"
                  bg={`${g.accent}.400`}
                  mb={3}
                />
                <Text fontWeight="700" color="white" fontSize="md">
                  {g.name}
                </Text>
                <Text
                  color="gray.600"
                  fontSize="xs"
                  mt={1.5}
                  lineHeight="1.5"
                  noOfLines={2}
                >
                  {g.sample}
                </Text>
                <HStack spacing={1} mt={3} color={`${g.accent}.400`}>
                  <Text fontSize="xs" fontWeight="600">
                    Try it
                  </Text>
                  <Icon as={FaArrowRight} boxSize={2.5} />
                </HStack>
              </Box>
            ))}
          </SimpleGrid>
        </Box>

        {/* ============ CTA ============ */}
        <Flex
          py={{ base: 16, md: 24 }}
          justify="center"
        >
          <Box
            maxW="lg"
            w="full"
            textAlign="center"
            position="relative"
          >
            {/* Glow behind card */}
            <Box
              position="absolute"
              top="50%"
              left="50%"
              transform="translate(-50%, -50%)"
              w="120%"
              h="120%"
              bgGradient="radial(teal.900, transparent 70%)"
              opacity={0.15}
              pointerEvents="none"
              filter="blur(30px)"
            />
            <Box
              position="relative"
              bg="gray.800"
              border="1px solid"
              borderColor="gray.700"
              borderRadius="2xl"
              px={{ base: 6, md: 10 }}
              py={{ base: 10, md: 14 }}
            >
              <VStack spacing={4}>
                <Heading
                  size={{ base: "md", md: "lg" }}
                  color="white"
                  fontWeight="700"
                  letterSpacing="-0.01em"
                >
                  Ready to type?
                </Heading>
                <Text color="gray.400" fontSize="sm" maxW="sm" lineHeight="1.7">
                  No account needed. Your first session is one click away.
                  Sign up later to save scores and join tournaments.
                </Text>
                <Button
                  bg="teal.500"
                  color="white"
                  size="lg"
                  px={8}
                  h="52px"
                  borderRadius="xl"
                  fontWeight="600"
                  rightIcon={<ArrowForwardIcon />}
                  onClick={() => router.push("/type")}
                  _hover={{
                    bg: "teal.400",
                    transform: "translateY(-1px)",
                    boxShadow: "0 8px 24px -4px rgba(49,151,149,0.4)",
                  }}
                  _active={{ transform: "translateY(0)" }}
                  transition="all 0.2s"
                  mt={2}
                >
                  Start typing
                </Button>
              </VStack>
            </Box>
          </Box>
        </Flex>

        {/* ============ FOOTER ============ */}
        <Flex
          py={8}
          borderTop="1px solid"
          borderColor="gray.800"
          justify="space-between"
          align="center"
          direction={{ base: "column", md: "row" }}
          gap={4}
        >
          <HStack spacing={2}>
            <Text fontWeight="700" color="teal.400" fontSize="md">
              story
            </Text>
            <Text fontWeight="700" color="gray.500" fontSize="md">
              type
            </Text>
          </HStack>

          <HStack spacing={1}>
            <IconButton
              as="a"
              href="https://facebook.com/johnmichael.escarlan"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              icon={<FaFacebook />}
              size="sm"
              variant="ghost"
              color="gray.600"
              _hover={{ color: "gray.300" }}
            />
            <IconButton
              as="a"
              href="mailto:johnmichael.escarlan14@gmail.com"
              aria-label="Email"
              icon={<FaEnvelope />}
              size="sm"
              variant="ghost"
              color="gray.600"
              _hover={{ color: "gray.300" }}
            />
            <IconButton
              as="a"
              href="tel:09946760366"
              aria-label="Phone"
              icon={<FaPhone />}
              size="sm"
              variant="ghost"
              color="gray.600"
              _hover={{ color: "gray.300" }}
            />
          </HStack>

          <Text color="gray.700" fontSize="xs">
            2025
          </Text>
        </Flex>
      </Container>
    </Box>
  );
}
