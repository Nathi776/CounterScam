import React, { useMemo, useState } from "react";
import { View, Text, TextInput, ScrollView } from "react-native";
import api from "../api";
import { theme } from "../src/theme";
import { Card, PrimaryButton } from "../src/ui";

export default function ReportScreen() {
  const [type, setType] = useState("url"); // "url" | "message"
  const [value, setValue] = useState("");
  const [details, setDetails] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(() => value.trim().length > 6 && !loading, [value, loading]);

  const submit = async () => {
    setStatus("");
    setLoading(true);
    try {
      // Adjust endpoint if needed (check /docs)
      await api.post("/report/", {
        type,
        value: value.trim(),
        details: details.trim(),
      });
      setStatus("✅ Report submitted. Thank you!");
      setValue("");
      setDetails("");
    } catch (e) {
      setStatus("❌ Could not submit report. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.bg }} contentContainerStyle={{ padding: 16, paddingBottom: 28 }}>
      <Text style={{ color: theme.text, fontSize: 28, fontWeight: "900" }}>
        Report a scam
      </Text>
      <Text style={{ color: theme.muted, marginTop: 6, lineHeight: 18 }}>
        Help improve detection by submitting suspicious content.
      </Text>

      <Card style={{ marginTop: 14 }}>
        <Text style={{ color: theme.muted, fontSize: 12 }}>Type</Text>

        <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
          <PrimaryButton
            title="URL"
            onPress={() => setType("url")}
            disabled={type === "url"}
          />
          <PrimaryButton
            title="Message"
            onPress={() => setType("message")}
            disabled={type === "message"}
          />
        </View>

        <Text style={{ color: theme.muted, fontSize: 12, marginTop: 12 }}>
          {type === "url" ? "URL" : "Message"}
        </Text>

        <TextInput
          value={value}
          onChangeText={setValue}
          placeholder={type === "url" ? "Paste suspicious link…" : "Paste message…"}
          placeholderTextColor="rgba(229,231,235,0.35)"
          multiline={type === "message"}
          style={{
            marginTop: 10,
            minHeight: type === "message" ? 120 : 48,
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

        <Text style={{ color: theme.muted, fontSize: 12, marginTop: 12 }}>
          Extra details (optional)
        </Text>

        <TextInput
          value={details}
          onChangeText={setDetails}
          placeholder="Where did you receive it? What happened?"
          placeholderTextColor="rgba(229,231,235,0.35)"
          multiline
          style={{
            marginTop: 10,
            minHeight: 110,
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
            title={loading ? "Submitting..." : "Submit report"}
            onPress={submit}
            disabled={!canSubmit}
          />
        </View>

        {status ? (
          <Text style={{ color: theme.muted, marginTop: 12, fontWeight: "800" }}>
            {status}
          </Text>
        ) : null}
      </Card>
    </ScrollView>
  );
}