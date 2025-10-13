import React from "react";
import Navbar from "../components/navbar";
import LoginRegister from "../components/login-register";
import UserProfile from "../components/user-profile";
import { useAuth } from "../context/AuthContext";
import { Flex, Spinner, useColorModeValue } from "@chakra-ui/react";

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const bgColor = useColorModeValue("gray.100", "gray.900");

  if (loading) {
    return (
      <>
        <Navbar />
        <Flex
          minH="100vh"
          align="center"
          justify="center"
          bg={bgColor}
        >
          <Spinner size="xl" color="teal.400" />
        </Flex>
      </>
    );
  }

  return (
    <>
      <Navbar />
      {user ? <UserProfile /> : <LoginRegister />}
    </>
  );
}
