import React from "react";
import { Box, Button, HStack, SimpleGrid, Text, VStack } from "@chakra-ui/react";

const EMOJIS = [
  "😀",
  "😂",
  "😍",
  "🔥",
  "🚀",
  "🎯",
  "🏆",
  "👏",
  "💯",
  "😎",
  "🤝",
  "🙌",
  "👀",
  "✨",
  "💬",
  "❤️",
];

export default function ChatEmojiPicker({ onSelect }) {
  return (
    <Box
      bg="gray.850"
      border="1px solid"
      borderColor="whiteAlpha.180"
      borderRadius="2xl"
      p={3}
      boxShadow="0 20px 40px rgba(0,0,0,0.28)"
    >
      <VStack align="stretch" spacing={3}>
        <HStack justify="space-between">
          <Text color="white" fontSize="sm" fontWeight="700">
            Quick reactions
          </Text>
          <Text color="gray.500" fontSize="xs">
            Tap to insert
          </Text>
        </HStack>
        <SimpleGrid columns={4} spacing={2}>
          {EMOJIS.map((emoji) => (
            <Button
              key={emoji}
              variant="ghost"
              fontSize="xl"
              onClick={() => onSelect(emoji)}
              minW="0"
              h="46px"
              borderRadius="xl"
              bg="whiteAlpha.040"
              _hover={{ bg: "whiteAlpha.120", transform: "translateY(-1px)" }}
            >
              {emoji}
            </Button>
          ))}
        </SimpleGrid>
      </VStack>
    </Box>
  );
}
