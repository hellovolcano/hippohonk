import { useEffect, useMemo, useState } from "react";

import InputField from "../components/common/forms/input-field";
import Button from "../components/common/forms/button";
import DropDown from "../components/common/forms/drop-down";

const BandForm = ({
  mode = "create",
  initialBand = null,
  bandId = null,
  onSuccess,
}) => {
  const isEdit = mode === "edit";

  const [genres, setGenres] = useState([]);
  const [festivals, setFestivals] = useState([]);

  const [loadingGenres, setLoadingGenres] = useState(true);
  const [loadingFestivals, setLoadingFestivals] = useState(true);
  const [loadingBand, setLoadingBand] = useState(isEdit && !initialBand);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: initialBand?.name ?? "",
    location: initialBand?.location ?? "",
    url: initialBand?.url ?? "",
    spotify_url: initialBand?.spotify_url ?? "",
    genre_id: initialBand?.genre_id ?? "",
    description: initialBand?.description ?? "",
    average_rating:
      initialBand?.average_rating !== undefined && initialBand?.average_rating !== null
        ? String(initialBand.average_rating)
        : "",
    // optional: choose a festival to add this band to the lineup
    festival_id: "",
  });

  function updateField(key) {
    return (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));
  }

  // Fetch genres for dropdown
  useEffect(() => {
    let cancelled = false;

    async function loadGenres() {
      setLoadingGenres(true);
      setError("");
      try {
        const res = await fetch("/api/genres", { credentials: "include" });
        if (!res.ok) throw new Error("Failed to load genres");
        const data = await res.json();
        if (!cancelled) setGenres(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!cancelled) setError(e.message || "Error loading genres");
      } finally {
        if (!cancelled) setLoadingGenres(false);
      }
    }

    loadGenres();
    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch upcoming festivals for dropdown
  useEffect(() => {
    let cancelled = false;

    async function loadFestivals() {
      setLoadingFestivals(true);
      setError("");
      try {
        const res = await fetch("/api/festivals/upcoming", {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to load upcoming festivals");
        const data = await res.json();
        if (!cancelled) setFestivals(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!cancelled) setError(e.message || "Error loading festivals");
      } finally {
        if (!cancelled) setLoadingFestivals(false);
      }
    }

    loadFestivals();
    return () => {
      cancelled = true;
    };
  }, []);

  // If editing and we weren't given initialBand, fetch it
  useEffect(() => {
    if (!isEdit || initialBand) return;
    if (!bandId) {
      setError("Missing bandId for edit mode");
      setLoadingBand(false);
      return;
    }

    let cancelled = false;

    async function loadBand() {
      setLoadingBand(true);
      setError("");
      try {
        const res = await fetch(`/api/bands/${bandId}`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to load band");
        const b = await res.json();

        if (!cancelled) {
          setForm((prev) => ({
            ...prev,
            name: b?.name ?? "",
            location: b?.location ?? "",
            url: b?.url ?? "",
            spotify_url: b?.spotify_url ?? "",
            genre_id: b?.genre_id ?? "",
            description: b?.description ?? "",
            average_rating:
              b?.average_rating !== undefined && b?.average_rating !== null
                ? String(b.average_rating)
                : "",
            // keep festival_id as-is (user can choose one for mapping)
          }));
        }
      } catch (e) {
        if (!cancelled) setError(e.message || "Error loading band");
      } finally {
        if (!cancelled) setLoadingBand(false);
      }
    }

    loadBand();
    return () => {
      cancelled = true;
    };
  }, [isEdit, initialBand, bandId]);

  const canSubmit = useMemo(() => {
    return (
      form.name.trim().length > 0 &&
      String(form.genre_id).trim().length > 0 &&
      !submitting
    );
  }, [form.name, form.genre_id, submitting]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.name.trim() || !String(form.genre_id).trim()) {
      setError("Name and Genre are required.");
      return;
    }

    const urlTrimmed = form.url.trim();
    if (urlTrimmed && !/^https?:\/\//i.test(urlTrimmed)) {
      setError("URL must start with http:// or https://");
      return;
    }

    const spotifyUrlTrimmed = form.spotify_url.trim();
    if (spotifyUrlTrimmed && !/^https?:\/\//i.test(spotifyUrlTrimmed)) {
      setError("Spotify link must start with http:// or https://");
      return;
    }

    // average_rating is optional; if present ensure it's a number
    const ratingTrimmed = String(form.average_rating ?? "").trim();
    const parsedRating =
      ratingTrimmed.length === 0 ? null : Number(ratingTrimmed);

    if (ratingTrimmed.length > 0 && !Number.isFinite(parsedRating)) {
      setError("Average rating must be a number.");
      return;
    }

    setSubmitting(true);
    try {
      // 1) Create or update the band
      const bandPayload = {
        name: form.name.trim(),
        genre_id: Number(form.genre_id),
        location: form.location.trim() || null,
        url: urlTrimmed || null,
        spotify_url: spotifyUrlTrimmed || null,
        description: form.description.trim() || null,
        average_rating: parsedRating,
      };

      const bandEndpoint = isEdit
        ? `/api/bands/${bandId ?? initialBand?.id}`
        : "/api/bands";
      const bandMethod = isEdit ? "PUT" : "POST";

      const bandRes = await fetch(bandEndpoint, {
        method: bandMethod,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(bandPayload),
      });

      if (!bandRes.ok) {
        const body = await bandRes.json().catch(() => ({}));
        throw new Error(
          body.message || `Failed to ${isEdit ? "update" : "create"} band`
        );
      }

      const savedBand = await bandRes.json();

      // 2) If a festival is selected, create a lineup mapping
      // (Band can belong to multiple festivals, so this just adds one mapping.)
      if (String(form.festival_id).trim().length > 0) {
        const lineupRes = await fetch("/api/lineups", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            festival_id: Number(form.festival_id),
            band_id: savedBand.id,
          }),
        });

        if (!lineupRes.ok) {
          const body = await lineupRes.json().catch(() => ({}));
          throw new Error(
            body.message || "Band saved, but failed to add to lineup"
          );
        }
      }

      if (onSuccess) onSuccess(savedBand);

      if (!isEdit) {
        setForm({
          name: "",
          location: "",
          url: "",
          spotify_url: "",
          genre_id: "",
          description: "",
          average_rating: "",
          festival_id: "",
        });
      } else {
        // keep band fields; reset festival selection after adding mapping
        setForm((prev) => ({ ...prev, festival_id: "" }));
      }
    } catch (e) {
      setError(e.message || "Server error");
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingGenres || loadingFestivals || loadingBand) {
    return <div>Loading…</div>;
  }

  // Adapt options to whatever DropDown expects.
  // Common patterns: [{ value, label }] or [{ id, name }].
  // We'll provide value/label and also include id/name to be safe.
  const genreOptions = genres.map((g) => ({
    value: g.id,
    label: g.name,
    id: g.id,
    name: g.name,
  }));

  const festivalOptions = festivals.map((f) => ({
    value: f.id,
    label: `${f.name} (${String(f.date).slice(0, 10)})`,
    id: f.id,
    name: `${f.name} (${String(f.date).slice(0, 10)})`,
  }));

  return (
    <form onSubmit={handleSubmit} className="page-form">
      <h2>{isEdit ? "Edit Band" : "Add Band"}</h2>

      {error && <div className="error-message">{error}</div>}

      <InputField
        label="Name"
        required
        value={form.name}
        onChange={updateField("name")}
      />

      <DropDown
        label="Genre"
        required
        value={form.genre_id}
        onChange={updateField("genre_id")}
        options={genreOptions}
        placeholder="Select a genre…"
      />

      <DropDown
        label="Festival (optional)"
        value={form.festival_id}
        onChange={updateField("festival_id")}
        options={festivalOptions}
        placeholder="No festival (don’t add to lineup)"
        helperText="Selecting a festival will create a lineup entry (festival_id + band_id)."
      />

      <InputField
        label="Location"
        value={form.location}
        onChange={updateField("location")}
      />

      <InputField
        label="URL"
        value={form.url}
        onChange={updateField("url")}
        placeholder="https://…"
      />

      <InputField
        label="Spotify Link"
        value={form.spotify_url}
        onChange={updateField("spotify_url")}
        placeholder="https://open.spotify.com/artist/…"
      />

      <InputField
        label="Average Rating"
        value={form.average_rating}
        onChange={updateField("average_rating")}
        placeholder="e.g. 4.5"
      />

      <InputField
        label="Description"
        value={form.description}
        onChange={updateField("description")}
        multiline
        rows={4}
      />

      <Button type="submit" disabled={!canSubmit}>
        {submitting ? "Saving…" : isEdit ? "Update Band" : "Add Band"}
      </Button>
    </form>
  );
};

export default BandForm;