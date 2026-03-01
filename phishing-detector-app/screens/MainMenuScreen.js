import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { theme } from "../src/theme";
import { Card } from "../src/ui";

function MenuButton({ title, subtitle, onPress }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}>
      <Card style={{ marginTop: 12 }}>
        <Text style={{ color: theme.text, fontSize: 16, fontWeight: "900" }}>
          {title}
        </Text>
        <Text style={{ color: theme.muted, marginTop: 6, lineHeight: 18 }}>
          {subtitle}
        </Text>
      </Card>
    </Pressable>
  );
}

export default function MainMenuScreen({ navigation }) {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.bg }} contentContainerStyle={{ padding: 16, paddingBottom: 28 }}>
      <Text style={{ color: theme.muted, fontSize: 12, letterSpacing: 0.6 }}>
        CounterScam
      </Text>
      <Text style={{ color: theme.text, fontSize: 28, fontWeight: "900", marginTop: 6 }}>
        Main Menu
      </Text>
      <Text style={{ color: theme.muted, marginTop: 6, lineHeight: 18 }}>
        Choose what you want to do.
      </Text>

      <MenuButton
        title="Scan a Link"
        subtitle="Check a URL for phishing patterns and risky domains."
        onPress={() => navigation.navigate("UrlScan")}
      />

      <MenuButton
        title="Scan a Message"
        subtitle="Detect scam language and suspicious intent in SMS/WhatsApp messages."
        onPress={() => navigation.navigate("MessageScan")}
      />

      <MenuButton
        title="History"
        subtitle="View your latest checks (local history)."
        onPress={() => navigation.navigate("History")}
      />

      <MenuButton
        title="Report a Scam"
        subtitle="Submit a suspicious link or message for review."
        onPress={() => navigation.navigate("Report")}
      />
    </ScrollView>
  );
}