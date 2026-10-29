import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";

import StockCard from "../components/StockCard";
import { API_URL, uploadShelf } from "../services/api";
import { errorMessage } from "../services/errors";
import { colors } from "../theme";

async function pick(fromCamera) {
  const permission = fromCamera
    ? await ImagePicker.requestCameraPermissionsAsync()
    : await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new Error("Allow camera or photo access, then try again.");
  }
  const options = { mediaTypes: ["images"], quality: 0.6 };
  const result = fromCamera
    ? await ImagePicker.launchCameraAsync(options)
    : await ImagePicker.launchImageLibraryAsync(options);
  if (result.canceled) return null;
  return result.assets[0];
}

export default function ScanScreen({ onLogout, onDone }) {
  const [scan, setScan] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function choose(fromCamera) {
    setError("");
    try {
      const asset = await pick(fromCamera);
      if (!asset) return;
      setBusy(true);
      const data = await uploadShelf(asset);
      setScan(data);
    } catch (err) {
      if (err?.response?.status === 401) onLogout();
      else setError(err?.response ? errorMessage(err) : err.message || "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Scan a shelf</Text>
      <Text style={styles.sub}>
        Photograph bottles, cups, books, or fruit. The first scan can take a minute while the vision model loads.
      </Text>
      <View style={styles.actions}>
        <Pressable style={styles.primary} onPress={() => choose(true)} disabled={busy}>
          <Text style={styles.primaryText}>Take photo</Text>
        </Pressable>
        <Pressable style={styles.secondary} onPress={() => choose(false)} disabled={busy}>
          <Text style={styles.secondaryText}>Choose photo</Text>
        </Pressable>
      </View>
      {busy ? <ActivityIndicator color={colors.green} style={styles.spinner} /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {scan ? (
        <View>
          {scan.image_url ? (
            <Image source={{ uri: `${API_URL}${scan.image_url}` }} style={styles.photo} />
          ) : null}
          <Text style={styles.summary}>{scan.summary}</Text>
          {scan.alerts.length ? (
            <Text style={styles.alert}>{scan.alerts.length} item(s) below minimum</Text>
          ) : (
            <Text style={styles.ok}>No low-stock alert in this photo.</Text>
          )}
          {scan.products
            .filter((item) => item.status !== "Not in photo")
            .map((item) => (
              <StockCard key={item.id} item={item} />
            ))}
          {scan.other.length ? (
            <Text style={styles.other}>
              Also seen: {scan.other.map((item) => `${item.count} ${item.name}`).join(", ")}
            </Text>
          ) : null}
          <Pressable onPress={onDone}>
            <Text style={styles.link}>Open dashboard</Text>
          </Pressable>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    padding: 16,
    paddingTop: 36,
    paddingBottom: 28,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.greenDark,
  },
  sub: {
    color: colors.muted,
    marginTop: 6,
    marginBottom: 14,
    lineHeight: 20,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
  },
  primary: {
    flex: 1,
    backgroundColor: colors.green,
    borderRadius: 12,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryText: {
    color: "#fff",
    fontWeight: "800",
  },
  secondary: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryText: {
    color: colors.greenDark,
    fontWeight: "800",
  },
  spinner: {
    marginVertical: 16,
  },
  photo: {
    width: "100%",
    height: 200,
    borderRadius: 16,
    backgroundColor: colors.line,
    marginTop: 8,
  },
  summary: {
    marginTop: 12,
    fontWeight: "700",
    color: colors.text,
  },
  alert: {
    color: colors.low,
    fontWeight: "800",
    marginVertical: 8,
  },
  ok: {
    color: colors.ok,
    fontWeight: "700",
    marginVertical: 8,
  },
  other: {
    color: colors.muted,
    marginTop: 4,
  },
  link: {
    textAlign: "center",
    color: colors.green,
    fontWeight: "800",
    marginTop: 14,
  },
  error: {
    color: colors.danger,
    marginTop: 10,
  },
});
