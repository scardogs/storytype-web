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
  Input,
  Spinner,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  VStack,
  useBreakpointValue,
  useDisclosure,
} from "@chakra-ui/react";
import { ChevronRightIcon, CloseIcon } from "@chakra-ui/icons";
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

export default function ChatSidebar() {
  const router = useRouter();
  const { user } = useAuth();
  const isMobile = useBreakpointValue({ base: true, lg: false });
  const { isOpen, onOpen, onClose } = useDisclosure();
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
  const endRef = useRef(null);

  const shouldHide = !user || router.pathname === "/chat";

  const fetchChat = useCallback(
    async (showSpinner = false) => {
      if (!user) return;

      if (showSpinner) {
        setLoading(true);
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
        console.error("Sidebar chat fetch error:", fetchError);
        setError(fetchError.message || "Could not load chat");
      } finally {
        if (showSpinner) {
          setLoading(false);
        }
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
      if (!user || !targetUserId) return;

      if (showSpinner) {
        setLoading(true);
      }

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
        if (showSpinner) {
          setLoading(false);
        }
      }
    },
    [user]
  );

  useEffect(() => {
    if (!user) return;

    fetchChat(true);
    fetchThreads();

    const interval = window.setInterval(() => {
      fetchChat(false);
      fetchThreads();
      if (selectedDm?.id) {
        fetchDirectMessages(selectedDm.id, false);
      }
    }, 10000);

    return () => {
      window.clearInterval(interval);
    };
  }, [user, fetchChat, fetchThreads, fetchDirectMessages, selectedDm]);

  useEffect(() => {
    if (isOpen) {
      fetchChat(false);
      fetchThreads();
    }
  }, [isOpen, fetchChat, fetchThreads]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, dmMessages, isOpen]);

  const onlineUserIds = useMemo(
    () => new Set(onlineUsers.map((onlineUser) => onlineUser.id)),
    [onlineUsers]
  );

  const handleSend = async () => {
    const content = draft.trim();

    if (!content || sending) return;

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
    } finally {
      setSending(false);
    }
  };

  const handleEmojiSelect = (emoji) => {
    setDraft((prev) => `${prev}${emoji}`);
    setShowEmojiPicker(false);
  };

  const displayedMessages = selectedDm ? dmMessages : messages;

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
            {onlineUsers.length} online
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
              <TabList gap={2}>
                <Tab
                  borderRadius="full"
                  px={3}
                  py={1.5}
                  _selected={{ bg: "teal.600", color: "white" }}
                  color="gray.300"
                >
                  Lobby
                </Tab>
                <Tab
                  borderRadius="full"
                  px={3}
                  py={1.5}
                  _selected={{ bg: "teal.600", color: "white" }}
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
                          variant="ghost"
                          justifyContent="flex-start"
                          h="auto"
                          py={2.5}
                          px={2}
                          onClick={() => {
                            setDraft("");
                            fetchDirectMessages(thread.targetUser.id, true);
                          }}
                        >
                          <HStack spacing={3} w="full">
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

        <Box flex="1" overflowY="auto" px={4} py={4}>
          {loading && !hasLoadedOnce ? (
            <Flex h="full" justify="center" align="center">
              <Spinner color="teal.300" />
            </Flex>
          ) : (
            <VStack spacing={3} align="stretch">
              {displayedMessages.map((message) => {
                const ownMessage = message.sender.id === String(user.id);
                const senderOnline = onlineUserIds.has(message.sender.id);

                return (
                  <Flex
                    key={message.id}
                    justify={ownMessage ? "flex-end" : "flex-start"}
                  >
                    <HStack
                      align="start"
                      spacing={2}
                      maxW="100%"
                      flexDirection={ownMessage ? "row-reverse" : "row"}
                    >
                      <Box position="relative">
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
                      <Box
                        bg={ownMessage ? "teal.600" : "whiteAlpha.080"}
                        borderRadius="2xl"
                        px={3}
                        py={2.5}
                        maxW="260px"
                      >
                        <HStack justify="space-between" spacing={3} mb={1}>
                          <Text color="white" fontSize="xs" fontWeight="700" noOfLines={1}>
                            {message.sender.username}
                          </Text>
                          <Text color="whiteAlpha.700" fontSize="10px">
                            {formatMessageTime(message.createdAt)}
                          </Text>
                        </HStack>
                        <Text color="gray.100" fontSize="sm" lineHeight="1.6">
                          {message.content}
                        </Text>
                      </Box>
                    </HStack>
                  </Flex>
                );
              })}
              {displayedMessages.length === 0 && !loading ? (
                <Text color="gray.500" fontSize="sm">
                  {selectedDm ? "No direct messages yet." : "No messages yet."}
                </Text>
              ) : null}
              <Box ref={endRef} />
            </VStack>
          )}
        </Box>

        <Box px={4} py={4} borderTop="1px solid" borderColor="whiteAlpha.140">
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
            <Input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder={
                selectedDm
                  ? `Message ${selectedDm.username}...`
                  : "Message the room..."
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
            <Button colorScheme="teal" onClick={handleSend} isLoading={sending}>
              Send
            </Button>
            {!selectedDm ? (
              <VStack align="stretch" spacing={2} pt={2}>
                <Text color="gray.500" fontSize="xs">
                  Start a DM from online users
                </Text>
                <VStack align="stretch" spacing={2} maxH="140px" overflowY="auto">
                  {onlineUsers.length === 0 ? (
                    <Text color="gray.500" fontSize="xs">
                      Nobody online right now.
                    </Text>
                  ) : (
                    onlineUsers.map((onlineUser) => (
                      <HStack key={onlineUser.id} spacing={2}>
                        <Avatar
                          size="xs"
                          src={onlineUser.profilePicture}
                          name={onlineUser.username}
                        />
                        <Text color="white" fontSize="xs" flex="1" noOfLines={1}>
                          {onlineUser.username}
                        </Text>
                        <Button
                          size="xs"
                          variant="ghost"
                          colorScheme="teal"
                          onClick={() => {
                            setDraft("");
                            fetchDirectMessages(onlineUser.id, true);
                          }}
                        >
                          DM
                        </Button>
                      </HStack>
                    ))
                  )}
                </VStack>
              </VStack>
            ) : null}
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
          bg="gray.800"
          border="1px solid"
          borderColor="whiteAlpha.160"
          borderRadius="3xl"
          boxShadow="0 32px 80px rgba(0,0,0,0.35)"
          zIndex={25}
          overflow="hidden"
        >
          {panelContent}
        </Box>
      ) : null}
    </>
  );
}
