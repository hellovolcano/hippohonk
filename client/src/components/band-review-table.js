import { useEffect, useMemo, useRef, useState } from "react";
import { tableFeatures, useTable } from "@tanstack/react-table";
import { Chip, Pagination, Stack } from "@mui/material";
import RecommendRoundedIcon from "@mui/icons-material/RecommendRounded";
import { useAuth } from "../auth";
import "./components.css";

const BANDS_PER_PAGE = 10;

const features = tableFeatures({});

function isNewRowId(bandId) {
  return typeof bandId === "string" && bandId.startsWith("new-");
}

function makeEditableTextCell(field) {
  return function EditableTextCell({ getValue, row, table }) {
    const initialValue = getValue();
    const [value, setValue] = useState(initialValue ?? "");

    useEffect(() => {
      setValue(initialValue ?? "");
    }, [initialValue]);

    const commit = () => {
      table.options.meta?.updateBandField(row.original.band_id, field, value);
    };

    return (
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={commit}
        placeholder={row.original.isNew ? field : undefined}
        style={{ width: field === "description" ? 220 : 130 }}
      />
    );
  };
}

function makeEditableUrlCell(field) {
  return function EditableUrlCell({ getValue, row, table }) {
    const initialValue = getValue();
    const [value, setValue] = useState(initialValue ?? "");

    useEffect(() => {
      setValue(initialValue ?? "");
    }, [initialValue]);

    const commit = () => {
      table.options.meta?.updateBandField(row.original.band_id, field, value);
    };

    return (
      <input
        type="url"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={commit}
        placeholder="https://…"
        style={{ width: 150 }}
      />
    );
  };
}

// The Name cell is special for a new row: the underlying band isn't created
// until this field is filled in and loses focus.
function EditableNameCell({ getValue, row, table }) {
  const initialValue = getValue();
  const [value, setValue] = useState(initialValue ?? "");

  useEffect(() => {
    setValue(initialValue ?? "");
  }, [initialValue]);

  const commit = () => {
    if (row.original.isNew) {
      table.options.meta?.commitNewBandName(row.original.band_id, value);
    } else {
      table.options.meta?.updateBandField(row.original.band_id, "name", value);
    }
  };

  return (
    <input
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={commit}
      placeholder={row.original.isNew ? "name" : undefined}
      style={{ width: 130 }}
    />
  );
}

const EditableLocationCell = makeEditableTextCell("location");
const EditableDescriptionCell = makeEditableTextCell("description");
const EditableUrlCell = makeEditableUrlCell("url");
const EditableSpotifyUrlCell = makeEditableUrlCell("spotify_url");

function ReadOnlyRatingCell({ getValue }) {
  const value = getValue();
  return <span>{value ?? "—"}</span>;
}

function EditableRatingCell({ getValue, row, table }) {
  const initialValue = getValue();
  const [value, setValue] = useState(initialValue ?? "");

  useEffect(() => {
    setValue(initialValue ?? "");
  }, [initialValue]);

  const commit = () => {
    const trimmed = String(value).trim();
    const parsed = trimmed === "" ? null : Number(trimmed);
    table.options.meta?.updateReviewerRating(row.original.band_id, parsed);
  };

  return (
    <input
      type="number"
      min="1"
      max="5"
      style={{ width: 48 }}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={commit}
    />
  );
}

const BandReviewTable = ({ bands: initialBands, isLoading: bandsLoading, festivalId }) => {
  const { user } = useAuth();
  const [bands, setBands] = useState(initialBands || []);
  const [reviewers, setReviewers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [saving, setSaving] = useState(false);

  // band_id -> { [user_id]: rating }, filled in a page at a time
  const [ratingsCache, setRatingsCache] = useState({});
  const loadedBandIdsRef = useRef(new Set());

  // band_id -> edited rating for the current user (undefined = not edited)
  const [ratingEdits, setRatingEdits] = useState({});

  // band_id -> { name?, location?, description?, url?, spotify_url? } edited values (real ids and "new-N" temp ids)
  const [bandFieldEdits, setBandFieldEdits] = useState({});
  const bandOriginalsRef = useRef(new Map());
  const newRowCounterRef = useRef(0);

  // Keep our local copy of bands in sync with the list passed in (e.g. a festival's lineup)
  useEffect(() => {
    const list = initialBands || [];
    setBands(list);
    bandOriginalsRef.current = new Map(
      list.map((b) => [
        b.band_id,
        { name: b.name, location: b.location, description: b.description, url: b.url, spotify_url: b.spotify_url },
      ])
    );
    setBandFieldEdits({});
    setRatingEdits({});
    setRatingsCache({});
    loadedBandIdsRef.current = new Set();
    setCurrentPage(1);
  }, [initialBands]);

  // Load the list of active reviewers once
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError("");
      try {
        const reviewersRes = await fetch("/api/users?active=true&reviewer=true", {
          credentials: "include",
        });

        if (!reviewersRes.ok) throw new Error("Failed to load reviewers");

        const reviewersData = await reviewersRes.json();

        if (!cancelled) setReviewers(reviewersData);
      } catch (e) {
        if (!cancelled) setError(e.message || "Failed to load review table");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const numPages = Math.max(1, Math.ceil(bands.length / BANDS_PER_PAGE));
  const pagedBands = useMemo(() => {
    const start = (currentPage - 1) * BANDS_PER_PAGE;
    return bands.slice(start, start + BANDS_PER_PAGE);
  }, [bands, currentPage]);

  // Fetch ratings for whichever real (non-new) bands on this page haven't been loaded yet
  useEffect(() => {
    const idsToLoad = pagedBands
      .filter((b) => !b.isNew)
      .map((b) => b.band_id)
      .filter((id) => !loadedBandIdsRef.current.has(id));

    if (idsToLoad.length === 0) return;

    let cancelled = false;

    fetch(`/api/ratings?band_id=${idsToLoad.join(",")}&all=true`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Failed to load ratings"))))
      .then((ratingsData) => {
        if (cancelled) return;

        idsToLoad.forEach((id) => loadedBandIdsRef.current.add(id));

        setRatingsCache((old) => {
          const next = { ...old };
          idsToLoad.forEach((id) => {
            next[id] = next[id] || {};
          });
          ratingsData.forEach((r) => {
            next[r.band_id] = { ...(next[r.band_id] || {}), [r.user_id]: r.rating };
          });
          return next;
        });
      })
      .catch((e) => {
        if (!cancelled) setError(e.message || "Failed to load ratings");
      });

    return () => {
      cancelled = true;
    };
  }, [pagedBands]);

  // Active reviewers get a column; so does the current user, even if not
  // flagged "active", so they can always see/manage their own existing review.
  const visibleReviewers = useMemo(() => {
    if (!user?.reviewer || reviewers.some((r) => r.id === user.id)) return reviewers;
    return [...reviewers, { id: user.id, first_name: user.first_name, last_name: user.last_name }];
  }, [reviewers, user]);

  const columns = useMemo(() => {
    const cols = [
      {
        id: "name",
        accessorFn: (band) => bandFieldEdits[band.band_id]?.name ?? band.name ?? "",
        header: "Band Name",
        cell: EditableNameCell,
      },
      {
        id: "location",
        accessorFn: (band) => bandFieldEdits[band.band_id]?.location ?? band.location ?? "",
        header: "Location",
        cell: EditableLocationCell,
      },
      {
        id: "description",
        accessorFn: (band) => bandFieldEdits[band.band_id]?.description ?? band.description ?? "",
        header: "Description",
        cell: EditableDescriptionCell,
      },
      {
        id: "url",
        accessorFn: (band) => bandFieldEdits[band.band_id]?.url ?? band.url ?? "",
        header: "URL",
        cell: EditableUrlCell,
      },
      {
        id: "spotify_url",
        accessorFn: (band) => bandFieldEdits[band.band_id]?.spotify_url ?? band.spotify_url ?? "",
        header: "Spotify",
        cell: EditableSpotifyUrlCell,
      },
      {
        id: "average_rating",
        accessorFn: (band) => band.average_rating,
        header: "Average Rating",
        cell: (info) => (
          <Chip
            label={info.getValue() ?? "—"}
            color="success"
            variant="outlined"
            size="small"
            icon={<RecommendRoundedIcon fontSize="small" />}
          />
        ),
      },
    ];

    visibleReviewers.forEach((reviewer) => {
      const isOwnColumn = reviewer.id === user?.id;
      cols.push({
        id: `reviewer_${reviewer.id}`,
        accessorFn: (band) => {
          if (isOwnColumn && ratingEdits[band.band_id] !== undefined) {
            return ratingEdits[band.band_id];
          }
          return ratingsCache[band.band_id]?.[reviewer.id] ?? null;
        },
        header: reviewer.first_name || `User #${reviewer.id}`,
        cell: isOwnColumn ? EditableRatingCell : ReadOnlyRatingCell,
      });
    });

    return cols;
  }, [visibleReviewers, user?.id, ratingsCache, ratingEdits, bandFieldEdits]);

  // Guards against a double-fire (e.g. Enter then blur) creating the same row twice
  const creatingRowsRef = useRef(new Set());

  const commitNewBandName = async (tempId, name) => {
    const trimmed = name.trim();
    if (!trimmed) return; // stays a blank pending row until named
    if (creatingRowsRef.current.has(tempId)) return;
    creatingRowsRef.current.add(tempId);

    try {
      const pending = bandFieldEdits[tempId] || {};
      const res = await fetch("/api/bands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: trimmed,
          location: pending.location ?? "",
          description: pending.description ?? "",
          url: pending.url ?? "",
          spotify_url: pending.spotify_url ?? "",
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || "Failed to create band");
      }

      const created = await res.json();

      if (festivalId) {
        await fetch("/api/lineups", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ festival_id: festivalId, band_id: created.id }),
        });
      }

      setBands((old) =>
        old.map((b) =>
          b.band_id === tempId
            ? {
                band_id: created.id,
                name: created.name,
                location: created.location,
                description: created.description,
                url: created.url,
                spotify_url: created.spotify_url,
                average_rating: created.average_rating ?? null,
                isNew: false,
              }
            : b
        )
      );

      bandOriginalsRef.current.set(created.id, {
        name: created.name,
        location: created.location,
        description: created.description,
        url: created.url,
        spotify_url: created.spotify_url,
      });

      // Its fields are now saved as the original; drop the pending edit entry
      setBandFieldEdits((old) => {
        const next = { ...old };
        delete next[tempId];
        return next;
      });

      // Carry over any rating typed before the name was committed
      setRatingEdits((old) => {
        if (!(tempId in old)) return old;
        const next = { ...old };
        next[created.id] = next[tempId];
        delete next[tempId];
        return next;
      });
    } catch (e) {
      setError(e.message || "Failed to create band");
      // Preserve the typed name so it isn't lost; Save will retry the creation.
      setBandFieldEdits((old) => ({
        ...old,
        [tempId]: { ...(old[tempId] || {}), name: trimmed },
      }));
    } finally {
      creatingRowsRef.current.delete(tempId);
    }
  };

  const table = useTable({
    key: "band-review-table",
    features,
    columns,
    data: pagedBands,
    meta: {
      updateReviewerRating: (bandId, newValue) => {
        setRatingEdits((old) => {
          const originalValue = ratingsCache[bandId]?.[user.id] ?? null;
          const next = { ...old };
          if (!isNewRowId(bandId) && newValue === originalValue) {
            delete next[bandId];
          } else {
            next[bandId] = newValue;
          }
          return next;
        });
      },
      updateBandField: (bandId, field, value) => {
        setBandFieldEdits((old) => {
          const original = bandOriginalsRef.current.get(bandId);
          const entry = { ...(old[bandId] || {}) };

          if (!isNewRowId(bandId) && original && (original[field] ?? "") === value) {
            delete entry[field];
          } else {
            entry[field] = value;
          }

          const next = { ...old };
          if (Object.keys(entry).length === 0) {
            delete next[bandId];
          } else {
            next[bandId] = entry;
          }
          return next;
        });
      },
      commitNewBandName,
    },
  });

  const dirtyCount = Object.keys(ratingEdits).length + Object.keys(bandFieldEdits).length;

  const handleAddRow = () => {
    newRowCounterRef.current += 1;
    const tempId = `new-${newRowCounterRef.current}`;
    setBands((old) => {
      const next = [
        ...old,
        { band_id: tempId, name: "", location: "", description: "", average_rating: null, isNew: true },
      ];
      setCurrentPage(Math.ceil(next.length / BANDS_PER_PAGE));
      return next;
    });
  };

  const handleSave = async () => {
    if (dirtyCount === 0) return;

    setSaving(true);
    setError("");
    try {
      const existingFieldUpdates = Object.entries(bandFieldEdits)
        .filter(([bandId]) => !isNewRowId(bandId))
        .map(([bandId, fields]) => ({ id: Number(bandId), ...fields }));

      const newRowPayload = bands
        .filter((b) => b.isNew)
        .map((row) => ({
          client_id: row.band_id,
          name: (bandFieldEdits[row.band_id]?.name ?? "").trim(),
          location: bandFieldEdits[row.band_id]?.location ?? "",
          description: bandFieldEdits[row.band_id]?.description ?? "",
          url: bandFieldEdits[row.band_id]?.url ?? "",
          spotify_url: bandFieldEdits[row.band_id]?.spotify_url ?? "",
        }))
        .filter((entry) => entry.name.length > 0);

      const bandBatchPayload = [...existingFieldUpdates, ...newRowPayload];

      let bandBatchResult = [];
      if (bandBatchPayload.length > 0) {
        const res = await fetch("/api/bands/batch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ bands: bandBatchPayload }),
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.message || "Failed to save bands");
        }

        const data = await res.json();
        bandBatchResult = data.updated;
      }

      // temp row id -> newly created band record
      const newBandByClientId = new Map(
        bandBatchResult.filter((b) => b.client_id).map((b) => [b.client_id, b])
      );

      // Add newly created bands to this festival's lineup
      if (festivalId && newBandByClientId.size > 0) {
        await Promise.all(
          Array.from(newBandByClientId.values()).map((b) =>
            fetch("/api/lineups", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({ festival_id: festivalId, band_id: b.id }),
            })
          )
        );
      }

      // Remap rating edits for temp ids to their new real band id; drop ones whose
      // band was never actually created (still-blank new rows)
      const ratingsPayloadEntries = Object.entries(ratingEdits)
        .map(([bandId, rating]) => {
          const created = newBandByClientId.get(bandId);
          const realId = created ? created.id : Number(bandId);
          return { key: bandId, band_id: realId, rating };
        })
        .filter((entry) => Number.isFinite(entry.band_id));

      let ratingsBatchResult = [];
      if (ratingsPayloadEntries.length > 0) {
        const res = await fetch("/api/ratings/batch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            ratings: ratingsPayloadEntries.map(({ band_id, rating }) => ({ band_id, rating })),
          }),
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.message || "Failed to save ratings");
        }

        const data = await res.json();
        ratingsBatchResult = data.updated;
      }

      // Merge results back into local rows
      setBands((old) =>
        old.map((b) => {
          if (b.isNew) {
            const created = newBandByClientId.get(b.band_id);
            if (!created) return b; // still-blank row, untouched
            const ratingUpdate = ratingsBatchResult.find((r) => r.id === created.id);
            return {
              band_id: created.id,
              name: created.name,
              location: created.location,
              description: created.description,
              url: created.url,
              spotify_url: created.spotify_url,
              average_rating: ratingUpdate ? ratingUpdate.average_rating : created.average_rating,
              isNew: false,
            };
          }

          const fieldUpdate = bandBatchResult.find((r) => r.id === b.band_id);
          const ratingUpdate = ratingsBatchResult.find((r) => r.id === b.band_id);
          if (!fieldUpdate && !ratingUpdate) return b;

          return {
            ...b,
            ...(fieldUpdate
              ? {
                  name: fieldUpdate.name,
                  location: fieldUpdate.location,
                  description: fieldUpdate.description,
                  url: fieldUpdate.url,
                  spotify_url: fieldUpdate.spotify_url,
                  average_rating: fieldUpdate.average_rating,
                }
              : {}),
            ...(ratingUpdate ? { average_rating: ratingUpdate.average_rating } : {}),
          };
        })
      );

      // Refresh the ratings cache with what was just saved
      setRatingsCache((old) => {
        const next = { ...old };
        ratingsPayloadEntries.forEach(({ band_id, rating }) => {
          next[band_id] = { ...(next[band_id] || {}), [user.id]: rating };
        });
        return next;
      });

      // Update originals so untouched fields don't look dirty again
      bandBatchResult.forEach((b) => {
        bandOriginalsRef.current.set(b.id, {
          name: b.name,
          location: b.location,
          description: b.description,
          url: b.url,
          spotify_url: b.spotify_url,
        });
      });

      // Only clear the edits that were actually saved
      const successfulBandFieldKeys = [
        ...existingFieldUpdates.map((e) => String(e.id)),
        ...newRowPayload.filter((e) => newBandByClientId.has(e.client_id)).map((e) => e.client_id),
      ];
      setBandFieldEdits((old) => {
        const next = { ...old };
        successfulBandFieldKeys.forEach((k) => delete next[k]);
        return next;
      });

      const successfulRatingKeys = ratingsPayloadEntries.map((e) => e.key);
      setRatingEdits((old) => {
        const next = { ...old };
        successfulRatingKeys.forEach((k) => delete next[k]);
        return next;
      });
    } catch (e) {
      setError(e.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || bandsLoading) return <div>Loading…</div>;

  return (
    <div className="bandlist-wrapper">
      {error && <div style={{ color: "crimson", marginBottom: 12 }}>{error}</div>}

      <div style={{ marginBottom: 12, display: "flex", gap: 8 }}>
        <button onClick={handleAddRow}>+ Add Band</button>
        <button onClick={handleSave} disabled={saving || dirtyCount === 0}>
          {saving ? "Saving…" : `Save${dirtyCount > 0 ? ` (${dirtyCount})` : ""}`}
        </button>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  style={{
                    textAlign: "left",
                    padding: "8px 12px",
                    borderBottom: "2px solid var(--borders)",
                  }}
                >
                  {header.isPlaceholder ? null : <table.FlexRender header={header} />}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row, i) => (
            <tr
              key={row.id}
              style={{
                backgroundColor: row.original.isNew
                  ? "#fffbe6"
                  : i % 2
                  ? "var(--white)"
                  : "var(--borders)",
                borderBottom: "1px solid var(--grey)",
              }}
            >
              {row.getAllCells().map((cell) => (
                <td key={cell.id} style={{ padding: "8px 12px" }}>
                  <table.FlexRender cell={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <Stack alignItems="center" margin="20px">
        <Pagination
          count={numPages}
          variant="outlined"
          size="large"
          siblingCount={2}
          page={currentPage}
          onChange={(event, value) => setCurrentPage(value)}
        />
      </Stack>
    </div>
  );
};

export default BandReviewTable;
