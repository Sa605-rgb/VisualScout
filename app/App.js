import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";

import Shop from "./src/navigation/Shop";
import LoginScreen from "./src/screens/LoginScreen";
import { loadToken, saveToken } from "./src/services/api";
import { colors } from "./src/theme";

export default function App() {
  const [ready, setReady] = useState(false);
  const [token, setToken] = useState(null);

  useEffect(() => {
    loadToken()
      .then((value) => setToken(value))
      .finally(() => setReady(true));
  }, []);

  const logout = useCallback(async () => {
    await saveToken(null);
    setToken(null);
  }, []);

  if (!ready) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.green} />
      </View>
    );
  }

  return (
    <View style={styles.app}>
      <StatusBar style="dark" />
      {token ? <Shop onLogout={logout} /> : <LoginScreen onLoggedIn={setToken} />}
    </View>
  );
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bg,
  },
});
