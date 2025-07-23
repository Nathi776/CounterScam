import React, { useState } from 'react';
import { Text, View, TextInput, ActivityIndicator } from 'react-native';
import { checkUrl, checkMessage } from '../api';
import styles from '../styles';
import CustomButton from '../components/CustomButton';
import ModalBox from '../components/ModalBox';

import { saveToHistory } from '../utils/storage';


export default function App() {
  const [input, setInput]  = useState('');
  const [mode, setMode] = useState('url');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [popupVisible, setPopupVisible] = useState(false);

  const handleCheck = async () => {
    if (!input) {
      setResult('Please enter a value to check.');
      setPopupVisible(true);
      return;
    }

    setLoading(true);

    try {
      const response = mode === 'url'
        ? await checkUrl(input)
        : await checkMessage(input);

      const flagged = response.data.flagged;
      const reason = response.data.reason;

      setResult(flagged
        ? `⚠️ Suspicious Content\n\n${reason}`
        : `✅ Safe Content\n\n${reason}`);
      
      setResult(resultText);

      await saveToHistory({
        type: mode,            // 'url' or 'message'
        input,                 // user's input
        flagged,               // true/false from backend
        reason                 // reason from backend
      });

    } catch (error) {
      console.error(error);
      setResult('❌ Unable to connect to backend.');
    } finally {
      setLoading(false);
      setPopupVisible(true);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Phishing Detector</Text>

      <CustomButton
        title={`Switch to ${mode === 'url' ? 'Message' : 'URL'} Mode`}
        onPress={() => setMode(mode === 'url' ? 'message' : 'url')}
        disabled={loading}
      />

      <TextInput
        style={styles.input}
        placeholder={mode === 'url' ? 'Enter URL' : 'Enter Message'}
        value={input}
        onChangeText={setInput}
        editable={!loading}
      />

      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <CustomButton title="Check" onPress={handleCheck} />
      )}

      <ModalBox
        visible={popupVisible}
        message={result}
        onClose={() => setPopupVisible(false)}
      />
    </View>
  );
}




