import { useEffect, useMemo, useState } from "react";
import "./App.css";
import { authApi, storage, config, type AuthResponse, usersApi } from "./lib/api";

// Keep separate input state per tab so toggling is "optimistic" and lossless.
type Mode = "login" | "signup";

// --- Inline UsersList component (protected; requires JWT in storage) ---
function UsersList() {
  const [names, setNames] = useState<string[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    usersApi.listUsernames().then(
      (r) => {
        if (!cancelled) setNames(r.usernames);
      },
      (e) => {
        if (!cancelled) setErr(e.message ?? "Failed to load users");
      }
    );
    return () => {
      cancelled = true;
    };
  }, []);

  if (err) return <div className="error">{err}</div>;
  if (!names) return <div>Loading users…</div>;
  return (
    <ul>
      {names.map((n) => (
        <li key={n}>{n}</li>
      ))}
    </ul>
  );
}

export default function App() {
  const [mode, setMode] = useState<Mode>("login");
  const [loginFields, setLoginFields] = useState({ username: "", password: "" });
  const [signupFields, setSignupFields] = useState({ username: "", password: "" });

  const [auth, setAuth] = useState<AuthResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // hydrate auth from localStorage
  useEffect(() => {
    const saved = storage.get();
    if (saved) setAuth(saved);
  }, []);

  // Current tab's fields + setters (makes toggling instant/optimistic)
  const fields = useMemo(
    () =>
      mode === "login"
        ? ([loginFields, setLoginFields] as const)
        : ([signupFields, setSignupFields] as const),
    [mode, loginFields, signupFields]
  );

  const [{ username, password }, setFields] = fields;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!username || !password) {
      setError("Username and password are required.");
      return;
    }

    setLoading(true);
    try {
      const doAuth = mode === "login" ? authApi.login : authApi.signup;
      const data = await doAuth(username, password);
      setAuth(data);
      storage.set(data);
      // clear only the active tab's fields; the other tab remains untouched
      setFields({ username: "", password: "" });
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  // Optimistic logout: clear UI immediately (no network call)
  function logout() {
    setAuth(null);
    storage.clear();
  }

  // Optimistic tab toggle: immediate UI swap + preserve per-tab inputs
  function toggle(to: Mode) {
    if (loading) return; // avoid mid-request flips
    setMode(to);
    setError(null);
  }

  if (auth) {
    return (
      <div className="container">
        <h1>Minimal Auth Demo</h1>
        <p>
          Hello, <strong>{auth.username}</strong> 👋
        </p>

        {/* Protected list of all usernames */}
        <h2>All users</h2>
        <UsersList />

        <button onClick={logout} style={{ marginTop: 12 }}>Log out</button>
        <p className="hint">
          Backend base URL: <code>{config.API_BASE}</code>
        </p>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Minimal Auth Demo</h1>
      <h1>HELLO!!!!!!!</h1>

      <div className="tabs">
        <button
          className={mode === "login" ? "active" : ""}
          onClick={() => toggle("login")}
          disabled={loading}
        >
          Log in
        </button>
        <button
          className={mode === "signup" ? "active" : ""}
          onClick={() => toggle("signup")}
          disabled={loading}
        >
          Sign up
        </button>
      </div>

      <form onSubmit={handleSubmit} className="card">
        <label>
          Username
          <input
            type="text"
            autoComplete="username"
            value={username}
            onChange={(e) => setFields((s) => ({ ...s, username: e.target.value }))}
            disabled={loading}
          />
        </label>

        <label>
          Password
          <input
            type="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            value={password}
            onChange={(e) => setFields((s) => ({ ...s, password: e.target.value }))}
            disabled={loading}
          />
        </label>

        {error && <div className="error">{error}</div>}

        <button type="submit" disabled={loading}>
          {loading
            ? mode === "login"
              ? "Logging in…"
              : "Signing up…"
            : mode === "login"
            ? "Log in"
            : "Sign up"}
        </button>
      </form>

      <p className="hint">
        Backend base URL: <code>{config.API_BASE}</code>
      </p>
    </div>
  );
}
