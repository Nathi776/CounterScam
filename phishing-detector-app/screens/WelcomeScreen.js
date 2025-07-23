import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import styles from '../styles';

export default function WelcomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>🚀 Welcome to CounterScam!</Text>
      <Text style={styles.subheading}>Protect yourself from phishing and scams.</Text>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => navigation.replace('MainMenu')}
      >
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
}
