import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '../styles';

export default function HistoryScreen() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('@scan_history');
      if (jsonValue != null) {
        setHistory(JSON.parse(jsonValue));
      }
    } catch (e) {
      Alert.alert('Failed to load history.');
    }
  };

  const clearHistory = async () => {
    await AsyncStorage.removeItem('@scan_history');
    setHistory([]);
    Alert.alert('History cleared.');
  };

  const renderItem = ({ item }) => (
    <View style={styles.historyItem}>
      <Text style={styles.historyText}>{item.type.toUpperCase()}:</Text>
      <Text>{item.input}</Text>
      <Text style={{ color: item.flagged ? 'red' : 'green', fontWeight: 'bold' }}>
        {item.flagged ? '⚠️ Suspicious' : '✅ Safe'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Scan History</Text>

      <FlatList
        data={history}
        keyExtractor={(_, index) => index.toString()}
        renderItem={renderItem}
        ListEmptyComponent={<Text>No scan history found.</Text>}
      />

      <TouchableOpacity style={styles.clearButton} onPress={clearHistory}>
        <Text style={styles.clearButtonText}>Clear History</Text>
      </TouchableOpacity>
    </View>
  );
}
