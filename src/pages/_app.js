import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { useEffect } from "react";
import { AuthProvider } from "../context/AuthContext";

const theme = extendTheme({
  config: {
    initialColorMode: "dark",
    useSystemColorMode: false,
  },
});

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // Optional: set body background for immersive UI
    document.body.style.background = "var(--chakra-colors-gray-900)";
  }, []);

  return (
    <ChakraProvider theme={theme}>
      <AuthProvider>
        {/* Removed ColorModeScript to force dark mode */}
        <Component {...pageProps} />
      </AuthProvider>
    </ChakraProvider>
  );
}

export default MyApp;
