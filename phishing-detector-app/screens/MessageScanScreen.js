import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import api from "../api";
import { theme } from "../src/theme";
import { Card, PrimaryButton, VerdictPill } from "../src/ui";

export default function MessageScanScreen() {
  const [message, setMessage] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canScan = useMemo(
    () => message.trim().length >= 10 && !loading,
    [message, loading]
  );

  const onScan = async () => {
    setError("");
    setResult(null);
    setLoading(true);

    try {
      // IMPORTANT: adjust endpoint name if your backend is different
      const res = await api.post("/check_message/", { message: message.trim() });
      setResult(res.data);

      // local history (optional)
      try {
        const payload = {
          id: Date.now(),
          created_at: new Date().toISOString(),
          type: "message",
          value: message.trim(),
          verdict: res.data.verdict,
          risk_score: res.data.risk_score,
          reasons: res.data.reasons,
        };
        global.__COUNTERSCAM_HISTORY__ = global.__COUNTERSCAM_HISTORY__ || [];
        global.__COUNTERSCAM_HISTORY__.unshift(payload);
        global.__COUNTERSCAM_HISTORY__ = global.__COUNTERSCAM_HISTORY__.slice(0, 30);
      } catch {}
    } catch (e) {
      setError("Could not scan message. Check your API and try again.");
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
      <Text style={{ color: theme.muted, fontSize: 12, letterSpacing: 0.6 }}>
        CounterScam
      </Text>
      <Text style={{ color: theme.text, fontSize: 28, fontWeight: "900", marginTop: 6 }}>
        Scan a message
      </Text>
      <Text style={{ color: theme.muted, marginTop: 6, lineHeight: 18 }}>
        Paste an SMS/WhatsApp message to detect scam language and phishing intent.
      </Text>

      <Card style={{ marginTop: 14 }}>
        <Text style={{ color: theme.muted, fontSize: 12 }}>Message</Text>

        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="Paste the message here…"
          placeholderTextColor="rgba(229,231,235,0.35)"
          multiline
          style={{
            marginTop: 10,
            minHeight: 140,
            backgroundColor: "rgba(255,255,255,0.06)",
            borderColor: theme.border,
            borderWidth: 1,
            borderRadius: 16,
            paddingHorizontal: 12,
            paddingVertical: 12,
            color: theme.text,
            fontSize: 14,
            textAlignVertical: "top",
          }}
        />

        <View style={{ marginTop: 12 }}>
          <PrimaryButton
            title={loading ? "Scanning..." : "Scan Message"}
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
        </Card>
      ) : null}
    </ScrollView>
  );
}