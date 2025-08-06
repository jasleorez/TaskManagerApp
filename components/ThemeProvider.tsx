import { useAtomValue } from "jotai";
import { isDarkModeAtom } from "@/store/theme";
import { View } from "react-native";

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const isDarkMode = useAtomValue(isDarkModeAtom);

  return (
    <View className={isDarkMode ? "flex-1 dark bg-black" : "flex-1 bg-white"}>
      {children}
    </View>
  );
}
