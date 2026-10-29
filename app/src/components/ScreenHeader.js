import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "../theme";

export default function ScreenHeader({ title, onBack }) {
  return (
    <View style={styles.row}>
      {onBack ? (
        <Pressable onPress={onBack} hitSlop={8}>
          <Text style={styles.back}>Back</Text>
        </Pressable>
      ) : (
        <View style={styles.side} />
      )}
      <Text style={styles.title}>{title}</Text>
      <View style={styles.side} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 28,
    marginBottom: 12,
  },
  side: {
    width: 56,
  },
  back: {
    width: 56,
    color: colors.green,
    fontWeight: "700",
  },
  title: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "800",
    color: colors.greenDark,
  },
});
