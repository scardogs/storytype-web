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
  useToast,
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
import { useAuth } from "../context/AuthContext";

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
  const [totalErrors, setTotalErrors] = useState(0); // Permanent error count
  const [totalCharsTyped, setTotalCharsTyped] = useState(0); // Total characters typed (including corrections)
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
  const [scoreSaved, setScoreSaved] = useState(false);

  // Auth and toast for saving scores
  const { user, checkAuth } = useAuth();
  const toast = useToast();

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
    <HStack spacing={2} mb={4} flexWrap="wrap" justify="center">
      {TIMER_OPTIONS.map((t) => (
        <Button
          key={t}
          size={{ base: "xs", md: "sm" }}
          variant={testDuration === t ? "solid" : "outline"}
          colorScheme="teal"
          onClick={() => {
            setTestDuration(t);
            setTimerInput(t.toString());
          }}
          isDisabled={testStarted}
          minW={{ base: "50px", md: "60px" }}
        >
          {t}s
        </Button>
      ))}
      <NumberInput
        size={{ base: "xs", md: "sm" }}
        maxW={{ base: 16, md: 20 }}
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
    setTotalErrors(0); // Reset permanent errors
    setTotalCharsTyped(0); // Reset total chars typed
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

  // Calculate current errors for display (can go down if corrected)
  useEffect(() => {
    if (!testStarted) return;
    const userChars = userInput.split("");
    const storyString = allWords.join(" ");
    let errorCount = 0;
    for (let i = 0; i < userChars.length; i++) {
      if (userChars[i] !== storyString[i]) errorCount++;
    }
    setErrors(errorCount);
  }, [userInput, allWords, testStarted]);

  // Calculate accuracy and WPM based on TOTAL errors (permanent)
  useEffect(() => {
    if (!testStarted) return;

    // Accuracy based on total characters typed vs total errors made (permanent)
    setAccuracy(
      totalCharsTyped > 0
        ? Math.max(
            0,
            Math.round(
              ((totalCharsTyped - totalErrors) / totalCharsTyped) * 100
            )
          )
        : 100
    );

    // WPM: (total chars typed - total errors) / 5 / minutes
    const elapsedMinutes = (testDuration - timer) / 60;
    setWpm(
      elapsedMinutes > 0
        ? Math.round((totalCharsTyped - totalErrors) / 5 / elapsedMinutes)
        : 0
    );
  }, [totalCharsTyped, totalErrors, testStarted, testDuration, timer]);

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

  // Save score to database when test ends
  useEffect(() => {
    const saveScore = async () => {
      // Only save if test ended, user is logged in, and we haven't saved yet
      if (!testEnded || !user || scoreSaved || !testStarted) return;

      // Calculate total words typed
      const wordsTyped = userInput.trim().split(/\s+/).filter(Boolean).length;

      // Only save if user actually typed something
      if (wordsTyped === 0 || wpm === 0) return;

      try {
        const response = await fetch("/api/game/save-score", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            wpm,
            accuracy,
            wordsTyped,
            totalErrors,
            totalCharsTyped,
            testDuration,
            genre,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          setScoreSaved(true);

          // Update user stats in auth context
          await checkAuth();

          toast({
            title: "Score saved!",
            description: `${wordsTyped} words • ${wpm} WPM • ${accuracy}% accuracy`,
            status: "success",
            duration: 5000,
            isClosable: true,
            position: "top",
          });
        } else {
          throw new Error(data.message || "Failed to save score");
        }
      } catch (error) {
        console.error("Error saving score:", error);
        toast({
          title: "Could not save score",
          description: error.message || "Please try again later",
          status: "warning",
          duration: 4000,
          isClosable: true,
          position: "top",
        });
      }
    };

    saveScore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testEnded, user, wpm, accuracy, userInput, scoreSaved, testStarted]);

  // Enhanced input handler for combo logic and permanent error tracking
  const handleInputChange = (e) => {
    const value = e.target.value;
    const prev = userInput;
    const next = value;
    const storyString = allWords.join(" ");

    // Only check if user is adding a char (not deleting)
    if (next.length > prev.length) {
      const newChar = next[next.length - 1];
      const correctChar = storyString[next.length - 1];

      // Increment total characters typed (every keystroke counts)
      setTotalCharsTyped((count) => count + 1);

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
        // Increment permanent error count
        setTotalErrors((count) => count + 1);
        if (errorAudio) (errorAudio.currentTime = 0), errorAudio.play();
        setCombo(0);
      }
    } else if (next.length < prev.length) {
      // If deleting, don't change combo or error count
      // Errors remain permanent even if corrected
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
    setTotalErrors(0); // Reset permanent errors
    setTotalCharsTyped(0); // Reset total chars typed
    setTimer(testDuration);
    setTestStarted(false);
    setTestEnded(false);
    setCombo(0); // Reset combo on restart
    setScoreSaved(false); // Reset score saved flag
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
      px={{ base: 2, md: 4 }}
      py={{ base: 6, md: 10 }}
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
      <VStack
        spacing={{ base: 4, md: 8 }}
        maxW="4xl"
        mx="auto"
        align="center"
        zIndex={1}
      >
        {/* Genre Selector - visually distinct */}
        <HStack
          spacing={{ base: 2, md: 4 }}
          bg="gray.800"
          px={{ base: 2, md: 4 }}
          py={2}
          borderRadius="lg"
          boxShadow="md"
          flexWrap="wrap"
          justify="center"
        >
          <Text fontWeight="semibold" fontSize={{ base: "sm", md: "md" }}>
            Genre:
          </Text>
          <ButtonGroup
            size={{ base: "xs", md: "sm" }}
            variant="solid"
            isAttached
          >
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
          fontSize={{ base: "md", sm: "lg", md: "2xl" }}
          bg={useColorModeValue("gray.800", "gray.800")}
          px={{ base: 4, sm: 6, md: 8 }}
          py={{ base: 6, sm: 8, md: 10 }}
          borderRadius={{ base: "xl", md: "2xl" }}
          minW={{ base: "95vw", sm: "90vw", md: "700px", lg: "900px" }}
          maxW={{ base: "95vw", sm: "90vw", md: "1000px" }}
          minH={{ base: "100px", md: "120px" }}
          maxH={{ base: "150px", md: "200px" }}
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
          size={{ base: "md", md: "lg" }}
          variant="filled"
          bg={useColorModeValue("gray.700", "gray.700")}
          color="gray.100"
          autoFocus
          maxW={{ base: "95vw", sm: "90vw", md: "700px" }}
          disabled={testEnded || paused}
          borderRadius={{ base: "lg", md: "xl" }}
          boxShadow="md"
          fontSize={{ base: "sm", md: "md" }}
        />
        {/* Real-Time Progress Graph */}
        {progressHistory.length > 1 && (
          <Box
            w="full"
            maxW={{ base: "95vw", sm: "90vw", md: "700px" }}
            bg="gray.800"
            borderRadius="lg"
            boxShadow="md"
            px={{ base: 3, md: 6 }}
            py={{ base: 3, md: 4 }}
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
                maintainAspectRatio: true,
                plugins: {
                  legend: {
                    display: true,
                    position: "top",
                    labels: {
                      boxWidth: isMobile ? 20 : 40,
                      font: {
                        size: isMobile ? 10 : 12,
                      },
                    },
                  },
                  title: {
                    display: !isMobile,
                    text: "Progress Over Time",
                    font: {
                      size: isMobile ? 12 : 14,
                    },
                  },
                },
                scales: {
                  x: {
                    ticks: {
                      font: {
                        size: isMobile ? 8 : 11,
                      },
                    },
                  },
                  y: {
                    type: "linear",
                    display: true,
                    position: "left",
                    min: 0,
                    ticks: {
                      font: {
                        size: isMobile ? 8 : 11,
                      },
                    },
                  },
                  y1: {
                    type: "linear",
                    display: true,
                    position: "right",
                    min: 0,
                    max: 100,
                    grid: { drawOnChartArea: false },
                    ticks: {
                      font: {
                        size: isMobile ? 8 : 11,
                      },
                    },
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
          px={{ base: 3, md: 6 }}
          py={{ base: 3, md: 4 }}
          w="full"
          maxW={{ base: "95vw", sm: "90vw", md: "700px" }}
          justifyContent="center"
          spacing={{ base: 2, md: 8 }}
          flexWrap={{ base: "wrap", md: "nowrap" }}
        >
          <Stat textAlign="center" minW={{ base: "45%", md: "auto" }}>
            <StatLabel color="gray.400" fontSize={{ base: "xs", md: "sm" }}>
              <Icon
                as={CheckCircleIcon}
                color="teal.400"
                mr={1}
                boxSize={{ base: 3, md: 4 }}
              />
              WPM
            </StatLabel>
            <StatNumber color="teal.200" fontSize={{ base: "xl", md: "2xl" }}>
              {wpm}
            </StatNumber>
          </Stat>
          <Stat textAlign="center" minW={{ base: "45%", md: "auto" }}>
            <Tooltip
              label="Based on total keystrokes including corrections"
              hasArrow
              placement="top"
              isDisabled={isMobile}
            >
              <StatLabel color="gray.400" fontSize={{ base: "xs", md: "sm" }}>
                <Icon
                  as={CheckCircleIcon}
                  color="green.400"
                  mr={1}
                  boxSize={{ base: 3, md: 4 }}
                />
                Accuracy
              </StatLabel>
            </Tooltip>
            <StatNumber
              color={
                accuracy >= 95
                  ? "green.300"
                  : accuracy >= 80
                  ? "yellow.300"
                  : "red.300"
              }
              fontSize={{ base: "xl", md: "2xl" }}
            >
              {accuracy}%
            </StatNumber>
          </Stat>
          <Stat textAlign="center" minW={{ base: "45%", md: "auto" }}>
            <Tooltip
              label={`Current: ${errors} | Total mistakes: ${totalErrors}`}
              hasArrow
              placement="top"
              isDisabled={isMobile}
            >
              <StatLabel color="gray.400" fontSize={{ base: "xs", md: "sm" }}>
                <Icon
                  as={WarningIcon}
                  color="red.400"
                  mr={1}
                  boxSize={{ base: 3, md: 4 }}
                />
                Errors
              </StatLabel>
            </Tooltip>
            <StatNumber color="red.200" fontSize={{ base: "xl", md: "2xl" }}>
              {errors}
              {totalErrors > errors && (
                <Text
                  as="span"
                  fontSize={{ base: "xs", md: "sm" }}
                  color="red.400"
                  ml={1}
                >
                  ({totalErrors})
                </Text>
              )}
            </StatNumber>
          </Stat>
          <Stat textAlign="center" minW={{ base: "45%", md: "auto" }}>
            <StatLabel color="gray.400" fontSize={{ base: "xs", md: "sm" }}>
              <Icon
                as={TimeIcon}
                color="teal.400"
                mr={1}
                boxSize={{ base: 3, md: 4 }}
              />
              Time
            </StatLabel>
            <StatNumber color="teal.100" fontSize={{ base: "xl", md: "2xl" }}>
              {timer}s
            </StatNumber>
          </Stat>
        </StatGroup>
      </VStack>
      {/* Floating Restart and Pause/Resume Buttons - bottom center on mobile, bottom right on desktop */}
      <Box
        position="fixed"
        bottom={isMobile ? 24 : 12}
        right={isMobile ? undefined : 16}
        left={isMobile ? "50%" : undefined}
        transform={isMobile ? "translateX(-50%)" : undefined}
        zIndex={30}
      >
        <VStack spacing={2} align="center">
          <Tooltip
            label="Restart story (Enter)"
            hasArrow
            placement="left"
            isDisabled={isMobile}
          >
            <Button
              colorScheme="teal"
              borderRadius="full"
              size={{ base: "sm", md: "md", lg: "lg" }}
              boxShadow="2xl"
              onClick={handleRestart}
              leftIcon={<RepeatIcon />}
              px={{ base: 3, md: 4, lg: 6 }}
              w={{ base: "90px", md: "110px", lg: "140px" }}
              fontSize={{ base: "xs", md: "sm", lg: "md" }}
            >
              Restart
            </Button>
          </Tooltip>
          <Divider borderColor="teal.200" my={1} w="80%" alignSelf="center" />
          <Button
            colorScheme={paused ? "yellow" : "teal"}
            borderRadius="full"
            size={{ base: "sm", md: "md", lg: "lg" }}
            boxShadow="2xl"
            onClick={() => setPaused((p) => !p)}
            leftIcon={paused ? <MdPlayArrow /> : <MdPause />}
            px={{ base: 3, md: 4, lg: 6 }}
            w={{ base: "90px", md: "110px", lg: "140px" }}
            fontSize={{ base: "xs", md: "sm", lg: "md" }}
          >
            {paused ? "Resume" : "Pause"}
          </Button>
        </VStack>
      </Box>
      {/* Bottom Center Description Bar - hide on very small screens */}
      <Box
        position="fixed"
        bottom={6}
        left="50%"
        transform="translateX(-50%)"
        bg={useColorModeValue("gray.800", "gray.700")}
        color={useColorModeValue("gray.200", "gray.300")}
        px={{ base: 3, md: 6 }}
        py={{ base: 1.5, md: 2 }}
        borderRadius="md"
        boxShadow="md"
        fontSize={{ base: "xs", md: "sm" }}
        display={{ base: "none", sm: "flex" }}
        alignItems="center"
        gap={{ base: 2, md: 4 }}
        zIndex={20}
      >
        <Box as="span" color="gray.400" fontWeight="medium">
          <Box
            as="kbd"
            bg="gray.900"
            color="gray.100"
            px={{ base: 1.5, md: 2 }}
            py={1}
            borderRadius="sm"
            mx={1}
            fontSize={{ base: "2xs", md: "xs" }}
          >
            enter
          </Box>
          <Text as="span" display={{ base: "none", md: "inline" }}>
            - restart story
          </Text>
        </Box>
      </Box>
    </Box>
  );
}
