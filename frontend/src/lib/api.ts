// src/lib/api.ts
export type AuthResponse = { token: string; username: string };

const API_BASE = import.meta.env.VITE_API_URL ?? "";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    ...init,
  });
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
  // NEW: requires login; automatically reads token from storage
  async listUsernames(): Promise<{ usernames: string[] }> {
    const auth = storage.get();
    if (!auth?.token) throw new Error("Not authenticated");
    return request<{ usernames: string[] }>("/api/users", {
      method: "GET",
      headers: { Authorization: `Bearer ${auth.token}` },
    });
  },
};

export const config = { API_BASE: API_BASE || "(same origin)" };
