import React, { useState } from 'react';
import { View, Text, TextInput, Button, Picker, Alert } from 'react-native';
import styles from '../styles';
import axios from 'axios';

export default function ReportScreen() {
  const [type, setType] = useState('url');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReport = async () => {
    if (!content) {
      Alert.alert('Please enter content to report.');
      return;
    }

    setLoading(true);
    try {
      await axios.post('http://127.0.0.1:8000/report/', { content, type });
      Alert.alert('Report submitted successfully.');
      setContent('');
    } catch (error) {
      console.error(error);
      Alert.alert('Failed to submit report.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Report Suspicious Content</Text>

      <Picker
        selectedValue={type}
        style={{ height: 50, width: '100%' }}
        onValueChange={(itemValue) => setType(itemValue)}
      >
        <Picker.Item label="URL" value="url" />
        <Picker.Item label="Message" value="message" />
        <Picker.Item label="Other" value="other" />
      </Picker>

      <TextInput
        style={styles.input}
        placeholder={`Enter ${type}`}
        value={content}
        onChangeText={setContent}
        editable={!loading}
      />

      <Button title="Submit Report" onPress={handleReport} disabled={loading} />
    </View>
  );
}
