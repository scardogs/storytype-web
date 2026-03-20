import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Divider,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  Heading,
  HStack,
  IconButton,
  Spinner,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  Textarea,
  VStack,
  useBreakpointValue,
  useDisclosure,
} from "@chakra-ui/react";
import { ChevronRightIcon, CloseIcon } from "@chakra-ui/icons";
import { FaCircle, FaComments, FaPaperPlane, FaRegSmile } from "react-icons/fa";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";
import ChatEmojiPicker from "./chat-emoji-picker";
import ChatUserPreview from "./chat-user-preview";

const MESSAGE_COOLDOWN_SECONDS = 3;

function formatMessageTime(dateString) {
  return new Date(dateString).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function MessageBubble({
  message,
  ownMessage,
  senderOnline,
  currentUserId,
  onOpenUser,
}) {
  const canOpenPreview = !ownMessage;

  return (
    <Flex justify={ownMessage ? "flex-end" : "flex-start"}>
      <HStack
        align="end"
        spacing={2}
        maxW="100%"
        flexDirection={ownMessage ? "row-reverse" : "row"}
      >
        <Button
          variant="unstyled"
          onContextMenu={(event) => {
            if (!canOpenPreview) return;
            event.preventDefault();
            onOpenUser?.(message.sender);
          }}
          cursor={canOpenPreview ? "context-menu" : "default"}
        >
          <Box position="relative" flexShrink={0}>
            <Avatar
              size="xs"
              src={message.sender.profilePicture}
              name={message.sender.username}
            />
            <Box
              position="absolute"
              right={-1}
              bottom={-1}
              color={senderOnline ? "green.300" : "gray.600"}
              lineHeight="1"
            >
              <FaCircle size={8} />
            </Box>
          </Box>
        </Button>
        <Box
          bg={
            message.sender.id === String(currentUserId)
              ? "linear-gradient(135deg, #2C7A7B, #319795)"
              : "whiteAlpha.080"
          }
          border="1px solid"
          borderColor={
            message.sender.id === String(currentUserId)
              ? "teal.400"
              : "whiteAlpha.120"
          }
          borderRadius={
            ownMessage ? "20px 20px 8px 20px" : "20px 20px 20px 8px"
          }
          flex="1"
          minW={0}
          px={3}
          py={2.5}
          maxW="260px"
          boxShadow="0 10px 24px rgba(0,0,0,0.14)"
        >
          <HStack justify="space-between" spacing={3} mb={1}>
            <Text color="white" fontSize="xs" fontWeight="700" noOfLines={1}>
              {message.sender.username}
            </Text>
            <Text color="whiteAlpha.700" fontSize="10px">
              {formatMessageTime(message.createdAt)}
            </Text>
          </HStack>
          <Text
            color="gray.100"
            fontSize="sm"
            lineHeight="1.6"
            whiteSpace="pre-wrap"
            wordBreak="break-word"
            overflowWrap="anywhere"
          >
            {message.content}
          </Text>
        </Box>
      </HStack>
    </Flex>
  );
}

export default function ChatSidebar() {
  const router = useRouter();
  const { user } = useAuth();
  const isMobile = useBreakpointValue({ base: true, lg: false });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isUserPreviewOpen,
    onOpen: onUserPreviewOpen,
    onClose: onUserPreviewClose,
  } = useDisclosure();
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [threads, setThreads] = useState([]);
  const [dmMessages, setDmMessages] = useState([]);
  const [selectedDm, setSelectedDm] = useState(null);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [previewUser, setPreviewUser] = useState(null);
  const [cooldownSecondsLeft, setCooldownSecondsLeft] = useState(0);
  const endRef = useRef(null);
  const draftRef = useRef(null);

  const shouldHide = !user || router.pathname === "/chat";
  const displayedMessages = selectedDm ? dmMessages : messages;

  const fetchChat = useCallback(
    async (showSpinner = false) => {
      if (!user) return;
      if (showSpinner) setLoading(true);

      try {
        const response = await fetch("/api/chat");
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to load chat");
        }

        setMessages(data.messages || []);
        setOnlineUsers(data.onlineUsers || []);
        setError("");
        setHasLoadedOnce(true);
      } catch (fetchError) {
        console.error("Sidebar chat fetch error:", fetchError);
        setError(fetchError.message || "Could not load chat");
      } finally {
        if (showSpinner) setLoading(false);
      }
    },
    [user]
  );

  const fetchThreads = useCallback(async () => {
    if (!user) return;

    try {
      const response = await fetch("/api/chat/direct/threads");
      const data = await response.json();

      if (response.ok && data.success) {
        setThreads(data.threads || []);
        setHasLoadedOnce(true);
      }
    } catch (threadError) {
      console.error("Sidebar DM thread fetch error:", threadError);
    }
  }, [user]);

  const fetchDirectMessages = useCallback(
    async (targetUserId, showSpinner = false) => {
      if (!user || !targetUserId || targetUserId === String(user.id)) return;
      if (showSpinner) setLoading(true);

      try {
        const response = await fetch(
          `/api/chat/direct?userId=${encodeURIComponent(targetUserId)}`
        );
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to load direct messages");
        }

        setDmMessages(data.messages || []);
        setSelectedDm(data.conversation?.targetUser || null);
        setError("");
        setHasLoadedOnce(true);
      } catch (fetchError) {
        console.error("Sidebar DM fetch error:", fetchError);
        setError(fetchError.message || "Could not load direct messages");
      } finally {
        if (showSpinner) setLoading(false);
      }
    },
    [user]
  );

  useEffect(() => {
    if (!user) return undefined;

    fetchChat(true);
    fetchThreads();

    const interval = window.setInterval(() => {
      fetchChat(false);
      fetchThreads();
      if (selectedDm?.id) {
        fetchDirectMessages(selectedDm.id, false);
      }
    }, 10000);

    return () => window.clearInterval(interval);
  }, [user, fetchChat, fetchThreads, fetchDirectMessages, selectedDm]);

  useEffect(() => {
    if (isOpen) {
      fetchChat(false);
      fetchThreads();
    }
  }, [isOpen, fetchChat, fetchThreads]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayedMessages, isOpen]);

  useEffect(() => {
    const element = draftRef.current;
    if (!element) return;

    element.style.height = "0px";
    element.style.height = `${Math.min(element.scrollHeight, 120)}px`;
  }, [draft]);

  useEffect(() => {
    if (cooldownSecondsLeft <= 0) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setCooldownSecondsLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => window.clearTimeout(timeoutId);
  }, [cooldownSecondsLeft]);

  const onlineUserIds = useMemo(
    () => new Set(onlineUsers.map((onlineUser) => onlineUser.id)),
    [onlineUsers]
  );
  const dmTargetUsers = useMemo(
    () => onlineUsers.filter((onlineUser) => onlineUser.id !== String(user?.id)),
    [onlineUsers, user]
  );

  const sendLabel =
    cooldownSecondsLeft > 0 ? `Send (${cooldownSecondsLeft}s)` : "Send";

  const handleSend = async () => {
    const content = draft.trim();
    if (!content || sending || cooldownSecondsLeft > 0) return;

    setSending(true);
    try {
      const response = await fetch(selectedDm ? "/api/chat/direct" : "/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          selectedDm ? { targetUserId: selectedDm.id, content } : { content }
        ),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to send message");
      }

      setDraft("");
      setError("");
      setCooldownSecondsLeft(MESSAGE_COOLDOWN_SECONDS);
      if (selectedDm) {
        setDmMessages((prev) => [...prev, data.message].slice(-100));
        fetchDirectMessages(selectedDm.id, false);
      } else {
        setMessages((prev) => [...prev, data.message].slice(-100));
        fetchChat(false);
      }
      fetchThreads();
    } catch (sendError) {
      console.error("Sidebar chat send error:", sendError);
      setError(sendError.message || "Could not send message");
      const waitMatch = String(sendError.message || "").match(/wait (\d+) more second/i);
      if (waitMatch) {
        setCooldownSecondsLeft(Number(waitMatch[1]));
      }
    } finally {
      setSending(false);
    }
  };

  const handleEmojiSelect = (emoji) => {
    setDraft((prev) => `${prev}${emoji}`);
    setShowEmojiPicker(false);
  };

  const handleOpenUserPreview = (targetUser) => {
    if (!targetUser || targetUser.id === String(user.id)) return;
    setPreviewUser(targetUser);
    onUserPreviewOpen();
  };

  const handleStartDmFromPreview = (targetUser) => {
    setDraft("");
    fetchDirectMessages(targetUser.id, true);
  };

  if (shouldHide) {
    return null;
  }

  const panelContent = (
    <VStack h="full" align="stretch" spacing={0}>
      <Flex
        px={4}
        py={4}
        borderBottom="1px solid"
        borderColor="whiteAlpha.140"
        justify="space-between"
        align="center"
        bg="linear-gradient(135deg, rgba(45,212,191,0.12), rgba(17,24,39,0.85))"
      >
        <VStack align="start" spacing={0}>
          <HStack spacing={2}>
            <FaComments color="#4FD1C5" />
            <Heading size="sm" color="white">
              Chat
            </Heading>
          </HStack>
          <Text color="gray.500" fontSize="xs">
            {selectedDm ? `DM with ${selectedDm.username}` : "Latest 100 messages"}
          </Text>
        </VStack>
        <HStack spacing={2}>
          {selectedDm ? (
            <Button
              size="xs"
              variant="ghost"
              colorScheme="teal"
              onClick={() => {
                setSelectedDm(null);
                setDmMessages([]);
                setDraft("");
              }}
            >
              Back
            </Button>
          ) : (
            <Button
              size="xs"
              variant="ghost"
              colorScheme="teal"
              onClick={() => {
                onClose();
                router.push("/chat");
              }}
            >
              Open full chat
            </Button>
          )}
          <Badge colorScheme="teal" borderRadius="full" px={2.5} py={1}>
            {dmTargetUsers.length} online
          </Badge>
          <IconButton
            aria-label="Close chat"
            icon={<CloseIcon boxSize={3} />}
            size="sm"
            variant="ghost"
            color="gray.300"
            onClick={onClose}
          />
        </HStack>
      </Flex>

      <Flex flex="1" minH={0} direction="column">
        {!selectedDm ? (
          <Box px={4} pt={3}>
            <Tabs variant="unstyled" size="sm" defaultIndex={0}>
              <TabList gap={2} bg="whiteAlpha.050" borderRadius="full" p={1}>
                <Tab
                  borderRadius="full"
                  px={3}
                  py={1.5}
                  _selected={{
                    bg: "teal.500",
                    color: "white",
                    boxShadow: "0 8px 18px rgba(45,212,191,0.22)",
                  }}
                  color="gray.300"
                >
                  Lobby
                </Tab>
                <Tab
                  borderRadius="full"
                  px={3}
                  py={1.5}
                  _selected={{
                    bg: "teal.500",
                    color: "white",
                    boxShadow: "0 8px 18px rgba(45,212,191,0.22)",
                  }}
                  color="gray.300"
                >
                  DMs
                </Tab>
              </TabList>
              <TabPanels>
                <TabPanel px={0} pt={3} pb={0}>
                  <Text color="gray.500" fontSize="xs">
                    Global room chat
                  </Text>
                </TabPanel>
                <TabPanel px={0} pt={3} pb={0}>
                  <VStack align="stretch" spacing={2} maxH="160px" overflowY="auto">
                    {threads.length === 0 ? (
                      <Text color="gray.500" fontSize="xs">
                        No DM threads yet.
                      </Text>
                    ) : (
                      threads.map((thread) => (
                        <Button
                          key={thread.id}
                          variant="unstyled"
                          h="auto"
                          py={0}
                          px={0}
                          onClick={() => {
                            setDraft("");
                            fetchDirectMessages(thread.targetUser.id, true);
                          }}
                        >
                          <HStack
                            spacing={3}
                            w="full"
                            bg="whiteAlpha.050"
                            border="1px solid"
                            borderColor="whiteAlpha.100"
                            borderRadius="xl"
                            px={3}
                            py={2.5}
                            _hover={{ bg: "whiteAlpha.090", borderColor: "teal.500" }}
                          >
                            <Avatar
                              size="xs"
                              src={thread.targetUser.profilePicture}
                              name={thread.targetUser.username}
                            />
                            <VStack align="start" spacing={0} minW={0} flex="1">
                              <Text
                                color="white"
                                fontSize="xs"
                                fontWeight="600"
                                noOfLines={1}
                              >
                                {thread.targetUser.username}
                              </Text>
                              <Text color="gray.500" fontSize="10px" noOfLines={1}>
                                {thread.lastMessage?.content || "No messages yet"}
                              </Text>
                            </VStack>
                          </HStack>
                        </Button>
                      ))
                    )}
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
            <Divider mt={3} borderColor="whiteAlpha.120" />
          </Box>
        ) : null}

        <Box
          flex="1"
          overflowY="auto"
          px={4}
          py={4}
          bg="linear-gradient(180deg, rgba(255,255,255,0.01), rgba(255,255,255,0))"
        >
          {loading && !hasLoadedOnce ? (
            <Flex h="full" justify="center" align="center">
              <Spinner color="teal.300" />
            </Flex>
          ) : (
            <VStack spacing={3} align="stretch">
              {displayedMessages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  ownMessage={message.sender.id === String(user.id)}
                  senderOnline={onlineUserIds.has(message.sender.id)}
                  currentUserId={user.id}
                  onOpenUser={handleOpenUserPreview}
                />
              ))}
              {displayedMessages.length === 0 && !loading ? (
                <Text color="gray.500" fontSize="sm">
                  {selectedDm ? "No direct messages yet." : "No messages yet."}
                </Text>
              ) : null}
              <Box ref={endRef} />
            </VStack>
          )}
        </Box>

        <Box
          px={4}
          py={4}
          borderTop="1px solid"
          borderColor="whiteAlpha.140"
          bg="gray.900"
        >
          {error ? (
            <Text color="red.300" fontSize="xs" mb={2}>
              {error}
            </Text>
          ) : null}
          <VStack align="stretch" spacing={2}>
            {showEmojiPicker ? (
              <ChatEmojiPicker onSelect={handleEmojiSelect} />
            ) : null}
            <HStack justify="space-between">
              <IconButton
                aria-label={showEmojiPicker ? "Close emoji picker" : "Open emoji picker"}
                icon={<FaRegSmile />}
                variant="outline"
                size="sm"
                color="yellow.200"
                borderColor="whiteAlpha.220"
                bg={showEmojiPicker ? "whiteAlpha.120" : "transparent"}
                _hover={{ bg: "whiteAlpha.140", borderColor: "yellow.300" }}
                onClick={() => setShowEmojiPicker((prev) => !prev)}
              />
              <Text color="gray.500" fontSize="xs">
                Right-click a user to open profile actions
              </Text>
            </HStack>
            <HStack
              spacing={2}
              bg="whiteAlpha.040"
              border="1px solid"
              borderColor="whiteAlpha.120"
              borderRadius="2xl"
              px={2}
              py={2}
            >
              <Textarea
                ref={draftRef}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder={
                  selectedDm
                    ? `Message ${selectedDm.username}...`
                    : "Message the room..."
                }
                maxLength={50}
                bg="transparent"
                border="none"
                color="white"
                fontSize="16px"
                resize="none"
                overflowY="auto"
                minH="24px"
                maxH="120px"
                py={1}
                _focus={{ boxShadow: "none" }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    handleSend();
                  }
                }}
              />
              <Button
                colorScheme="teal"
                onClick={handleSend}
                isLoading={sending}
                isDisabled={cooldownSecondsLeft > 0}
                borderRadius="xl"
                px={5}
                minW="124px"
                leftIcon={cooldownSecondsLeft > 0 ? undefined : <FaPaperPlane />}
              >
                {sendLabel}
              </Button>
            </HStack>
            <Text color="gray.500" fontSize="xs" pt={1}>
              Max 50 characters. Send limit: 1 message every 3 seconds.
            </Text>
          </VStack>
        </Box>
      </Flex>
    </VStack>
  );

  return (
    <>
      {isMobile ? (
        <Button
          position="fixed"
          left={4}
          bottom={20}
          zIndex={25}
          colorScheme="teal"
          borderRadius="full"
          boxShadow="2xl"
          leftIcon={<FaComments />}
          onClick={onOpen}
        >
          Chat
        </Button>
      ) : !isOpen ? (
        <IconButton
          position="fixed"
          left={4}
          bottom={6}
          zIndex={25}
          aria-label="Open chat"
          icon={<ChevronRightIcon boxSize={6} />}
          colorScheme="teal"
          borderRadius="full"
          boxShadow="2xl"
          onClick={onOpen}
        />
      ) : null}

      {isMobile ? (
        <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
          <DrawerOverlay />
          <DrawerContent bg="gray.800">
            <DrawerHeader p={0} />
            <DrawerBody p={0}>{panelContent}</DrawerBody>
          </DrawerContent>
        </Drawer>
      ) : isOpen ? (
        <Box
          position="fixed"
          top="88px"
          left={4}
          w="340px"
          h="calc(100vh - 112px)"
          boxShadow="0 32px 80px rgba(0,0,0,0.35)"
          zIndex={25}
          overflow="visible"
        >
          <Box
            h="full"
            bg="gray.800"
            border="1px solid"
            borderColor="whiteAlpha.160"
            borderRadius="3xl"
            overflow="hidden"
          >
            {panelContent}
          </Box>
          {!selectedDm && dmTargetUsers.length > 0 ? (
            <VStack
              position="absolute"
              right={-42}
              top="132px"
              spacing={3}
              align="center"
            >
              {dmTargetUsers.slice(0, 6).map((onlineUser) => (
                <Box key={onlineUser.id} position="relative">
                  <Button
                    variant="unstyled"
                    onClick={() => {
                      setDraft("");
                      fetchDirectMessages(onlineUser.id, true);
                    }}
                    onContextMenu={(event) => {
                      event.preventDefault();
                      handleOpenUserPreview(onlineUser);
                    }}
                    cursor="pointer"
                    borderRadius="full"
                  >
                    <Avatar
                      size="sm"
                      src={onlineUser.profilePicture}
                      name={onlineUser.username}
                      border="2px solid"
                      borderColor="gray.800"
                      boxShadow="0 10px 24px rgba(0,0,0,0.28)"
                    />
                  </Button>
                  <Box
                    position="absolute"
                    right={1}
                    bottom={1}
                    color="green.300"
                    lineHeight="1"
                  >
                    <FaCircle size={10} />
                  </Box>
                </Box>
              ))}
            </VStack>
          ) : null}
        </Box>
      ) : null}
      <ChatUserPreview
        isOpen={isUserPreviewOpen}
        onClose={onUserPreviewClose}
        user={previewUser}
        isOnline={previewUser ? onlineUserIds.has(previewUser.id) : false}
        onStartDm={handleStartDmFromPreview}
      />
    </>
  );
}
