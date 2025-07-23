import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import styles from '../styles';

export default function MainMenuScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Main Menu</Text>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.buttonText}>🛡️ Scan URL / Message</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => navigation.navigate('Report')}
      >
        <Text style={styles.buttonText}>🚨 Report Suspicious Content</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => navigation.navigate('History')}
      >
        <Text style={styles.buttonText}>📜 View History</Text>
      </TouchableOpacity>
    </View>
  );
}
