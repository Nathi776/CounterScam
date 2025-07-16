import axios from 'axios';
import React, { useState} from 'react';
import { StyleSheet, Text, View, TextInput, Alert } from 'react-native';

export default function App() {
  const [input, setInput] = useState('');
  const [type, setType] = useState('url');

  const checkContent = async () => {
    if (input){
      Alert.alert("Input required", "Please enter a URL or message to check.");
      return;
    }

    try {
      const endpoint = type === 'url' ? 'check-url' : 'check-message';
      const data = type === 'url' ? { url: input } : { message: input };

      const response = await axios.post(
        `http://192.168.1.10:8000${endpoint}`,
        data
      );

      const flagged = response.data.flagged ? ' Suspicious!' : ' Safe';
      const reason = response.data.reason;

      Alert.alert(flagged, reason);

    }catch (error) {
      Alert.alert("Error", "Failed to connect to backend.");
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Phishing Detector</Text>

      <Button title={`Switch to ${type === 'url' ? 'Message' : 'URL'} Mode`} onPress={() => setType(type === 'url' ? 'message' : 'url')} />

      <TextInput
        style={styles.input}
        placeholder={type === 'url' ? 'Enter URL' : 'Enter Message'}
        value={input}
        onChangeText={setInput}
      />

      <Button title="Check" onPress={checkContent} />
    </View>
  );

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1, 
    borderColor: '#ccc', 
    padding: 10, 
    marginVertical: 20, 
    borderRadius: 5,
  },
});
