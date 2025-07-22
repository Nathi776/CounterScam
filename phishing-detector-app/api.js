
import axios from 'axios';

const API_BASE = 'http://127.0.0.1:8000';

export const checkUrl = (url) => {
  return axios.post(`${API_BASE}/check_url/`, { url });
};

export const checkMessage = (message) => {
  return axios.post(`${API_BASE}/check_message/`, { message });
};
