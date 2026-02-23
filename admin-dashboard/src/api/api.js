import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000"
});

// Attach JWT token automatically
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});


API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response && err.response.status === 401) {
      localStorage.removeItem("token");
      window.location.reload(); // sends user back to login
    }
    return Promise.reject(err);
  }
);

// Named exports
export const getStats = () =>
  API.get("/admin/stats");

export const getRecentChecks = () =>
  API.get("/admin/recent-checks");

export const getAnalytics = () =>
  API.get("/admin/analytics");
