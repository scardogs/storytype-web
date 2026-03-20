import React, { useEffect } from "react";
import { Flex, Spinner } from "@chakra-ui/react";
import { useRouter } from "next/router";
import Navbar from "../components/navbar";
import HomePageTab from "../components/home-page-tab";
import { useAuth } from "../context/AuthContext";

const HomePage = () => {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/type");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <Flex minH="100vh" bg="gray.900" justify="center" align="center">
        <Spinner color="teal.300" size="xl" />
      </Flex>
    );
  }

  if (user) {
    return (
      <Flex minH="100vh" bg="gray.900" justify="center" align="center">
        <Spinner color="teal.300" size="xl" />
      </Flex>
    );
  }

  return (
    <>
      <Navbar />
      <HomePageTab />
    </>
  );
};

export default HomePage;
