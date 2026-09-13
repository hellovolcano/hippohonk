import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import InputField from "../../components/common/forms/input-field";
import Button from "../../components/common/forms/button";

const EditProfile = () => {
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
    <div className="page-form">
      <h2>Edit Profile</h2>

      <form onSubmit={handleSubmit}>
        <InputField
          label="First name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />

        <InputField
          label="Last name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />

        <InputField
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          multiline
          rows={4}
        />

        <Button type="submit">Save</Button>
      </form>

      {status && <p className="status-message">{status}</p>}
    </div>
  );
};

export default EditProfile;
