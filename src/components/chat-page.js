import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  IconButton,
  Spinner,
  Text,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import { FaCircle, FaComments, FaPaperPlane, FaRegSmile } from "react-icons/fa";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";
import ChatEmojiPicker from "./chat-emoji-picker";
import ChatUserPreview from "./chat-user-preview";
import { useDisclosure } from "@chakra-ui/react";

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
        spacing={3}
        maxW={{ base: "94%", md: "78%" }}
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
              size="sm"
              src={message.sender.profilePicture}
              name={message.sender.username}
            />
            <Box
              position="absolute"
              right={0}
              bottom={0}
              color={senderOnline ? "green.300" : "gray.600"}
              lineHeight="1"
            >
              <FaCircle size={10} />
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
            ownMessage ? "24px 24px 10px 24px" : "24px 24px 24px 10px"
          }
          flex="1"
          minW={0}
          maxW="100%"
          px={4}
          py={3}
          boxShadow="0 14px 34px rgba(0,0,0,0.18)"
        >
          <HStack justify="space-between" spacing={4} mb={1}>
            <Text color="white" fontSize="sm" fontWeight="700">
              {message.sender.username}
            </Text>
            <Text color="whiteAlpha.700" fontSize="xs">
              {formatMessageTime(message.createdAt)}
            </Text>
          </HStack>
          <Text
            color="gray.100"
            fontSize="sm"
            lineHeight="1.7"
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

export default function ChatPage() {
  const router = useRouter();
  const dmUserId = typeof router.query.dm === "string" ? router.query.dm : "";
  const { user, loading } = useAuth();
  const {
    isOpen: isUserPreviewOpen,
    onOpen: onUserPreviewOpen,
    onClose: onUserPreviewClose,
  } = useDisclosure();
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [threads, setThreads] = useState([]);
  const [selectedDm, setSelectedDm] = useState(null);
  const [draft, setDraft] = useState("");
  const [chatLoading, setChatLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [previewUser, setPreviewUser] = useState(null);
  const [cooldownSecondsLeft, setCooldownSecondsLeft] = useState(0);
  const endRef = useRef(null);
  const draftRef = useRef(null);

  const fetchChat = useCallback(async (showSpinner = false) => {
    if (!user) return;
    if (showSpinner) setChatLoading(true);

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
      console.error("Chat fetch error:", fetchError);
      setError(fetchError.message || "Could not load chat");
    } finally {
      if (showSpinner) setChatLoading(false);
    }
  }, [user]);

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
      console.error("DM thread fetch error:", threadError);
    }
  }, [user]);

  const fetchDirectMessages = useCallback(
    async (targetUserId, showSpinner = false) => {
      if (!user || !targetUserId) return;
      if (showSpinner) setChatLoading(true);

      try {
        const response = await fetch(
          `/api/chat/direct?userId=${encodeURIComponent(targetUserId)}`
        );
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to load direct messages");
        }

        setMessages(data.messages || []);
        setSelectedDm(data.conversation?.targetUser || null);
        setError("");
        setHasLoadedOnce(true);
      } catch (fetchError) {
        console.error("Direct message fetch error:", fetchError);
        setError(fetchError.message || "Could not load direct messages");
      } finally {
        if (showSpinner) setChatLoading(false);
      }
    },
    [user]
  );

  useEffect(() => {
    if (!loading && !user) {
      router.push("/profile");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return undefined;

    if (dmUserId) {
      fetchDirectMessages(dmUserId, true);
    } else {
      setSelectedDm(null);
      fetchChat(true);
    }
    fetchThreads();

    const interval = window.setInterval(() => {
      if (dmUserId) {
        fetchDirectMessages(dmUserId, false);
      } else {
        fetchChat(false);
      }
      fetchThreads();
    }, 10000);

    return () => window.clearInterval(interval);
  }, [user, fetchChat, fetchDirectMessages, fetchThreads, dmUserId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const element = draftRef.current;
    if (!element) return;

    element.style.height = "0px";
    element.style.height = `${Math.min(element.scrollHeight, 140)}px`;
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
      const response = await fetch(dmUserId ? "/api/chat/direct" : "/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          dmUserId ? { targetUserId: dmUserId, content } : { content }
        ),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to send message");
      }

      setDraft("");
      setError("");
      setCooldownSecondsLeft(MESSAGE_COOLDOWN_SECONDS);
      setMessages((prev) => [...prev, data.message].slice(-100));
      if (dmUserId) {
        fetchDirectMessages(dmUserId, false);
      } else {
        fetchChat(false);
      }
      fetchThreads();
    } catch (sendError) {
      console.error("Chat send error:", sendError);
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

  if (loading || (!user && !error)) {
    return (
      <Flex minH="100vh" bg="gray.900" justify="center" align="center">
        <Spinner color="teal.300" size="xl" />
      </Flex>
    );
  }

  return (
    <Box minH="100vh" bg="gray.900" px={{ base: 3, md: 6 }} py={{ base: 4, md: 8 }}>
      <VStack maxW="1480px" mx="auto" spacing={6} align="stretch">
        <Flex direction={{ base: "column", lg: "row" }} gap={6} align="stretch">
          <Box
            flex="1"
            bg="gray.800"
            border="1px solid"
            borderColor="whiteAlpha.120"
            borderRadius="3xl"
            overflow="hidden"
            boxShadow="0 28px 80px rgba(0,0,0,0.22)"
          >
            <Flex
              px={{ base: 4, md: 6 }}
              py={4}
              borderBottom="1px solid"
              borderColor="whiteAlpha.120"
              justify="space-between"
              align={{ base: "start", md: "center" }}
              direction={{ base: "column", md: "row" }}
              gap={3}
              bg="linear-gradient(135deg, rgba(45,212,191,0.12), rgba(17,24,39,0.86))"
            >
              <VStack align="start" spacing={1}>
                <HStack spacing={3}>
                  <FaComments color="#4FD1C5" />
                  <Heading size="md" color="white">
                    {selectedDm ? `DM with ${selectedDm.username}` : "StoryType Chat"}
                  </Heading>
                </HStack>
                <Text color="gray.400" fontSize="sm">
                  {selectedDm
                    ? "Direct messages keep only the latest 100 messages in each thread."
                    : "Global lobby chat with live online presence and direct-message routing."}
                </Text>
              </VStack>
              <HStack>
                {selectedDm ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    colorScheme="teal"
                    onClick={() => router.push("/chat")}
                  >
                    Back to lobby
                  </Button>
                ) : null}
                <Badge colorScheme="teal" borderRadius="full" px={3} py={1}>
                  {dmTargetUsers.length} online
                </Badge>
              </HStack>
            </Flex>

            <Box
              h={{ base: "52vh", md: "60vh" }}
              overflowY="auto"
              px={{ base: 4, md: 6 }}
              py={5}
              bg="linear-gradient(180deg, rgba(255,255,255,0.01), rgba(255,255,255,0))"
            >
              {chatLoading && !hasLoadedOnce ? (
                <Flex h="full" justify="center" align="center">
                  <Spinner color="teal.300" />
                </Flex>
              ) : messages.length === 0 ? (
                <Flex h="full" justify="center" align="center">
                  <Text color="gray.500">No messages yet. Start the room.</Text>
                </Flex>
              ) : (
                <VStack spacing={4} align="stretch">
                  {messages.map((message) => (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      ownMessage={message.sender.id === String(user?.id)}
                      senderOnline={onlineUserIds.has(message.sender.id)}
                      currentUserId={user.id}
                      onOpenUser={handleOpenUserPreview}
                    />
                  ))}
                  <Box ref={endRef} />
                </VStack>
              )}
            </Box>

            <Box
              px={{ base: 4, md: 6 }}
              py={4}
              borderTop="1px solid"
              borderColor="whiteAlpha.120"
              bg="gray.900"
            >
              <VStack spacing={3} align="stretch">
                {error ? (
                  <Text color="red.300" fontSize="sm">
                    {error}
                  </Text>
                ) : null}
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
                  align="stretch"
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
                        : "Say something to the room..."
                    }
                    maxLength={50}
                    bg="transparent"
                    border="none"
                    color="white"
                    fontSize="16px"
                    resize="none"
                    overflowY="auto"
                    minH="24px"
                    maxH="140px"
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
                    minW={{ base: "124px", md: "136px" }}
                    px={5}
                    borderRadius="xl"
                    leftIcon={cooldownSecondsLeft > 0 ? undefined : <FaPaperPlane />}
                  >
                    {sendLabel}
                  </Button>
                </HStack>
                <Text color="gray.500" fontSize="xs">
                  {selectedDm
                    ? "DM limit: 100 messages per conversation and 1 message every 3 seconds."
                    : "Chat limit: 100 messages total and 1 message every 3 seconds."}
                </Text>
              </VStack>
            </Box>
          </Box>

          <Box
            w={{ base: "full", lg: "340px" }}
            bg="gray.800"
            border="1px solid"
            borderColor="whiteAlpha.120"
            borderRadius="3xl"
            p={5}
            boxShadow="0 24px 60px rgba(0,0,0,0.18)"
          >
            <VStack align="stretch" spacing={5}>
              <VStack align="start" spacing={1}>
                <Heading size="sm" color="white">
                  Direct messages
                </Heading>
                <Text color="gray.500" fontSize="xs">
                  Jump into your most recent private threads
                </Text>
              </VStack>
              {threads.length === 0 ? (
                <Text color="gray.500" fontSize="sm">
                  No DM threads yet.
                </Text>
              ) : (
                <VStack align="stretch" spacing={2}>
                  {threads.map((thread) => (
                    <Button
                      key={thread.id}
                      variant="unstyled"
                      h="auto"
                      py={0}
                      px={0}
                      onClick={() =>
                        router.push(`/chat?dm=${encodeURIComponent(thread.targetUser.id)}`)
                      }
                    >
                      <HStack
                        spacing={3}
                        w="full"
                        align="start"
                        bg={
                          thread.targetUser.id === dmUserId
                            ? "whiteAlpha.100"
                            : "whiteAlpha.040"
                        }
                        border="1px solid"
                        borderColor={
                          thread.targetUser.id === dmUserId
                            ? "teal.500"
                            : "whiteAlpha.100"
                        }
                        borderRadius="xl"
                        px={3}
                        py={3}
                        _hover={{ bg: "whiteAlpha.080" }}
                      >
                        <Avatar
                          size="sm"
                          src={thread.targetUser.profilePicture}
                          name={thread.targetUser.username}
                        />
                        <VStack align="start" spacing={0} minW={0} flex="1">
                          <Text color="white" fontSize="sm" fontWeight="600" noOfLines={1}>
                            {thread.targetUser.username}
                          </Text>
                          <Text color="gray.500" fontSize="xs" noOfLines={1}>
                            {thread.lastMessage?.content || "No messages yet"}
                          </Text>
                        </VStack>
                      </HStack>
                    </Button>
                  ))}
                </VStack>
              )}

              <VStack align="start" spacing={1} pt={2}>
                <Heading size="sm" color="white">
                  Online now
                </Heading>
                <Text color="gray.500" fontSize="xs">
                  Start a DM instantly from the live online list
                </Text>
              </VStack>
              {dmTargetUsers.length === 0 ? (
                <Text color="gray.500" fontSize="sm">
                  Nobody is online right now.
                </Text>
              ) : (
                <VStack align="stretch" spacing={3}>
                  {dmTargetUsers.map((onlineUser) => (
                    <HStack
                      key={onlineUser.id}
                      spacing={3}
                      bg="whiteAlpha.040"
                      border="1px solid"
                      borderColor="whiteAlpha.100"
                      borderRadius="xl"
                      px={3}
                      py={3}
                    >
                      <Box position="relative">
                        <Button
                          variant="unstyled"
                          onContextMenu={(event) => {
                            event.preventDefault();
                            handleOpenUserPreview(onlineUser);
                          }}
                          cursor="context-menu"
                        >
                          <Avatar
                            size="sm"
                            src={onlineUser.profilePicture}
                            name={onlineUser.username}
                          />
                        </Button>
                        <Box
                          position="absolute"
                          right={0}
                          bottom={0}
                          color="green.300"
                          lineHeight="1"
                        >
                          <FaCircle size={10} />
                        </Box>
                      </Box>
                      <VStack align="start" spacing={0} flex="1">
                        <Text color="white" fontSize="sm" fontWeight="600">
                          {onlineUser.username}
                        </Text>
                        <Text color="gray.500" fontSize="xs">
                          active now
                        </Text>
                      </VStack>
                      <Button
                        size="xs"
                        variant="ghost"
                        colorScheme="teal"
                        onClick={() =>
                          router.push(`/chat?dm=${encodeURIComponent(onlineUser.id)}`)
                        }
                      >
                        DM
                      </Button>
                    </HStack>
                  ))}
                </VStack>
              )}
            </VStack>
          </Box>
        </Flex>
      </VStack>
      <ChatUserPreview
        isOpen={isUserPreviewOpen}
        onClose={onUserPreviewClose}
        user={previewUser}
        isOnline={previewUser ? onlineUserIds.has(previewUser.id) : false}
        onStartDm={(targetUser) =>
          router.push(`/chat?dm=${encodeURIComponent(targetUser.id)}`)
        }
      />
    </Box>
  );
}
