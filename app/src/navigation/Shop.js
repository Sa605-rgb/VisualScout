import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "../theme";
import DashboardScreen from "../screens/DashboardScreen";
import HistoryScreen from "../screens/HistoryScreen";
import ProfileScreen from "../screens/ProfileScreen";
import ScanScreen from "../screens/ScanScreen";

const TABS = [
  { id: "dashboard", label: "Stock" },
  { id: "scan", label: "Scan" },
  { id: "history", label: "History" },
  { id: "profile", label: "Profile" },
];

export default function Shop({ onLogout }) {
  const [tab, setTab] = useState("dashboard");

  return (
    <View style={styles.screen}>
      <View style={styles.body}>
        {tab === "dashboard" ? (
          <DashboardScreen onLogout={onLogout} onScan={() => setTab("scan")} />
        ) : null}
        {tab === "scan" ? <ScanScreen onLogout={onLogout} onDone={() => setTab("dashboard")} /> : null}
        {tab === "history" ? <HistoryScreen onLogout={onLogout} /> : null}
        {tab === "profile" ? <ProfileScreen onLogout={onLogout} /> : null}
      </View>
      <View style={styles.tabs}>
        {TABS.map((item) => {
          const active = item.id === tab;
          return (
            <Pressable key={item.id} style={styles.tab} onPress={() => setTab(item.id)}>
              <Text style={[styles.tabText, active && styles.tabTextActive]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  body: {
    flex: 1,
  },
  tabs: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: colors.line,
    backgroundColor: colors.card,
    paddingBottom: 10,
    paddingTop: 8,
  },
  tab: {
    flex: 1,
    alignItems: "center",
  },
  tabText: {
    color: colors.muted,
    fontWeight: "700",
  },
  tabTextActive: {
    color: colors.green,
  },
});
