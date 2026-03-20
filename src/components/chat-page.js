import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Input,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { FaCircle, FaComments } from "react-icons/fa";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";
import ChatEmojiPicker from "./chat-emoji-picker";

function formatMessageTime(dateString) {
  return new Date(dateString).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function ChatPage() {
  const router = useRouter();
  const dmUserId = typeof router.query.dm === "string" ? router.query.dm : "";
  const { user, loading } = useAuth();
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
  const endRef = useRef(null);

  const fetchChat = useCallback(async (showSpinner = false) => {
    if (!user) return;

    if (showSpinner) {
      setChatLoading(true);
    }

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
      if (showSpinner) {
        setChatLoading(false);
      }
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

      if (showSpinner) {
        setChatLoading(true);
      }

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
        if (showSpinner) {
          setChatLoading(false);
        }
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
    if (!user) return;

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

    return () => {
      window.clearInterval(interval);
    };
  }, [user, fetchChat, fetchDirectMessages, fetchThreads, dmUserId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const onlineUserIds = useMemo(
    () => new Set(onlineUsers.map((onlineUser) => onlineUser.id)),
    [onlineUsers]
  );

  const handleSend = async () => {
    const content = draft.trim();

    if (!content || sending) return;

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
    } finally {
      setSending(false);
    }
  };

  const handleEmojiSelect = (emoji) => {
    setDraft((prev) => `${prev}${emoji}`);
    setShowEmojiPicker(false);
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
      <VStack maxW="1400px" mx="auto" spacing={6} align="stretch">
        <Flex
          direction={{ base: "column", lg: "row" }}
          gap={6}
          align={{ base: "stretch", lg: "start" }}
        >
          <Box
            flex="1"
            bg="gray.800"
            border="1px solid"
            borderColor="whiteAlpha.120"
            borderRadius="3xl"
            overflow="hidden"
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
                    : "Global lobby chat. The room automatically keeps only the latest 100 messages."}
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
                  {onlineUsers.length} online
                </Badge>
              </HStack>
            </Flex>

            <Box
              h={{ base: "52vh", md: "60vh" }}
              overflowY="auto"
              px={{ base: 4, md: 6 }}
              py={5}
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
                  {messages.map((message) => {
                    const ownMessage = message.sender.id === String(user?.id);
                    const senderOnline = onlineUserIds.has(message.sender.id);

                    return (
                      <Flex
                        key={message.id}
                        justify={ownMessage ? "flex-end" : "flex-start"}
                      >
                        <HStack
                          align="start"
                          spacing={3}
                          maxW={{ base: "92%", md: "75%" }}
                          flexDirection={ownMessage ? "row-reverse" : "row"}
                        >
                          <Box position="relative">
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
                          <Box
                            bg={ownMessage ? "teal.600" : "whiteAlpha.080"}
                            borderRadius="2xl"
                            px={4}
                            py={3}
                          >
                            <HStack justify="space-between" spacing={4} mb={1}>
                              <Text color="white" fontSize="sm" fontWeight="700">
                                {message.sender.username}
                              </Text>
                              <Text color="whiteAlpha.700" fontSize="xs">
                                {formatMessageTime(message.createdAt)}
                              </Text>
                            </HStack>
                            <Text color="gray.100" fontSize="sm" lineHeight="1.7">
                              {message.content}
                            </Text>
                          </Box>
                        </HStack>
                      </Flex>
                    );
                  })}
                  <Box ref={endRef} />
                </VStack>
              )}
            </Box>

            <Box
              px={{ base: 4, md: 6 }}
              py={4}
              borderTop="1px solid"
              borderColor="whiteAlpha.120"
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
                  <Button
                    variant="ghost"
                    size="sm"
                    color="gray.300"
                    onClick={() => setShowEmojiPicker((prev) => !prev)}
                  >
                    Emoji
                  </Button>
                  <Text color="gray.500" fontSize="xs">
                    Emoji supported
                  </Text>
                </HStack>
                <HStack align="stretch">
                  <Input
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    placeholder={
                      selectedDm
                        ? `Message ${selectedDm.username}...`
                        : "Say something to the room..."
                    }
                    maxLength={300}
                    bg="gray.900"
                    borderColor="whiteAlpha.160"
                    color="white"
                    fontSize="16px"
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
                    minW={{ base: "88px", md: "100px" }}
                  >
                    Send
                  </Button>
                </HStack>
                <Text color="gray.500" fontSize="xs">
                  {selectedDm
                    ? "DM limit: 100 messages per conversation. Older messages are deleted automatically."
                    : "Chat limit: 100 messages total. Older messages are deleted automatically."}
                </Text>
              </VStack>
            </Box>
          </Box>

          <Box
            w={{ base: "full", lg: "320px" }}
            bg="gray.800"
            border="1px solid"
            borderColor="whiteAlpha.120"
            borderRadius="3xl"
            p={5}
          >
            <VStack align="stretch" spacing={4}>
              <Heading size="sm" color="white">
                Direct messages
              </Heading>
              {threads.length === 0 ? (
                <Text color="gray.500" fontSize="sm">
                  No DM threads yet.
                </Text>
              ) : (
                <VStack align="stretch" spacing={2}>
                  {threads.map((thread) => (
                    <Button
                      key={thread.id}
                      variant="ghost"
                      justifyContent="flex-start"
                      h="auto"
                      py={3}
                      px={3}
                      bg={
                        thread.targetUser.id === dmUserId
                          ? "whiteAlpha.090"
                          : "transparent"
                      }
                      onClick={() =>
                        router.push(`/chat?dm=${encodeURIComponent(thread.targetUser.id)}`)
                      }
                    >
                      <HStack spacing={3} w="full" align="start">
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
              <Heading size="sm" color="white">
                Online now
              </Heading>
              {onlineUsers.length === 0 ? (
                <Text color="gray.500" fontSize="sm">
                  Nobody is online right now.
                </Text>
              ) : (
                <VStack align="stretch" spacing={3}>
                  {onlineUsers.map((onlineUser) => (
                    <HStack key={onlineUser.id} spacing={3}>
                      <Box position="relative">
                        <Avatar
                          size="sm"
                          src={onlineUser.profilePicture}
                          name={onlineUser.username}
                        />
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
    </Box>
  );
}
