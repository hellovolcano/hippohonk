import { useEffect, useState } from "react";
import { useAuth } from "../../auth";
import RequireAdmin from "../../components/common/require-admin";
import Button from "../../components/common/forms/button";
import InputField from "../../components/common/forms/input-field";

const NameCell = ({ user, onSave }) => {
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
      <span className="inline-form-row">
        <InputField
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="First"
          autoFocus
        />
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "…" : "Save"}
        </Button>
        <Button onClick={handleCancel} disabled={saving}>
          Cancel
        </Button>
      </span>
    );
  }

  return (
    <span>
      <a href={`/profile/${user.id}`}>
        {user.first_name || user.last_name ? `${user.first_name || ""} ${user.last_name || ""}` : `User #${user.id}`}
      </a>{" "}
      <button className="icon-button" onClick={startEditing} aria-label="Edit name" title="Edit name">
        ✏️
      </button>
    </span>
  );
};

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

  return (
    <RequireAdmin>
      {isLoading ? (
        <div>Loading…</div>
      ) : (
        <div className="page-panel">
          <h2>Manage Users</h2>

          {error && <div className="error-message">{error}</div>}

          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Active</th>
                <th>Reviewer</th>
                <th>Admin</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <NameCell user={u} onSave={handleSaveName} />
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <input
                      type="checkbox"
                      checked={!!u.active}
                      disabled={savingId === u.id}
                      onChange={(e) => handleToggle(u.id, "active", e.target.checked)}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      checked={!!u.reviewer}
                      disabled={savingId === u.id}
                      onChange={(e) => handleToggle(u.id, "reviewer", e.target.checked)}
                    />
                  </td>
                  <td>
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
      )}
    </RequireAdmin>
  );
};

export default ManageUsers;
