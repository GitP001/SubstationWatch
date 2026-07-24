import { StyleSheet, Text, View } from "react-native";

const STATUS_CONFIG = {
  ALARM: {
    backgroundColor: "#fee2e2",
    textColor: "#dc2626",
  },
  WARNING: {
    backgroundColor: "#ffedd5",
    textColor: "#d97706",
  },
  NORMAL: {
    backgroundColor: "#dcfce7",
    textColor: "#16a34a",
  },
};

export default function StatusBadge({ status }) {
  const config =
    STATUS_CONFIG[status] ?? STATUS_CONFIG.NORMAL;

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: config.backgroundColor,
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: config.textColor,
          },
        ]}
      >
        {status}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: "flex-end",
    borderRadius: 999,
  },

  text: {
    fontSize: 12,
    fontWeight: "700",
  },
});