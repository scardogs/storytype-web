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
} from "@chakra-ui/react";
import {
  InfoOutlineIcon,
  StarIcon,
  MoonIcon,
  AtSignIcon,
  RepeatIcon,
} from "@chakra-ui/icons";
import { useRouter } from "next/router";
import { List, ListItem, ListIcon, Divider } from "@chakra-ui/react";
import { FaFacebook, FaEnvelope, FaPhone } from "react-icons/fa";

const genreThemes = [
  {
    color: "#2D3748",
    bg: "linear-gradient(135deg, #F7FAFC 60%, #E2E8F0 100%)",
    icon: MoonIcon,
  },
  {
    color: "#3182CE",
    bg: "linear-gradient(135deg, #EBF8FF 60%, #BEE3F8 100%)",
    icon: AtSignIcon,
  },
  {
    color: "#D69E2E",
    bg: "linear-gradient(135deg, #FFFAF0 60%, #FEEBC8 100%)",
    icon: RepeatIcon,
  },
];

const genres = [
  { name: "Mystery", tagline: "Unravel the unknown" },
  { name: "Fantasy", tagline: "Enter magical worlds" },
  { name: "Romance", tagline: "Feel every heartbeat" },
  { name: "Sci-Fi", tagline: "Explore the future" },
];

export default function HomePageTab() {
  const heroBg = useColorModeValue(
    "linear-gradient(120deg, #f8fafc 0%, #e2e8f0 100%)",
    "linear-gradient(120deg, #1a202c 0%, #2d3748 100%)"
  );
  const heroText = useColorModeValue("gray.800", "gray.100");
  const subText = useColorModeValue("gray.600", "gray.300");
  const cardShadow = useColorModeValue("lg", "dark-lg");
  const router = useRouter();

  return (
    <Box minH="100vh" bg={heroBg} px={{ base: 4, md: 8 }} py={10}>
      <VStack spacing={10} align="center" maxW="3xl" mx="auto">
        <Fade in>
          <Heading
            as="h1"
            size="2xl"
            textAlign="center"
            color={heroText}
            fontWeight="extrabold"
            letterSpacing="tight"
            mb={2}
          >
            StoryType
          </Heading>
        </Fade>
        <Text fontSize="xl" color={subText} textAlign="center" maxW="2xl">
          Welcome to <b>StoryType</b> — where typing practice meets creative
          adventure! Improve your typing speed and accuracy while exploring
          original, dynamic stories. Whether you&#39;re a writer, student, or
          just want to have fun while learning, StoryType is designed for you.
        </Text>
        <Box
          w="full"
          maxW="2xl"
          bg={useColorModeValue("whiteAlpha.700", "whiteAlpha.100")}
          borderRadius="lg"
          p={6}
          boxShadow="md"
        >
          <Text fontSize="lg" color={heroText} fontWeight="semibold" mb={2}>
            Why you&#39;ll love StoryType:
          </Text>
          <List spacing={2} color={subText} fontSize="md">
            <ListItem>
              <ListIcon as={StarIcon} color="teal.400" /> Practice typing with
              immersive, genre-themed stories
            </ListItem>
            <ListItem>
              <ListIcon as={InfoOutlineIcon} color="teal.400" /> Real-time
              feedback: WPM, accuracy, and error tracking
            </ListItem>

            <ListItem>
              <ListIcon as={RepeatIcon} color="teal.400" /> Unlock new stories
              and achievements as you progress (c)
            </ListItem>
            <ListItem>
              <ListIcon as={AtSignIcon} color="teal.400" /> Community features
              and interactive story paths (coming soon!)
            </ListItem>
          </List>
        </Box>
        <Divider
          my={4}
          borderColor={useColorModeValue("gray.200", "gray.700")}
        />
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6} w="full">
          {genres.map((genre, idx) => {
            const theme = genreThemes[idx % genreThemes.length];
            const GenreIcon = theme.icon;
            return (
              <Box
                key={genre.name}
                bg={theme.bg}
                color={theme.color}
                borderRadius="2xl"
                p={5}
                textAlign="center"
                boxShadow={cardShadow}
                fontWeight="semibold"
                _hover={{
                  boxShadow: "2xl",
                  transform: "translateY(-4px) scale(1.04)",
                  transition: "all 0.2s",
                }}
                transition="all 0.2s"
                cursor="pointer"
                minH="120px"
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
              >
                <Icon as={GenreIcon} boxSize={7} mb={2} />
                <Text fontSize="lg" fontWeight="bold">
                  {genre.name}
                </Text>
                <Text fontSize="sm" color={subText} mt={1}>
                  {genre.tagline}
                </Text>
              </Box>
            );
          })}
        </SimpleGrid>
        <Flex justify="center" w="full">
          <Button
            colorScheme="teal"
            size="lg"
            rightIcon={<StarIcon />}
            mt={4}
            px={8}
            py={6}
            fontSize="xl"
            borderRadius="full"
            boxShadow="md"
            _hover={{ boxShadow: "xl", transform: "scale(1.05)" }}
            onClick={() => router.push("/type")}
          >
            Start Typing Adventure
          </Button>
        </Flex>
      </VStack>
      {/* Bottom Center Description Bar */}
      {/* Socials & Contact Section */}
      <Box
        w="full"
        mt={12}
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
      >
        <HStack spacing={6} mb={2}>
          <IconButton
            as="a"
            href="https://facebook.com/johnmichael.escarlan"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            icon={<FaFacebook />}
            colorScheme="facebook"
            variant="ghost"
            fontSize="2xl"
            title="Facebook"
          />
          <IconButton
            as="a"
            href="mailto:johnmichael.escarlan14@gmail.com"
            aria-label="Gmail"
            icon={<FaEnvelope />}
            colorScheme="red"
            variant="ghost"
            fontSize="2xl"
            title="Gmail"
          />
          <IconButton
            as="a"
            href="tel:09946760366"
            aria-label="Phone"
            icon={<FaPhone />}
            colorScheme="teal"
            variant="ghost"
            fontSize="2xl"
            title="Phone"
          />
        </HStack>
        <Text color={subText} fontSize="sm" textAlign="center">
          FB: @johnmichael.escarlan &nbsp;|&nbsp; Gmail:
          johnmichael.escarlan14@gmail.com &nbsp;|&nbsp; 09946760366
        </Text>
      </Box>
    </Box>
  );
}
