import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import StockCard from "../components/StockCard";
import { shortDate } from "../format";
import { api } from "../services/api";
import { errorMessage } from "../services/errors";
import { colors } from "../theme";

export default function DashboardScreen({ onLogout, onScan }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/dashboard");
      setData(response.data);
      setError("");
    } catch (err) {
      if (err?.response?.status === 401) onLogout();
      else setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [onLogout]);

  useEffect(() => {
    load();
  }, [load]);

  const alerts = data?.alerts || [];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.kicker}>VisualScout</Text>
      <Text style={styles.title}>Shelf stock</Text>
      <Text style={styles.sub}>
        {data?.scanned
          ? `Last photo ${shortDate(data.scanned_at)}`
          : "Take one shelf photo to count what is running low."}
      </Text>

      <Pressable style={styles.scan} onPress={onScan}>
        <Text style={styles.scanText}>Scan shelf</Text>
      </Pressable>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {loading ? <ActivityIndicator color={colors.green} /> : null}

      {alerts.length ? (
        <View style={styles.alert}>
          <Text style={styles.alertTitle}>{alerts.length} low stock</Text>
          <Text style={styles.alertBody}>
            {alerts.map((item) => `${item.name} ${item.count}/${item.min_count}`).join("  ·  ")}
          </Text>
        </View>
      ) : null}

      {(data?.products || []).map((item) => (
        <StockCard key={item.id} item={item} />
      ))}
      <Pressable onPress={load}>
        <Text style={styles.refresh}>Refresh</Text>
      </Pressable>
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
  kicker: {
    color: colors.green,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: colors.greenDark,
  },
  sub: {
    color: colors.muted,
    marginTop: 4,
    marginBottom: 14,
  },
  scan: {
    backgroundColor: colors.green,
    borderRadius: 14,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  scanText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
  },
  alert: {
    backgroundColor: colors.lowBg,
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },
  alertTitle: {
    color: colors.low,
    fontWeight: "800",
  },
  alertBody: {
    color: colors.text,
    marginTop: 4,
  },
  refresh: {
    textAlign: "center",
    color: colors.green,
    fontWeight: "700",
    marginTop: 8,
  },
  error: {
    color: colors.danger,
    marginBottom: 8,
  },
});
