import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import WelcomeScreen from './screens/WelcomeScreen';
import MainMenuScreen from './screens/MainMenuScreen';
import ScanUrlScreen from './screens/ScanUrlScreen';
import ReportScreen from './screens/ReportScreen';
import HistoryScreen from './screens/HistoryScreen';
import MessageScanScreen from './screens/MessageScanScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Welcome" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="MainMenu" component={MainMenuScreen} />
        <Stack.Screen name="UrlScan" component={ScanUrlScreen} />
        <Stack.Screen name="Report" component={ReportScreen} />
        <Stack.Screen name="History" component={HistoryScreen} />
        <Stack.Screen name="MessageScan" component={MessageScanScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
