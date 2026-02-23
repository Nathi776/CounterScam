import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@scan_history';

export const saveToHistory = async (entry) => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
    const history = jsonValue != null ? JSON.parse(jsonValue) : [];
    history.unshift(entry); // Add new entry to top
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 50))); // Keep max 50 items
  } catch (e) {
    console.error('Failed to save history.', e);
  }
};

export const loadHistory = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('Failed to load history.', e);
    return [];
  }
};

export const clearHistory = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear history.', e);
  }
};
