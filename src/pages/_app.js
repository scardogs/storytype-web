import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { useEffect } from "react";
import { AuthProvider } from "../context/AuthContext";
import { Analytics } from "@vercel/analytics/next";
const theme = extendTheme({
  config: {
    initialColorMode: "dark",
    useSystemColorMode: false,
  },
  styles: {
    global: {
      body: {
        bg: "gray.900",
        color: "gray.100",
      },
    },
  },
});

// Force dark mode - prevents useColorModeValue from ever picking light values
const forceDarkMode = {
  get: () => "dark",
  set: () => {},
  type: "cookie",
};

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    document.body.style.background = "var(--chakra-colors-gray-900)";
    localStorage.setItem("chakra-ui-color-mode", "dark");
  }, []);

  return (
    <ChakraProvider theme={theme} colorModeManager={forceDarkMode}>
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
      <Analytics />
    </ChakraProvider>
  );
}

export default MyApp;
