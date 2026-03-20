import React from "react";
import { Box, Button, SimpleGrid } from "@chakra-ui/react";

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
      bg="gray.800"
      border="1px solid"
      borderColor="whiteAlpha.180"
      borderRadius="2xl"
      p={3}
      boxShadow="xl"
    >
      <SimpleGrid columns={4} spacing={2}>
        {EMOJIS.map((emoji) => (
          <Button
            key={emoji}
            variant="ghost"
            fontSize="xl"
            onClick={() => onSelect(emoji)}
            minW="0"
            h="44px"
          >
            {emoji}
          </Button>
        ))}
      </SimpleGrid>
    </Box>
  );
}
