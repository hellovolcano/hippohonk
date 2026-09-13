import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState(null);
  const [user, setUser] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Logging in…");

    try {
      const res = await fetch("/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // important for sessions
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Login failed");
      }

      const data = await res.json();
      setUser(data);
      setStatus("Logged in successfully");
    } catch (err) {
      setStatus(err.message);
    }
  };


  const logout = async () => {
    await fetch("/api/users/logout", {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
    setStatus("Logged out");
  };

  return (
    <div style={{ maxWidth: 400, margin: "2rem auto", fontFamily: "sans-serif" }}>
      <h2>Login Test</h2>

      {!user && (
        <form onSubmit={handleSubmit}>
          <div>
            <label>Email</label>
            <br />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div style={{ marginTop: 8 }}>
            <label>Password</label>
            <br />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button style={{ marginTop: 12 }} type="submit">
            Login
          </button>
        </form>
      )}

      {status && <p>{status}</p>}

      {user && (
        <div style={{ marginTop: 16 }}>
          <pre>{JSON.stringify(user, null, 2)}</pre>

          <button onClick={logout} style={{ marginLeft: 8 }}>
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
