import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "./globals.css";
import QueryProvider from "@/providers/QueryProvider";
import ErrorBoundary from "../components/ErrorBoundary";
import { useAtomValue } from "jotai";
import { isDarkModeAtom } from "@/store/theme";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RootLayout() {
  const isDarkMode = useAtomValue(isDarkModeAtom);

  return (
    <ErrorBoundary>
      <QueryProvider>
        <SafeAreaView
          style={{ flex: 1 }}
          className={isDarkMode ? "bg-black" : "bg-white"}
        >
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          </Stack>
          <StatusBar style={isDarkMode ? "light" : "dark"} />
        </SafeAreaView>
      </QueryProvider>
    </ErrorBoundary>
  );
}
