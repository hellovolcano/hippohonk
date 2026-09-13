import { useEffect, useState } from "react";
import { useAuth } from "../auth";

function NameCell({ user, onSave }) {
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState(user.first_name || "");
  const [saving, setSaving] = useState(false);

  const startEditing = () => {
    setFirstName(user.first_name || "");
    setIsEditing(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const ok = await onSave(user.id, { first_name: firstName });
    setSaving(false);
    if (ok) setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <span style={{ display: "inline-flex", gap: 4 }}>
        <input
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="First"
          style={{ width: 90 }}
          autoFocus
        />
        <button onClick={handleSave} disabled={saving}>
          {saving ? "…" : "Save"}
        </button>
        <button onClick={handleCancel} disabled={saving}>
          Cancel
        </button>
      </span>
    );
  }

  return (
    <span>
      <a href={`/profile/${user.id}`}>
        {user.first_name || user.last_name ? `${user.first_name || ""} ${user.last_name || ""}` : `User #${user.id}`}
      </a>{" "}
      <button
        onClick={startEditing}
        aria-label="Edit name"
        title="Edit name"
        style={{ border: "none", background: "none", cursor: "pointer", padding: 0 }}
      >
        ✏️
      </button>
    </span>
  );
}

const ManageUsers = () => {
  const { isLoggedIn, isAdmin, loading: authLoading } = useAuth();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    if (authLoading || !isLoggedIn || !isAdmin) return;

    let cancelled = false;

    fetch("/api/users", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Failed to load users"))))
      .then((data) => {
        if (!cancelled) setUsers(Array.isArray(data) ? data : []);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message || "Failed to load users");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [authLoading, isLoggedIn, isAdmin]);

  const handleToggle = async (userId, field, value) => {
    setSavingId(userId);
    setError("");

    // optimistic update
    setUsers((old) => old.map((u) => (u.id === userId ? { ...u, [field]: value } : u)));

    try {
      const res = await fetch(`/api/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ [field]: value }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || "Failed to update user");
      }
    } catch (e) {
      // revert on failure
      setUsers((old) => old.map((u) => (u.id === userId ? { ...u, [field]: !value } : u)));
      setError(e.message || "Failed to update user");
    } finally {
      setSavingId(null);
    }
  };

  const handleSaveName = async (userId, { first_name }) => {
    setError("");
    try {
      const res = await fetch(`/api/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ first_name }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || "Failed to update user");
      }

      setUsers((old) => old.map((u) => (u.id === userId ? { ...u, first_name } : u)));
      return true;
    } catch (e) {
      setError(e.message || "Failed to update user");
      return false;
    }
  };

  if (authLoading) return <div>Loading…</div>;

  if (!isLoggedIn || !isAdmin) {
    return <div style={{ maxWidth: 600, margin: "2rem auto" }}>Not authorized.</div>;
  }

  if (isLoading) return <div>Loading…</div>;

  return (
    <div style={{ maxWidth: 800, margin: "2rem auto", fontFamily: "sans-serif" }}>
      <h2>Manage Users</h2>

      {error && <div style={{ color: "crimson", marginBottom: 12 }}>{error}</div>}

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", padding: "8px 12px" }}>Name</th>
            <th style={{ textAlign: "left", padding: "8px 12px" }}>Email</th>
            <th style={{ textAlign: "center", padding: "8px 12px" }}>Active</th>
            <th style={{ textAlign: "center", padding: "8px 12px" }}>Reviewer</th>
            <th style={{ textAlign: "center", padding: "8px 12px" }}>Admin</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} style={{ borderBottom: "1px solid #ddd" }}>
              <td style={{ padding: "8px 12px" }}>
                <NameCell user={u} onSave={handleSaveName} />
              </td>
              <td style={{ padding: "8px 12px" }}>{u.email}</td>
              <td style={{ textAlign: "center", padding: "8px 12px" }}>
                <input
                  type="checkbox"
                  checked={!!u.active}
                  disabled={savingId === u.id}
                  onChange={(e) => handleToggle(u.id, "active", e.target.checked)}
                />
              </td>
              <td style={{ textAlign: "center", padding: "8px 12px" }}>
                <input
                  type="checkbox"
                  checked={!!u.reviewer}
                  disabled={savingId === u.id}
                  onChange={(e) => handleToggle(u.id, "reviewer", e.target.checked)}
                />
              </td>
              <td style={{ textAlign: "center", padding: "8px 12px" }}>
                <input
                  type="checkbox"
                  checked={!!u.admin}
                  disabled={savingId === u.id}
                  onChange={(e) => handleToggle(u.id, "admin", e.target.checked)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageUsers;
