import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Pressable,
} from "react-native";
import api from "../api"; // <-- your root api.js
import { theme } from "../src/theme";
import { Card, PrimaryButton, VerdictPill } from "../src/ui";

export default function HomeScreen({ navigation }) {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canScan = useMemo(() => url.trim().length > 6 && !loading, [url, loading]);

  const onScan = async () => {
    setError("");
    setResult(null);
    setLoading(true);

    try {
      const res = await api.post("/check_url/", { url: url.trim() });
      setResult(res.data);

      // Optional: keep a lightweight local history (no extra libraries)
      // If your HistoryScreen already pulls from backend, remove this.
      try {
        const payload = {
          id: Date.now(),
          created_at: new Date().toISOString(),
          type: "url",
          value: res.data.url,
          verdict: res.data.verdict,
          risk_score: res.data.risk_score,
          reasons: res.data.reasons,
        };
        global.__COUNTERSCAM_HISTORY__ = global.__COUNTERSCAM_HISTORY__ || [];
        global.__COUNTERSCAM_HISTORY__.unshift(payload);
        global.__COUNTERSCAM_HISTORY__ = global.__COUNTERSCAM_HISTORY__.slice(0, 30);
      } catch {}
    } catch (e) {
      setError("Could not scan. Check your API URL and internet connection.");
    } finally {
      setLoading(false);
    }
  };

  const reasonsText =
    result && Array.isArray(result.reasons) ? result.reasons.join(" • ") : "";

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.bg }}
      contentContainerStyle={{ padding: 16, paddingBottom: 28 }}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header */}
      <Text style={{ color: theme.muted, fontSize: 12, letterSpacing: 0.6 }}>
        CounterScam
      </Text>
      <Text style={{ color: theme.text, fontSize: 28, fontWeight: "900", marginTop: 6 }}>
        Scan a link
      </Text>
      <Text style={{ color: theme.muted, marginTop: 6, lineHeight: 18 }}>
        Paste a URL to detect phishing, risky domains, and scam signals.
      </Text>

      {/* Quick actions */}
      <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
        <Pressable
          onPress={() => navigation.navigate("History")}
          style={({ pressed }) => ({
            flex: 1,
            paddingVertical: 12,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: theme.border,
            backgroundColor: pressed ? "rgba(255,255,255,0.05)" : theme.card,
            alignItems: "center",
          })}
        >
          <Text style={{ color: theme.text, fontWeight: "800" }}>History</Text>
        </Pressable>

        <Pressable
          onPress={() => navigation.navigate("Report")}
          style={({ pressed }) => ({
            flex: 1,
            paddingVertical: 12,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: theme.border,
            backgroundColor: pressed ? "rgba(255,255,255,0.05)" : theme.card,
            alignItems: "center",
          })}
        >
          <Text style={{ color: theme.text, fontWeight: "800" }}>Report Scam</Text>
        </Pressable>
      </View>

      {/* Input card */}
      <Card style={{ marginTop: 14 }}>
        <Text style={{ color: theme.muted, fontSize: 12 }}>URL</Text>

        <TextInput
          value={url}
          onChangeText={setUrl}
          placeholder="e.g. http://confirm-account-now.xyz"
          placeholderTextColor="rgba(229,231,235,0.35)"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          style={{
            marginTop: 10,
            backgroundColor: "rgba(255,255,255,0.06)",
            borderColor: theme.border,
            borderWidth: 1,
            borderRadius: 16,
            paddingHorizontal: 12,
            paddingVertical: 12,
            color: theme.text,
            fontSize: 14,
          }}
        />

        <View style={{ marginTop: 12 }}>
          <PrimaryButton
            title={loading ? "Scanning..." : "Scan URL"}
            onPress={onScan}
            disabled={!canScan}
          />
        </View>

        {loading ? (
          <View style={{ marginTop: 12, flexDirection: "row", alignItems: "center", gap: 10 }}>
            <ActivityIndicator />
            <Text style={{ color: theme.muted }}>Running checks…</Text>
          </View>
        ) : null}

        {error ? (
          <Text style={{ color: theme.danger, marginTop: 12, fontWeight: "800" }}>
            {error}
          </Text>
        ) : null}
      </Card>

      {/* Result */}
      {result ? (
        <Card style={{ marginTop: 14 }}>
          <Text style={{ color: theme.muted, fontSize: 12 }}>Result</Text>

          <View style={{ marginTop: 10 }}>
            <VerdictPill verdict={result.verdict} />
          </View>

          <Text style={{ color: theme.text, fontSize: 18, fontWeight: "900", marginTop: 12 }}>
            Risk score: {result.risk_score}
          </Text>

          {reasonsText ? (
            <Text style={{ color: theme.muted, marginTop: 10, lineHeight: 19 }}>
              {reasonsText}
            </Text>
          ) : null}

          <View style={{ marginTop: 12, flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ color: theme.muted, fontSize: 12 }}>
              Verdict:{" "}
              <Text style={{ color: theme.text, fontWeight: "900" }}>
                {result.verdict}
              </Text>
            </Text>

            <Text style={{ color: theme.muted, fontSize: 12 }}>
              Confidence:{" "}
              <Text style={{ color: theme.text, fontWeight: "900" }}>
                {String(result.confidence)}
              </Text>
            </Text>
          </View>
        </Card>
      ) : null}

      {/* Footer tip */}
      <Text style={{ color: theme.muted, fontSize: 12, marginTop: 16 }}>
        Tip: scam links often use words like verify, confirm, secure, login, update.
      </Text>
    </ScrollView>
  );
}