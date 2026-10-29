import { StyleSheet, Text, View } from "react-native";

import { colors } from "../theme";

export default function StockCard({ item }) {
  const low = item.status === "Low";
  const ok = item.status === "OK";
  const countLabel = item.count == null ? "No scan yet" : `${item.count} seen`;

  return (
    <View style={[styles.card, low && styles.lowCard]}>
      <View style={styles.top}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={[styles.pill, low && styles.pillLow, ok && styles.pillOk]}>{item.status}</Text>
      </View>
      <Text style={styles.count}>{countLabel}</Text>
      <Text style={styles.min}>Minimum {item.min_count}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  lowCard: {
    backgroundColor: colors.lowBg,
  },
  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  name: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.text,
  },
  count: {
    marginTop: 8,
    fontSize: 22,
    fontWeight: "800",
    color: colors.greenDark,
  },
  min: {
    marginTop: 2,
    color: colors.muted,
  },
  pill: {
    overflow: "hidden",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: colors.line,
    color: colors.muted,
    fontWeight: "700",
    fontSize: 12,
  },
  pillLow: {
    backgroundColor: "#F5D0A8",
    color: colors.low,
  },
  pillOk: {
    backgroundColor: colors.okBg,
    color: colors.ok,
  },
});
