export async function login({ email, username, password }) {
  const res = await fetch("/api/users/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // only required if calling cross-origin; safe to include regardless:
    credentials: "include",
    body: JSON.stringify({ email, username, password }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Login failed");
  }

  return res.json();
}