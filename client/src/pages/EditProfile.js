import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function EditProfile() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/users/me", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data) => {
        if (cancelled) return;
        setFirstName(data.first_name || "");
        setLastName(data.last_name || "");
        setDescription(data.description || "");
      })
      .catch(() => {
        if (!cancelled) navigate("/login");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Saving…");

    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          description,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Update failed");
      }

      const data = await res.json();
      navigate(`/profile/${data.id}`);
    } catch (err) {
      setStatus(err.message);
    }
  };

  if (loading) return null;

  return (
    <div style={{ maxWidth: 400, margin: "2rem auto", fontFamily: "sans-serif" }}>
      <h2>Edit Profile</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label>First name</label>
          <br />
          <input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>

        <div style={{ marginTop: 8 }}>
          <label>Last name</label>
          <br />
          <input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>

        <div style={{ marginTop: 8 }}>
          <label>Description</label>
          <br />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            style={{ width: "100%", fontFamily: "inherit" }}
          />
        </div>

        <button style={{ marginTop: 12 }} type="submit">
          Save
        </button>
      </form>

      {status && <p>{status}</p>}
    </div>
  );
}
