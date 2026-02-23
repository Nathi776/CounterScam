import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { theme } from "../src/theme";
import { Card, VerdictPill } from "../src/ui";

export default function HistoryScreen() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    // Simple local history for polish (no extra libs)
    const list = global.__COUNTERSCAM_HISTORY__ || [];
    setItems(list);
  }, []);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.bg }}
      contentContainerStyle={{ padding: 16, paddingBottom: 26 }}
    >
      <Text style={{ color: theme.text, fontSize: 26, fontWeight: "900" }}>
        History
      </Text>
      <Text style={{ color: theme.muted, marginTop: 6 }}>
        Your latest scans (stored locally).
      </Text>

      {items.length === 0 ? (
        <Card style={{ marginTop: 14 }}>
          <Text style={{ color: theme.text, fontWeight: "900", fontSize: 16 }}>
            No scans yet
          </Text>
          <Text style={{ color: theme.muted, marginTop: 6, lineHeight: 19 }}>
            Go back to Home and scan a link. Your latest 30 checks will appear here.
          </Text>
        </Card>
      ) : (
        <View style={{ marginTop: 14, gap: 10 }}>
          {items.map((it) => (
            <Card key={it.id}>
              <Text style={{ color: theme.muted, fontSize: 12 }}>
                {it.created_at ? new Date(it.created_at).toLocaleString() : ""}
              </Text>

              <Text
                style={{
                  color: theme.text,
                  fontWeight: "900",
                  marginTop: 8,
                }}
                numberOfLines={1}
              >
                {it.value}
              </Text>

              <View style={{ marginTop: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <VerdictPill verdict={it.verdict} />
                <Text style={{ color: theme.text, fontWeight: "900" }}>
                  {it.risk_score}
                </Text>
              </View>

              {Array.isArray(it.reasons) && it.reasons.length > 0 ? (
                <Text style={{ color: theme.muted, marginTop: 10, lineHeight: 18 }}>
                  {it.reasons.join(" • ")}
                </Text>
              ) : null}
            </Card>
          ))}
        </View>
      )}

      <Pressable
        onPress={() => {
          global.__COUNTERSCAM_HISTORY__ = [];
          setItems([]);
        }}
        style={({ pressed }) => ({
          marginTop: 16,
          paddingVertical: 12,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: theme.border,
          backgroundColor: pressed ? "rgba(255,255,255,0.05)" : "transparent",
          alignItems: "center",
        })}
      >
        <Text style={{ color: theme.muted, fontWeight: "800" }}>Clear history</Text>
      </Pressable>
    </ScrollView>
  );
}