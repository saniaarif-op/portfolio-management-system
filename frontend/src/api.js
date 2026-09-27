import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("portfolio_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function saveSession(data) {
  localStorage.setItem("portfolio_token", data.token);
  localStorage.setItem("portfolio_user", JSON.stringify(data.user));
}

export function clearSession() {
  localStorage.removeItem("portfolio_token");
  localStorage.removeItem("portfolio_user");
}
