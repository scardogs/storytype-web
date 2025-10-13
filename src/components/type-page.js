import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Box,
  Text,
  VStack,
  HStack,
  useColorModeValue,
  Input,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  Button,
  Spinner,
  ButtonGroup,
  Flex,
  Select,
  NumberInput,
  NumberInputField,
  Progress,
  Tooltip,
  Icon,
  useBreakpointValue,
  ScaleFade,
  IconButton,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Divider,
} from "@chakra-ui/react";
import {
  RepeatIcon,
  TimeIcon,
  CheckCircleIcon,
  WarningIcon,
} from "@chakra-ui/icons";
import { MdVolumeUp, MdVolumeOff, MdPause, MdPlayArrow } from "react-icons/md";
import { generateRandomStory } from "../utils/randomStory";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend
);

function cleanStoryText(text) {
  // Remove XML/HTML-like tags
  return text.replace(/<[^>]+>/g, "");
}

const TIMER_OPTIONS = [15, 30, 60];

export default function TypingPage() {
  const [allWords, setAllWords] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [errors, setErrors] = useState(0);
  const [timer, setTimer] = useState(0);
  const [intervalId, setIntervalId] = useState(null);
  // Use a string state for timer input
  const [timerInput, setTimerInput] = useState("30");
  const [testDuration, setTestDuration] = useState(30);
  const [testStarted, setTestStarted] = useState(false);
  const [testEnded, setTestEnded] = useState(false);
  const [genre, setGenre] = useState("Fantasy");
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const inputRef = useRef();
  const storyBoxRef = useRef();
  const isMobile = useBreakpointValue({ base: true, md: false });
  const [progressHistory, setProgressHistory] = useState([]); // {time, wpm, accuracy}
  const correctAudio =
    typeof window !== "undefined" ? new Audio("/correct.wav") : null;
  const errorAudio =
    typeof window !== "undefined" ? new Audio("/error.wav") : null;
  const comboAudio =
    typeof window !== "undefined" ? new Audio("/combo.wav") : null;
  const [paused, setPaused] = useState(false);

  // Background music controls
  const bgmRef = useRef(null);
  const [bgmMuted, setBgmMuted] = useState(false);
  const [bgmVolume, setBgmVolume] = useState(0.5);
  const [musicStarted, setMusicStarted] = useState(false);
  const [showMusicPrompt, setShowMusicPrompt] = useState(false);

  useEffect(() => {
    if (!bgmRef.current) {
      bgmRef.current = new window.Audio("/song1.mp3");
      bgmRef.current.loop = true;
      bgmRef.current.volume = bgmVolume;
      bgmRef.current.muted = bgmMuted;
      // Try to play on load
      bgmRef.current
        .play()
        .then(() => {
          setMusicStarted(true);
        })
        .catch(() => {
          setShowMusicPrompt(true);
        });
    }
    return () => {
      if (bgmRef.current) {
        bgmRef.current.pause();
        bgmRef.current = null;
      }
    };
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (bgmRef.current) {
      bgmRef.current.muted = bgmMuted;
    }
  }, [bgmMuted]);

  useEffect(() => {
    if (bgmRef.current) {
      bgmRef.current.volume = bgmVolume;
    }
  }, [bgmVolume]);

  // Generate a new random story when genre changes or on restart
  const generateStory = (selectedGenre = genre) => {
    const story = generateRandomStory(selectedGenre);
    const words = story.split(/\s+/).filter(Boolean);
    setGenre(selectedGenre);
    setStoryWords(words);
    setChunkIndex(0);
    setCurrentChunk(words.slice(0, 20));
    setUserInput("");
    // ... reset stats ...
  };

  // Update timerInput and only set testDuration on blur or Enter
  const handleTimerInputChange = (valueString) => {
    if (/^\d*$/.test(valueString)) {
      setTimerInput(valueString);
    }
  };
  const handleTimerInputBlur = () => {
    const num = parseInt(timerInput, 10);
    if (!isNaN(num) && num >= 5 && num <= 300) {
      setTestDuration(num);
    } else {
      setTimerInput(testDuration.toString());
    }
  };

  // Timer selection UI
  const TimerSelector = () => (
    <HStack spacing={2} mb={4}>
      {TIMER_OPTIONS.map((t) => (
        <Button
          key={t}
          size="sm"
          variant={testDuration === t ? "solid" : "outline"}
          colorScheme="teal"
          onClick={() => {
            setTestDuration(t);
            setTimerInput(t.toString());
          }}
          isDisabled={testStarted}
        >
          {t}s
        </Button>
      ))}
      <NumberInput
        size="sm"
        maxW={20}
        min={5}
        max={300}
        value={timerInput}
        onChange={handleTimerInputChange}
        onBlur={handleTimerInputBlur}
        isDisabled={testStarted}
        keepWithinRange={false}
        clampValueOnBlur={false}
      >
        <NumberInputField />
      </NumberInput>
    </HStack>
  );

  // Generate a new random story chunk (20 words)
  const generateChunk = (selectedGenre = genre) => {
    const story = generateRandomStory(selectedGenre);
    return story.split(/\s+/).filter(Boolean);
  };

  // On mount or genre/timer change, reset everything
  useEffect(() => {
    let words = [];
    while (words.length < 20) {
      words = [...words, ...generateChunk(genre)];
    }
    setAllWords(words);
    setUserInput("");
    setWpm(0);
    setAccuracy(100);
    setErrors(0);
    setTimer(testDuration);
    setTestStarted(false);
    setTestEnded(false);
    setCombo(0); // Reset combo on restart
    if (intervalId) clearInterval(intervalId);
    setIntervalId(null);
  }, [genre, testDuration]);

  // When testDuration changes, update timer
  useEffect(() => {
    setTimer(testDuration);
  }, [testDuration]);

  // Start test on first keypress
  useEffect(() => {
    if (!testStarted && userInput.length === 1) {
      setTestStarted(true);
      const id = setInterval(() => {
        setTimer((t) => {
          if (paused) return t; // Don't decrement timer if paused
          if (t <= 1) {
            clearInterval(id);
            setTestEnded(true);
            setCombo(0); // Reset combo when timer runs out
            return 0;
          }
          return t - 1;
        });
      }, 1000);
      setIntervalId(id);
    }
  }, [userInput, testStarted, paused]);

  // Always keep at least 50 words ahead
  useEffect(() => {
    const userWords = userInput.trim().split(/\s+/);
    if (allWords.length - userWords.length < 50) {
      setAllWords((prev) => [...prev, ...generateChunk(genre)]);
    }
  }, [userInput, allWords, genre]);

  // Calculate errors and accuracy based only on completed words
  useEffect(() => {
    if (!testStarted) return;
    const userChars = userInput.split("");
    const storyString = allWords.join(" ");
    let errorCount = 0;
    for (let i = 0; i < userChars.length; i++) {
      if (userChars[i] !== storyString[i]) errorCount++;
    }
    setErrors(errorCount);
    // For accuracy and WPM, count only correct chars
    setAccuracy(
      userChars.length > 0
        ? Math.max(
            0,
            Math.round(
              ((userChars.length - errorCount) / userChars.length) * 100
            )
          )
        : 100
    );
    // WPM: (correct chars / 5) / minutes
    setWpm(
      testDuration > 0
        ? Math.round(
            (userChars.length - errorCount) / 5 / ((testDuration - timer) / 60)
          )
        : 0
    );
  }, [userInput, allWords, testStarted, testDuration, timer]);

  // Highlighting logic: always show 20 words starting from the first untyped character
  const getHighlightedStory = useMemo(() => {
    const userChars = userInput.split("");
    const storyString = allWords.join(" ");
    // Find the index of the first untyped character
    const startIdx = userChars.length;
    // Find the word index for the first untyped character
    let charCount = 0;
    let wordStartIdx = 0;
    for (let i = 0; i < allWords.length; i++) {
      charCount += allWords[i].length + 1; // +1 for space
      if (charCount > startIdx) {
        wordStartIdx = i;
        break;
      }
    }
    // Show a window of 20 words starting from wordStartIdx
    const displayWords = allWords.slice(wordStartIdx, wordStartIdx + 20);
    const displayString = displayWords.join(" ");
    // Calculate the offset for per-letter highlighting
    let displayStartIdx = 0;
    for (let i = 0; i < wordStartIdx; i++)
      displayStartIdx += allWords[i].length + 1;
    return displayString.split("").map((char, idx) => {
      const globalIdx = displayStartIdx + idx;
      let color = "gray.500";
      if (userChars[globalIdx] !== undefined) {
        if (userChars[globalIdx] === char) {
          color = "green.400";
        } else {
          color = "red.400";
        }
      } else if (userChars.length === globalIdx && !testEnded) {
        color = "blue.400";
      }
      return (
        <Text
          as="span"
          key={globalIdx}
          color={color}
          fontWeight="bold"
          display="inline"
        >
          {char}
        </Text>
      );
    });
  }, [userInput, allWords, testEnded]);

  // Scroll story box to keep current word visible
  useEffect(() => {
    if (!storyBoxRef.current || isMobile) return;
    const userWords = userInput.split(/\s+/);
    const currentWordIdx = userWords.length - 1;
    const wordSpans = storyBoxRef.current.querySelectorAll("span");
    if (wordSpans[currentWordIdx]) {
      window.requestAnimationFrame(() => {
        wordSpans[currentWordIdx].scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "center",
        });
      });
    }
  }, [userInput, isMobile]);

  // Track WPM/accuracy every 2 seconds during test
  useEffect(() => {
    if (!testStarted || testEnded) return;
    const interval = setInterval(() => {
      setProgressHistory((prev) => [
        ...prev,
        {
          time: testDuration - timer,
          wpm,
          accuracy,
        },
      ]);
    }, 5000); // Throttle to every 5 seconds
    return () => clearInterval(interval);
  }, [testStarted, testEnded, timer, wpm, accuracy, testDuration]);

  // Reset progress history on restart
  useEffect(() => {
    setProgressHistory([]);
  }, [testStarted, testEnded, testDuration, genre]);

  // Enhanced input handler for combo logic
  const handleInputChange = (e) => {
    const value = e.target.value;
    const prev = userInput;
    const next = value;
    const storyString = allWords.join(" ");
    // Only check if user is adding a char (not deleting)
    if (next.length > prev.length) {
      const newChar = next[next.length - 1];
      const correctChar = storyString[next.length - 1];
      // Play correct sound only when a word is finished correctly
      if (newChar === " ") {
        // Get the last word typed (before the space)
        const userWords = next.trim().split(/\s+/);
        const storyWords = storyString.split(/\s+/);
        const lastIdx = userWords.length - 1;
        if (userWords[lastIdx] === storyWords[lastIdx] && correctAudio) {
          correctAudio.currentTime = 0;
          correctAudio.play();
        }
      }
      if (newChar === correctChar) {
        setCombo((c) => {
          const newCombo = c + 1;
          setMaxCombo((m) => (newCombo > m ? newCombo : m));
          if (newCombo === 5 && comboAudio)
            (comboAudio.currentTime = 0), comboAudio.play();
          return newCombo;
        });
      } else {
        if (errorAudio) (errorAudio.currentTime = 0), errorAudio.play();
        setCombo(0);
      }
    } else if (next.length < prev.length) {
      // If deleting, don't change combo
    } else {
      // If replacing, reset combo
      setCombo(0);
    }
    setUserInput(value);
  };

  // Restart handler
  const handleRestart = () => {
    let words = [];
    while (words.length < 20) {
      words = [...words, ...generateChunk(genre)];
    }
    setAllWords(words);
    setUserInput("");
    setWpm(0);
    setAccuracy(100);
    setErrors(0);
    setTimer(testDuration);
    setTestStarted(false);
    setTestEnded(false);
    setCombo(0); // Reset combo on restart
    if (intervalId) clearInterval(intervalId);
    setIntervalId(null);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Calculate progress percentage
  const storyString = allWords.join(" ");
  const progress =
    storyString.length > 0 ? (userInput.length / storyString.length) * 100 : 0;

  const handleStartMusic = () => {
    if (bgmRef.current) {
      bgmRef.current.play();
      setMusicStarted(true);
      setShowMusicPrompt(false);
    }
  };

  return (
    <Box
      minH="100vh"
      bgGradient="linear(to-br, gray.900 80%, teal.900 100%)"
      color="gray.100"
      px={4}
      py={10}
      position="relative"
      overflow="hidden"
    >
      {/* Pause Overlay */}
      {paused && (
        <Box
          position="fixed"
          top={0}
          left={0}
          w="100vw"
          h="100vh"
          bg="rgba(0,0,0,0.5)"
          zIndex={50}
          display="flex"
          alignItems="center"
          justifyContent="center"
          pointerEvents="none"
        >
          <Text fontSize="3xl" color="white" fontWeight="bold">
            Paused
          </Text>
        </Box>
      )}
      {/* Music Autoplay Prompt Overlay */}
      {showMusicPrompt && (
        <Box
          position="fixed"
          top={0}
          left={0}
          w="100vw"
          h="100vh"
          bg="rgba(0,0,0,0.7)"
          zIndex={200}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Button colorScheme="teal" size="lg" onClick={handleStartMusic}>
            Play
          </Button>
        </Box>
      )}
      {/* Background Music Controls - vertical bottom right on mobile, horizontal bottom center on desktop */}
      <Box
        position="fixed"
        zIndex={100}
        bottom={isMobile ? 20 : 32}
        right={isMobile ? 6 : undefined}
        left={isMobile ? undefined : "50%"}
        transform={isMobile ? undefined : "translateX(-50%)"}
        bg="gray.800"
        px={4}
        py={2}
        borderRadius="lg"
        boxShadow={{ base: "none", md: "md" }}
        display="flex"
        alignItems="center"
        gap={2}
        flexDirection={isMobile ? "column" : "row"}
        w={isMobile ? "auto" : undefined}
        h={isMobile ? "auto" : undefined}
      >
        <IconButton
          aria-label={bgmMuted ? "Unmute" : "Mute"}
          icon={bgmMuted ? <MdVolumeOff /> : <MdVolumeUp />}
          onClick={() => setBgmMuted((m) => !m)}
          size="md"
          colorScheme="teal"
          variant="ghost"
        />
        {/* Only show the volume slider on desktop */}
        {!isMobile && (
          <Slider
            aria-label="Volume"
            value={Math.round(bgmVolume * 100)}
            min={0}
            max={100}
            onChange={(val) => setBgmVolume(val / 100)}
            orientation="horizontal"
            w="100px"
          >
            <SliderTrack>
              <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb />
          </Slider>
        )}
      </Box>
      {/* Subtle animated background accent */}
      <Box
        position="absolute"
        top="-100px"
        left="-100px"
        w="400px"
        h="400px"
        bgGradient="radial(teal.700 40%, transparent 80%)"
        opacity={0.15}
        zIndex={0}
        filter={{ base: "none", md: "blur(8px)" }}
        pointerEvents="none"
        animation={{ base: undefined, md: "pulse 6s infinite alternate" }}
      />
      <style>{`@keyframes pulse { 0% { opacity: 0.12; } 100% { opacity: 0.22; } }`}</style>
      <Progress
        value={progress}
        size="sm"
        colorScheme="teal"
        borderRadius="md"
        mb={6}
        maxW="4xl"
        mx="auto"
        transition="all 0.5s cubic-bezier(.4,2,.6,1)"
      />
      {/* Combo Indicator */}
      <ScaleFade initialScale={0.8} in={combo >= 5} unmountOnExit>
        <Box
          position="absolute"
          top={{ base: 24, md: 32 }}
          left="50%"
          transform="translateX(-50%)"
          zIndex={50}
          px={8}
          py={3}
          bgGradient="linear(to-r, teal.400, teal.600)"
          color="white"
          fontWeight="extrabold"
          fontSize={{ base: "2xl", md: "3xl" }}
          borderRadius="full"
          boxShadow="2xl"
          textAlign="center"
          letterSpacing="wide"
          pointerEvents="none"
          opacity={0.95}
        >
          Combo x{combo}!
        </Box>
      </ScaleFade>
      <VStack spacing={8} maxW="4xl" mx="auto" align="center" zIndex={1}>
        {/* Genre Selector - visually distinct */}
        <HStack
          spacing={4}
          bg="gray.800"
          px={4}
          py={2}
          borderRadius="lg"
          boxShadow="md"
        >
          <Text fontWeight="semibold">Genre:</Text>
          <ButtonGroup size="sm" variant="solid" isAttached>
            <Button
              onClick={() => setGenre("Fantasy")}
              isDisabled={testStarted}
              colorScheme={genre === "Fantasy" ? "teal" : "gray"}
              variant={genre === "Fantasy" ? "solid" : "ghost"}
            >
              Fantasy
            </Button>
            <Button
              onClick={() => setGenre("Mystery")}
              isDisabled={testStarted}
              colorScheme={genre === "Mystery" ? "teal" : "gray"}
              variant={genre === "Mystery" ? "solid" : "ghost"}
            >
              Mystery
            </Button>
            <Button
              onClick={() => setGenre("Sci-Fi")}
              isDisabled={testStarted}
              colorScheme={genre === "Sci-Fi" ? "teal" : "gray"}
              variant={genre === "Sci-Fi" ? "solid" : "ghost"}
            >
              Sci-Fi
            </Button>
            <Button
              onClick={() => setGenre("Romance")}
              isDisabled={testStarted}
              colorScheme={genre === "Romance" ? "teal" : "gray"}
              variant={genre === "Romance" ? "solid" : "ghost"}
            >
              Romance
            </Button>
          </ButtonGroup>
        </HStack>
        <TimerSelector />
        {/* Main Typing Card */}
        <Box
          ref={storyBoxRef}
          fontFamily="mono"
          fontSize={{ base: "lg", md: "2xl" }}
          bg={useColorModeValue("gray.800", "gray.800")}
          px={8}
          py={10}
          borderRadius="2xl"
          minW={{ base: "90vw", md: "900px" }}
          maxW="1000px"
          minH="120px"
          maxH="200px"
          boxShadow="2xl"
          textAlign="left"
          display="flex"
          alignItems="center"
          justifyContent="flex-start"
          flexWrap="wrap"
          overflow="auto"
          whiteSpace="pre-wrap"
          wordBreak="break-word"
          border="2px solid"
          borderColor="teal.700"
          zIndex={1}
        >
          {getHighlightedStory}
        </Box>
        <Input
          ref={inputRef}
          value={userInput}
          onChange={handleInputChange}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleRestart();
            }
          }}
          placeholder={
            testEnded
              ? "Test ended. Restart to try again."
              : paused
              ? "Paused"
              : "Start typing the story above..."
          }
          size="lg"
          variant="filled"
          bg={useColorModeValue("gray.700", "gray.700")}
          color="gray.100"
          autoFocus
          maxW="700px"
          disabled={testEnded || paused}
          borderRadius="xl"
          boxShadow="md"
        />
        {/* Real-Time Progress Graph */}
        {progressHistory.length > 1 && (
          <Box
            w="full"
            maxW="700px"
            bg="gray.800"
            borderRadius="lg"
            boxShadow="md"
            px={6}
            py={4}
          >
            <Line
              data={{
                labels: progressHistory.map((p) => `${p.time}s`),
                datasets: [
                  {
                    label: "WPM",
                    data: progressHistory.map((p) => p.wpm),
                    borderColor: "#38B2AC",
                    backgroundColor: "rgba(56,178,172,0.2)",
                    yAxisID: "y",
                  },
                  {
                    label: "Accuracy %",
                    data: progressHistory.map((p) => p.accuracy),
                    borderColor: "#68D391",
                    backgroundColor: "rgba(104,211,145,0.2)",
                    yAxisID: "y1",
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: { display: true, position: "top" },
                  title: { display: true, text: "Progress Over Time" },
                },
                scales: {
                  y: {
                    type: "linear",
                    display: true,
                    position: "left",
                    min: 0,
                  },
                  y1: {
                    type: "linear",
                    display: true,
                    position: "right",
                    min: 0,
                    max: 100,
                    grid: { drawOnChartArea: false },
                  },
                },
              }}
            />
          </Box>
        )}
        {/* Enhanced Stats Panel */}
        <StatGroup
          bg="gray.800"
          borderRadius="lg"
          boxShadow="md"
          px={6}
          py={4}
          w="full"
          maxW="700px"
          justifyContent="center"
          spacing={isMobile ? 2 : 8}
        >
          <Stat textAlign="center">
            <StatLabel color="gray.400">
              <Icon as={CheckCircleIcon} color="teal.400" mr={1} />
              WPM
            </StatLabel>
            <StatNumber color="teal.200" fontSize="2xl">
              {wpm}
            </StatNumber>
          </Stat>
          <Stat textAlign="center">
            <StatLabel color="gray.400">
              <Icon as={CheckCircleIcon} color="green.400" mr={1} />
              Accuracy
            </StatLabel>
            <StatNumber
              color={
                accuracy >= 95
                  ? "green.300"
                  : accuracy >= 80
                  ? "yellow.300"
                  : "red.300"
              }
              fontSize="2xl"
            >
              {accuracy}%
            </StatNumber>
          </Stat>
          <Stat textAlign="center">
            <StatLabel color="gray.400">
              <Icon as={WarningIcon} color="red.400" mr={1} />
              Errors
            </StatLabel>
            <StatNumber color="red.200" fontSize="2xl">
              {errors}
            </StatNumber>
          </Stat>
          <Stat textAlign="center">
            <StatLabel color="gray.400">
              <Icon as={TimeIcon} color="teal.400" mr={1} />
              Time
            </StatLabel>
            <StatNumber color="teal.100" fontSize="2xl">
              {timer}s
            </StatNumber>
          </Stat>
        </StatGroup>
      </VStack>
      {/* Floating Restart and Pause/Resume Buttons - bottom center on mobile, bottom right on desktop */}
      <Box
        position="fixed"
        bottom={isMobile ? 20 : 12}
        right={isMobile ? undefined : 16}
        left={isMobile ? "50%" : undefined}
        transform={isMobile ? "translateX(-50%)" : undefined}
        zIndex={30}
      >
        <VStack spacing={2} align="center">
          <Tooltip label="Restart story (Enter)" hasArrow placement="left">
            <Button
              colorScheme="teal"
              borderRadius="full"
              size={isMobile ? "md" : "lg"}
              boxShadow="2xl"
              onClick={handleRestart}
              leftIcon={<RepeatIcon />}
              px={isMobile ? 4 : 6}
              w={isMobile ? "100px" : "140px"}
            >
              Restart
            </Button>
          </Tooltip>
          <Divider borderColor="teal.200" my={1} w="80%" alignSelf="center" />
          <Button
            colorScheme={paused ? "yellow" : "teal"}
            borderRadius="full"
            size={isMobile ? "md" : "lg"}
            boxShadow="2xl"
            onClick={() => setPaused((p) => !p)}
            leftIcon={paused ? <MdPlayArrow /> : <MdPause />}
            px={isMobile ? 4 : 6}
            w={isMobile ? "100px" : "140px"}
          >
            {paused ? "Resume" : "Pause"}
          </Button>
        </VStack>
      </Box>
      {/* Bottom Center Description Bar */}
      <Box
        position="fixed"
        bottom={6}
        left="50%"
        transform="translateX(-50%)"
        bg={useColorModeValue("gray.800", "gray.700")}
        color={useColorModeValue("gray.200", "gray.300")}
        px={6}
        py={2}
        borderRadius="md"
        boxShadow="md"
        fontSize="sm"
        display="flex"
        alignItems="center"
        gap={4}
        zIndex={20}
      >
        <Box as="span" color="gray.400" fontWeight="medium">
          <Box
            as="kbd"
            bg="gray.900"
            color="gray.100"
            px={2}
            py={1}
            borderRadius="sm"
            mx={1}
            fontSize="xs"
          >
            enter
          </Box>
          - restart story
        </Box>
      </Box>
    </Box>
  );
}
