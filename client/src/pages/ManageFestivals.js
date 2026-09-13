import { useEffect, useState } from "react";
import { useAuth } from "../auth";

function FestivalRow({ festival, onSave, onDelete }) {
  const [name, setName] = useState(festival.name || "");
  const [slug, setSlug] = useState(festival.slug || "");
  const [date, setDate] = useState(festival.date || "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const dirty = name !== (festival.name || "") || slug !== (festival.slug || "") || date !== (festival.date || "");

  const handleSave = async () => {
    setSaving(true);
    await onSave(festival.id, { name, slug, date });
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${festival.name}"? This also removes it from any lineups.`)) return;
    setDeleting(true);
    await onDelete(festival.id);
    setDeleting(false);
  };

  return (
    <tr style={{ borderBottom: "1px solid #ddd" }}>
      <td style={{ padding: "8px 12px" }}>
        <input value={name} onChange={(e) => setName(e.target.value)} />
      </td>
      <td style={{ padding: "8px 12px" }}>
        <input value={slug} onChange={(e) => setSlug(e.target.value)} />
      </td>
      <td style={{ padding: "8px 12px" }}>
        <input type="date" value={date ? String(date).slice(0, 10) : ""} onChange={(e) => setDate(e.target.value)} />
      </td>
      <td style={{ padding: "8px 12px", display: "flex", gap: 8 }}>
        <button onClick={handleSave} disabled={!dirty || saving || deleting}>
          {saving ? "Saving…" : "Save"}
        </button>
        <button onClick={handleDelete} disabled={saving || deleting}>
          {deleting ? "Deleting…" : "Delete"}
        </button>
      </td>
    </tr>
  );
}

const ManageFestivals = () => {
  const { isLoggedIn, isAdmin, loading: authLoading } = useAuth();
  const [festivals, setFestivals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newDate, setNewDate] = useState("");
  const [creating, setCreating] = useState(false);

  const loadFestivals = () => {
    setIsLoading(true);
    setError("");
    return fetch("/api/festivals", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Failed to load festivals"))))
      .then((data) => setFestivals(Array.isArray(data) ? data : []))
      .catch((e) => setError(e.message || "Failed to load festivals"))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    if (authLoading || !isLoggedIn || !isAdmin) return;
    loadFestivals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isLoggedIn, isAdmin]);

  const handleSaveExisting = async (id, fields) => {
    setError("");
    try {
      const res = await fetch(`/api/festivals/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(fields),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || "Failed to update festival");
      }

      const updated = await res.json();
      setFestivals((old) => old.map((f) => (f.id === id ? updated : f)));
    } catch (e) {
      setError(e.message || "Failed to update festival");
    }
  };

  const handleDelete = async (id) => {
    setError("");
    try {
      const res = await fetch(`/api/festivals/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || "Failed to delete festival");
      }

      setFestivals((old) => old.filter((f) => f.id !== id));
    } catch (e) {
      setError(e.message || "Failed to delete festival");
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim() || !newSlug.trim()) {
      setError("Name and slug are required");
      return;
    }

    setCreating(true);
    setError("");
    try {
      const res = await fetch("/api/festivals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: newName.trim(), slug: newSlug.trim(), date: newDate || null }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || "Failed to create festival");
      }

      const created = await res.json();
      setFestivals((old) => [created, ...old]);
      setNewName("");
      setNewSlug("");
      setNewDate("");
    } catch (e) {
      setError(e.message || "Failed to create festival");
    } finally {
      setCreating(false);
    }
  };

  if (authLoading) return <div>Loading…</div>;

  if (!isLoggedIn || !isAdmin) {
    return <div style={{ maxWidth: 600, margin: "2rem auto" }}>Not authorized.</div>;
  }

  if (isLoading) return <div>Loading…</div>;

  return (
    <div style={{ maxWidth: 800, margin: "2rem auto", fontFamily: "sans-serif" }}>
      <h2>Manage Festivals</h2>

      {error && <div style={{ color: "crimson", marginBottom: 12 }}>{error}</div>}

      <form onSubmit={handleCreate} style={{ marginBottom: 24, display: "flex", gap: 8, alignItems: "center" }}>
        <input placeholder="Name" value={newName} onChange={(e) => setNewName(e.target.value)} required />
        <input placeholder="slug" value={newSlug} onChange={(e) => setNewSlug(e.target.value)} required />
        <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} />
        <button type="submit" disabled={creating}>
          {creating ? "Adding…" : "+ Add Festival"}
        </button>
      </form>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", padding: "8px 12px" }}>Name</th>
            <th style={{ textAlign: "left", padding: "8px 12px" }}>Slug</th>
            <th style={{ textAlign: "left", padding: "8px 12px" }}>Date</th>
            <th style={{ padding: "8px 12px" }}></th>
          </tr>
        </thead>
        <tbody>
          {festivals.map((f) => (
            <FestivalRow key={f.id} festival={f} onSave={handleSaveExisting} onDelete={handleDelete} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageFestivals;
