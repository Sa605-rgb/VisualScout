import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import ScreenHeader from "../components/ScreenHeader";
import { api } from "../services/api";
import { errorMessage } from "../services/errors";
import { colors } from "../theme";

export default function ProfileScreen({ onLogout }) {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/auth/me")
      .then((res) => setUser(res.data))
      .catch((err) => {
        if (err?.response?.status === 401) onLogout();
        else setError(errorMessage(err));
      });
  }, [onLogout]);

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Profile" />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {!user && !error ? <ActivityIndicator color={colors.green} /> : null}
      {user ? (
        <View style={styles.card}>
          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>{user.name}</Text>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{user.email}</Text>
          <Pressable style={styles.button} onPress={onLogout}>
            <Text style={styles.buttonText}>Logout</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
  },
  label: {
    color: colors.muted,
    marginTop: 8,
  },
  value: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },
  button: {
    marginTop: 20,
    backgroundColor: colors.green,
    borderRadius: 12,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
  },
  error: {
    color: colors.danger,
  },
});
