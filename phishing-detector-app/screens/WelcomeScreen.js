import React from "react";
import { View, Text } from "react-native";
import { theme } from "../src/theme";
import { PrimaryButton } from "../src/ui";

export default function WelcomeScreen({ navigation }) {
  return (
    <View style={{ flex: 1, backgroundColor: theme.bg, padding: 16, justifyContent: "center" }}>
      <Text style={{ color: theme.muted, fontSize: 12, letterSpacing: 0.6 }}>
        CounterScam
      </Text>

      <Text style={{ color: theme.text, fontSize: 34, fontWeight: "900", marginTop: 10 }}>
        Protect yourself from scams.
      </Text>

      <Text style={{ color: theme.muted, marginTop: 10, lineHeight: 20 }}>
        Scan suspicious links and messages. Get a risk score, verdict, and clear reasons.
      </Text>

      <View style={{ marginTop: 20 }}>
        <PrimaryButton title="Get Started" onPress={() => navigation.replace("MainMenu")} />
      </View>
    </View>
  );
}