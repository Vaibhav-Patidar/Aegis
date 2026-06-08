import axios from "axios";
import { supabase } from "./supabase";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL + "/api/v1",
  headers: { "Content-Type": "application/json" },
  timeout: 60000,
});

// Request interceptor — attach JWT from Supabase session
api.interceptors.request.use(async (config) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

// Response interceptor — auto-logout on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await supabase.auth.signOut();
      window.location.href = "/login";
    }
    const message =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.message ||
      "Something went wrong";
    return Promise.reject(new Error(message));
  }
);

// ── Incidents ──────────────────────────────────────────────

export async function getIncidents(skip = 0, limit = 50, search = "") {
  const params = { skip, limit };
  if (search) params.search = search;
  const { data } = await api.get("/incidents", { params });
  return data;
}

export async function getIncident(id) {
  const { data } = await api.get(`/incidents/${id}`);
  return data;
}

export async function createIncident(body) {
  const { data } = await api.post("/incidents", body);
  return data;
}

export async function deleteIncident(id) {
  await api.delete(`/incidents/${id}`);
}

// ── Diagnose ───────────────────────────────────────────────

export async function diagnoseIncident(text) {
  const { data } = await api.post("/diagnose", { text });
  return data;
}

// ── Auth ───────────────────────────────────────────────────

export async function signupAPI(email, password, org_name) {
  const { data } = await api.post("/auth/signup", {
    email,
    password,
    org_name,
  });
  return data;
}

export async function loginAPI(email, password) {
  const { data } = await api.post("/auth/login", { email, password });
  return data;
}

export default api;
