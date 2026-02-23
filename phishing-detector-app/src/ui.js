import React from "react";
import { Pressable, Text, View } from "react-native";
import { theme } from "./theme";

export function Card({ children, style }) {
  return (
    <View
      style={[
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
          borderWidth: 1,
          borderRadius: 18,
          padding: 14,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function PrimaryButton({ title, onPress, disabled }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        {
          backgroundColor: disabled
            ? "rgba(124,58,237,0.35)"
            : pressed
            ? "rgba(124,58,237,0.75)"
            : theme.primary,
          paddingVertical: 14,
          borderRadius: 16,
          alignItems: "center",
        },
      ]}
    >
      <Text style={{ color: "white", fontWeight: "800", fontSize: 15 }}>
        {title}
      </Text>
    </Pressable>
  );
}

export function VerdictPill({ verdict }) {
  const v = (verdict || "").toLowerCase();

  const styles =
    v === "phishing"
      ? { bg: "rgba(239,68,68,0.18)", border: "rgba(239,68,68,0.55)", text: theme.danger }
      : v === "suspicious"
      ? { bg: "rgba(245,158,11,0.18)", border: "rgba(245,158,11,0.55)", text: theme.warn }
      : { bg: "rgba(34,197,94,0.16)", border: "rgba(34,197,94,0.55)", text: theme.ok };

  return (
    <View
      style={{
        alignSelf: "flex-start",
        backgroundColor: styles.bg,
        borderColor: styles.border,
        borderWidth: 1,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 999,
      }}
    >
      <Text style={{ color: styles.text, fontWeight: "900", textTransform: "capitalize" }}>
        {verdict || "safe"}
      </Text>
    </View>
  );
}