
import axios from 'axios';

// For Expo / real devices, "localhost" points to the phone itself.
// Set EXPO_PUBLIC_API_BASE in phishing-detector-app/.env, e.g.
//   EXPO_PUBLIC_API_BASE=http://192.168.x.x:8000
const API_BASE = process.env.EXPO_PUBLIC_API_BASE || 'http://localhost:8000';


export const checkUrl = (url) => {
  return axios.post(`${API_BASE}/check_url/`, { url });
};

export const checkMessage = (message) => {
  return axios.post(`${API_BASE}/check_message/`, { message });
};
