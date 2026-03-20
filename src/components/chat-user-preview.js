import React from "react";
import {
  Avatar,
  Badge,
  Button,
  HStack,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  VStack,
} from "@chakra-ui/react";

export default function ChatUserPreview({
  isOpen,
  onClose,
  user,
  isOnline = false,
  onStartDm,
}) {
  if (!user) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(4px)" />
      <ModalContent
        bg="gray.850"
        border="1px solid"
        borderColor="whiteAlpha.180"
        borderRadius="2xl"
      >
        <ModalHeader pb={2} color="white">
          User Profile
        </ModalHeader>
        <ModalBody pb={6}>
          <VStack spacing={4} align="stretch">
            <HStack spacing={4}>
              <Avatar
                size="lg"
                src={user.profilePicture}
                name={user.username}
              />
              <VStack align="start" spacing={1}>
                <Text color="white" fontSize="lg" fontWeight="700">
                  {user.username}
                </Text>
                <Badge
                  colorScheme={isOnline ? "green" : "gray"}
                  borderRadius="full"
                  px={2.5}
                  py={1}
                >
                  {isOnline ? "Online now" : "Offline"}
                </Badge>
              </VStack>
            </HStack>

            <Text color="gray.400" fontSize="sm" lineHeight="1.7">
              Start a direct conversation with this user from chat.
            </Text>

            <Button
              colorScheme="teal"
              onClick={() => {
                onStartDm?.(user);
                onClose();
              }}
            >
              DM User
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
