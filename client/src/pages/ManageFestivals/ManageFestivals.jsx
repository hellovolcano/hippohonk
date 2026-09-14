import { useEffect, useState } from "react";
import { useAuth } from "../../auth";
import RequireAdmin from "../../components/common/require-admin";
import Button from "../../components/common/forms/button";
import InputField from "../../components/common/forms/input-field";

const FestivalRow = ({ festival, onSave, onDelete }) => {
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
    <tr>
      <td>
        <InputField value={name} onChange={(e) => setName(e.target.value)} />
      </td>
      <td>
        <InputField value={slug} onChange={(e) => setSlug(e.target.value)} />
      </td>
      <td>
        <InputField type="date" value={date ? String(date).slice(0, 10) : ""} onChange={(e) => setDate(e.target.value)} />
      </td>
      <td>
        <Button onClick={handleSave} disabled={!dirty || saving || deleting}>
          {saving ? "Saving…" : "Save"}
        </Button>
        <Button onClick={handleDelete} disabled={saving || deleting}>
          {deleting ? "Deleting…" : "Delete"}
        </Button>
      </td>
    </tr>
  );
};

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

  return (
    <RequireAdmin>
      {isLoading ? (
        <div>Loading…</div>
      ) : (
        <div className="page-panel">
          <h2>Manage Festivals</h2>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleCreate} className="form-row inline-form-row">
            <InputField placeholder="Name" value={newName} onChange={(e) => setNewName(e.target.value)} required />
            <InputField placeholder="slug" value={newSlug} onChange={(e) => setNewSlug(e.target.value)} required />
            <InputField type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} />
            <Button type="submit" disabled={creating}>
              {creating ? "Adding…" : "+ Add Festival"}
            </Button>
          </form>

          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {festivals.map((f) => (
                <FestivalRow key={f.id} festival={f} onSave={handleSaveExisting} onDelete={handleDelete} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </RequireAdmin>
  );
};

export default ManageFestivals;
