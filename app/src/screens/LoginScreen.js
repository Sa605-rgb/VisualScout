import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { API_URL, login, registerAccount } from "../services/api";
import { errorMessage } from "../services/errors";
import { colors } from "../theme";

export default function LoginScreen({ onLoggedIn }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const isSignup = mode === "signup";

  async function submit() {
    if (isSignup && !name.trim()) {
      setError("Enter your name.");
      return;
    }
    if (!email.trim() || !password) {
      setError("Enter email and password.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const token = isSignup
        ? await registerAccount(name, email, password)
        : await login(email, password);
      onLoggedIn(token);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.brand}>VisualScout</Text>
        <Text style={styles.subtitle}>
          {isSignup ? "Create your shop account" : "Check what is running low"}
        </Text>

        {isSignup ? (
          <TextInput
            style={styles.input}
            placeholder="Name"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
        ) : null}

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable style={styles.button} onPress={submit} disabled={busy}>
          {busy ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>{isSignup ? "Create account" : "Login"}</Text>
          )}
        </Pressable>

        <Pressable
          onPress={() => {
            setMode(isSignup ? "login" : "signup");
            setError("");
          }}
        >
          <Text style={styles.link}>
            {isSignup ? "Already have an account? Login" : "New here? Create an account"}
          </Text>
        </Pressable>

        {isSignup ? null : (
          <Text style={styles.hint}>Demo: samavia.demo@example.com / secret12</Text>
        )}
        <Text style={styles.api}>{API_URL}</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
  },
  brand: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.greenDark,
  },
  subtitle: {
    marginTop: 4,
    marginBottom: 16,
    color: colors.muted,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 10,
    fontSize: 16,
    color: colors.text,
  },
  button: {
    backgroundColor: colors.green,
    borderRadius: 12,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  link: {
    textAlign: "center",
    color: colors.green,
    marginTop: 14,
    fontWeight: "600",
  },
  error: {
    color: colors.danger,
    marginBottom: 8,
  },
  hint: {
    marginTop: 14,
    color: colors.muted,
    fontSize: 12,
    textAlign: "center",
  },
  api: {
    marginTop: 6,
    color: colors.muted,
    fontSize: 11,
    textAlign: "center",
  },
});
