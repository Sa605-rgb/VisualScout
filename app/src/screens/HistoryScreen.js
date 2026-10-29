import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";

import ScreenHeader from "../components/ScreenHeader";
import { shortDate } from "../format";
import { api } from "../services/api";
import { errorMessage } from "../services/errors";
import { colors } from "../theme";

export default function HistoryScreen({ onLogout }) {
  const [scans, setScans] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const { data } = await api.get("/scans");
      setScans(data);
    } catch (err) {
      if (err?.response?.status === 401) onLogout();
      else setError(errorMessage(err));
    }
  }, [onLogout]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <View style={styles.screen}>
      <ScreenHeader title="History" />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {!scans ? <ActivityIndicator color={colors.green} /> : null}
      <FlatList
        data={scans || []}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={scans ? <Text style={styles.empty}>No scans yet.</Text> : null}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.top}>
              <Text style={styles.date}>{shortDate(item.created_at)}</Text>
              <Text style={[styles.badge, item.low_count ? styles.badgeLow : styles.badgeOk]}>
                {item.low_count ? `${item.low_count} low` : "OK"}
              </Text>
            </View>
            <Text style={styles.summary}>{item.summary}</Text>
          </View>
        )}
      />
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
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  top: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  date: {
    fontWeight: "800",
    color: colors.text,
  },
  summary: {
    marginTop: 6,
    color: colors.muted,
  },
  badge: {
    fontWeight: "800",
    fontSize: 12,
  },
  badgeLow: {
    color: colors.low,
  },
  badgeOk: {
    color: colors.ok,
  },
  empty: {
    textAlign: "center",
    color: colors.muted,
    marginTop: 24,
  },
  error: {
    color: colors.danger,
    marginBottom: 8,
  },
});
