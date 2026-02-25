import axios from 'axios';

// For Expo / real devices, "localhost" points to the phone itself.
// Set EXPO_PUBLIC_API_BASE_URL in phishing-detector-app/.env, e.g.
//   EXPO_PUBLIC_API_BASE_URL=http://192.168.x.x:8000
const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://172.16.12.96:8000';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

export default api;

export const checkUrl = (url) => api.post('/check_url/', { url });
export const checkMessage = (message) => api.post('/check_message/', { message });
