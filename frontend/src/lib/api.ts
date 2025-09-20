// src/lib/api.ts
export type AuthResponse = { token: string; username: string };

// Normalize base URL to avoid trailing slashes causing //api/...
const RAW_BASE = import.meta.env.VITE_API_URL ?? "";
const API_BASE = RAW_BASE.replace(/\/+$/, ""); // e.g. "https://x.vercel.app/"" -> "https://x.vercel.app"

// Join helper: ensures exactly one slash between base and path
function joinUrl(path: string) {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE}${p}`;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const url = joinUrl(path);

  // Merge headers while keeping your defaults
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init?.headers as Record<string, string> | undefined),
  };

  const res = await fetch(url, { ...init, headers });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const authApi = {
  signup: (username: string, password: string) =>
    request<AuthResponse>("/api/signup", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),

  login: (username: string, password: string) =>
    request<AuthResponse>("/api/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),
};

const KEY = "auth";
export const storage = {
  get(): AuthResponse | null {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthResponse;
    } catch {
      localStorage.removeItem(KEY);
      return null;
    }
  },
  set(auth: AuthResponse) {
    localStorage.setItem(KEY, JSON.stringify(auth));
  },
  clear() {
    localStorage.removeItem(KEY);
  },
};

export const usersApi = {
  // Requires login; automatically sends Bearer token from storage
  async listUsernames(): Promise<{ usernames: string[] }> {
    const auth = storage.get();
    if (!auth?.token) throw new Error("Not authenticated");
    return request<{ usernames: string[] }>("/api/users", {
      method: "GET",
      headers: { Authorization: `Bearer ${auth.token}` },
    });
  },
};

// For debugging in UI
export const config = { API_BASE: API_BASE || "(same origin)" };
