import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { tableFeatures, useTable } from "@tanstack/react-table";
import { Chip, Stack } from "@mui/material";
import RecommendRoundedIcon from "@mui/icons-material/RecommendRounded";
import { useAuth } from "../auth";
import StyledPagination from "./common/styled-pagination";
import DropDown from "./common/forms/drop-down";
import "./band-review-table.css";

const BANDS_PER_PAGE = 10;
const AUTO_SAVE_DELAY_MS = 1500;

const features = tableFeatures({});

const isNewRowId = (bandId) => typeof bandId === "string" && bandId.startsWith("new-");

// A contentEditable div that fills its cell exactly (no intrinsic sizing
// quirks like a native <input>/<textarea> has). Deliberately uncontrolled:
// React only ever writes into the DOM when the value changes from outside
// and the element isn't focused, so an in-progress edit is never clobbered.
// Enter commits (blurs) single-line fields instead of inserting a newline.
const EditableCell = ({ value, placeholder, multiline = false, onCommit }) => {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (el && document.activeElement !== el) {
      el.textContent = value ?? "";
    }
  }, [value]);

  const handleBlur = (e) => {
    onCommit(e.currentTarget.innerText.trim());
  };

  const handleKeyDown = (e) => {
    if (!multiline && e.key === "Enter") {
      e.preventDefault();
      e.currentTarget.blur();
    }
  };

  return (
    <div
      ref={ref}
      className="editable-cell"
      contentEditable
      suppressContentEditableWarning
      data-placeholder={placeholder}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
    />
  );
};

// The Name cell is special for a new row: the underlying band isn't created
// until this field is filled in and loses focus.
const EditableNameCell = ({ getValue, row, table }) => (
  <EditableCell
    value={getValue()}
    placeholder={row.original.isNew ? "name" : undefined}
    onCommit={(value) => {
      if (row.original.isNew) {
        table.options.meta?.commitNewBandName(row.original.band_id, value);
      } else {
        table.options.meta?.updateBandField(row.original.band_id, "name", value);
      }
    }}
  />
);

const EditableLocationCell = ({ getValue, row, table }) => (
  <EditableCell
    value={getValue()}
    placeholder={row.original.isNew ? "location" : undefined}
    onCommit={(value) => table.options.meta?.updateBandField(row.original.band_id, "location", value)}
  />
);

const EditableDescriptionCell = ({ getValue, row, table }) => (
  <EditableCell
    value={getValue()}
    placeholder={row.original.isNew ? "description" : undefined}
    multiline
    onCommit={(value) => table.options.meta?.updateBandField(row.original.band_id, "description", value)}
  />
);

const makeEditableUrlCell = (field) => {
  const Cell = ({ getValue, row, table }) => (
    <EditableCell
      value={getValue()}
      placeholder="https://…"
      onCommit={(value) => table.options.meta?.updateBandField(row.original.band_id, field, value)}
    />
  );
  return Cell;
};

const EditableUrlCell = makeEditableUrlCell("url");
const EditableSpotifyUrlCell = makeEditableUrlCell("spotify_url");

const ReadOnlyRatingCell = ({ getValue }) => {
  const value = getValue();
  return <span className="review-static-value">{value ?? "—"}</span>;
};

const RATING_SELECT_OPTIONS = [
  { value: "", label: "—" },
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "4", label: "4" },
  { value: "5", label: "5" },
];

// Factory rather than a fixed component: in Listening Party Mode a single
// admin edits every reviewer's column, so each column's cell needs its own
// userId baked in rather than always writing the logged-in user's rating.
const makeEditableRatingCell = (userId) => {
  const Cell = ({ getValue, row, table }) => {
    const initialValue = getValue();

    const handleChange = (e) => {
      const raw = e.target.value;
      const parsed = raw === "" ? null : Number(raw);
      table.options.meta?.updateReviewerRating(row.original.band_id, userId, Number.isFinite(parsed) ? parsed : null);
    };

    return (
      <DropDown
        name={`rating-${row.original.band_id}-${userId}`}
        value={initialValue == null ? "" : String(initialValue)}
        onChange={handleChange}
        options={RATING_SELECT_OPTIONS}
      />
    );
  };
  return Cell;
};

// Its own component (rather than inline in BandReviewTable) so it can be
// force-remounted via a `key` prop whenever we need a genuinely fresh
// useTable() instance — see the comment where it's rendered.
const ReviewTableGrid = ({ columns, data, meta, hideOtherReviewers, listeningPartyMode }) => {
  const table = useTable({
    key: "band-review-table",
    features,
    columns,
    data,
    meta,
  });

  const tableClassName = [
    "review-table",
    hideOtherReviewers && "hide-other-reviewers",
    listeningPartyMode && "listening-party-mode",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="review-table-scroll">
      <table className={tableClassName}>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id}>
                  {header.isPlaceholder ? null : <table.FlexRender header={header} />}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className={row.original.isNew ? "review-row-new" : undefined}>
              {row.getAllCells().map((cell) => (
                <td key={cell.id}>
                  <table.FlexRender cell={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const BandReviewTable = forwardRef(({ bands: initialBands, isLoading: bandsLoading, festivalId, onStateChange, hideOtherReviewers = false, listeningPartyMode = false }, ref) => {
  const { user } = useAuth();
  const [bands, setBands] = useState(initialBands || []);
  const [reviewers, setReviewers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [saving, setSaving] = useState(false);
  const [ratingSort, setRatingSort] = useState(null); // null | "asc" | "desc"

  // Bumped on every field/rating commit, so the auto-save debounce below can
  // reset its timer even when an edit doesn't change dirtyCount's value
  // (e.g. re-editing the same field twice before it saves).
  const [editTick, setEditTick] = useState(0);

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

  // Sort by average rating, if requested. Bands without a rating yet always
  // sort to the end, regardless of direction (matches the rest of the app).
  const sortedBands = useMemo(() => {
    if (!ratingSort) return bands;

    return bands
      .map((band, index) => ({ band, index }))
      .sort((x, y) => {
        const a = x.band.average_rating;
        const b = y.band.average_rating;
        if (a == null && b == null) return x.index - y.index;
        if (a == null) return 1;
        if (b == null) return -1;
        return ratingSort === "asc" ? a - b : b - a;
      })
      .map(({ band }) => band);
  }, [bands, ratingSort]);

  const numPages = Math.max(1, Math.ceil(bands.length / BANDS_PER_PAGE));
  const pagedBands = useMemo(() => {
    const start = (currentPage - 1) * BANDS_PER_PAGE;
    return sortedBands.slice(start, start + BANDS_PER_PAGE);
  }, [sortedBands, currentPage]);

  const toggleRatingSort = () => {
    setCurrentPage(1);
    setRatingSort((prev) => (prev === "asc" ? "desc" : "asc"));
  };

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

  // "Hide other reviewers" keeps only the current user's own rating column,
  // so the remaining columns can expand into the freed-up space.
  const displayedReviewers = useMemo(() => {
    if (!hideOtherReviewers) return visibleReviewers;
    return visibleReviewers.filter((r) => r.id === user?.id);
  }, [visibleReviewers, hideOtherReviewers, user?.id]);

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
    ];

    // Listening Party Mode is for entering ratings live while a band plays —
    // the URL/Spotify link fields aren't relevant there and just take up space.
    if (!listeningPartyMode) {
      cols.push(
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
        }
      );
    }

    cols.push({
        id: "average_rating",
        accessorFn: (band) => band.average_rating,
        header: () => (
          <button type="button" className="review-sort-button" onClick={toggleRatingSort}>
            Average Rating
            <span className="review-sort-arrow">
              {ratingSort === "asc" ? " ▲" : ratingSort === "desc" ? " ▼" : ""}
            </span>
          </button>
        ),
        cell: (info) => (
          <Chip
            label={info.getValue() ?? "—"}
            color="success"
            variant="outlined"
            size="small"
            icon={<RecommendRoundedIcon fontSize="small" />}
          />
        ),
    });

    displayedReviewers.forEach((reviewer) => {
      const isOwnColumn = reviewer.id === user?.id;
      const isEditable = isOwnColumn || listeningPartyMode;
      cols.push({
        id: `reviewer_${reviewer.id}`,
        accessorFn: (band) => {
          const edited = ratingEdits[band.band_id]?.[reviewer.id];
          if (edited !== undefined) return edited;
          return ratingsCache[band.band_id]?.[reviewer.id] ?? null;
        },
        header: reviewer.first_name || `User #${reviewer.id}`,
        cell: isEditable ? makeEditableRatingCell(reviewer.id) : ReadOnlyRatingCell,
      });
    });

    return cols;
  }, [displayedReviewers, user?.id, ratingsCache, ratingEdits, bandFieldEdits, ratingSort, listeningPartyMode]);

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

  const tableMeta = {
    updateReviewerRating: (bandId, userId, newValue) => {
      setRatingEdits((old) => {
        const originalValue = ratingsCache[bandId]?.[userId] ?? null;
        const next = { ...old };
        const bandEdits = { ...(next[bandId] || {}) };

        if (!isNewRowId(bandId) && newValue === originalValue) {
          delete bandEdits[userId];
        } else {
          bandEdits[userId] = newValue;
        }

        if (Object.keys(bandEdits).length === 0) {
          delete next[bandId];
        } else {
          next[bandId] = bandEdits;
        }
        return next;
      });
      setEditTick((t) => t + 1);
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
      setEditTick((t) => t + 1);
    },
    commitNewBandName,
  };

  // TanStack Table v9 is alpha and backed by a store (atoms) that doesn't
  // always pick up new columns/data cleanly after async data (like ratings)
  // arrives post-mount. Keying the grid by "is this page's rating data
  // loaded yet" forces a single fresh useTable() instance exactly when that
  // data becomes available, instead of showing stale/blank rating cells
  // until the whole table happens to remount some other way.
  const pageRatingsReadyKey = pagedBands
    .map((b) => (b.isNew || ratingsCache[b.band_id] ? "1" : "0"))
    .join("");

  const ratingEditCount = Object.values(ratingEdits).reduce(
    (sum, byUser) => sum + Object.keys(byUser).length,
    0
  );
  const dirtyCount = ratingEditCount + Object.keys(bandFieldEdits).length;

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
      // band was never actually created (still-blank new rows). Flattened across
      // users, since Listening Party Mode can edit more than just our own rating.
      const ratingsPayloadEntries = Object.entries(ratingEdits)
        .flatMap(([bandId, byUser]) => {
          const created = newBandByClientId.get(bandId);
          const realId = created ? created.id : Number(bandId);
          return Object.entries(byUser).map(([userId, rating]) => ({
            key: bandId,
            userId: Number(userId),
            band_id: realId,
            rating,
          }));
        })
        .filter((entry) => Number.isFinite(entry.band_id));

      // Our own ratings go through the regular reviewer endpoint; anyone
      // else's (Listening Party Mode only, and only reachable by an admin)
      // go through the admin-only endpoint that can write on their behalf.
      const ownRatingsEntries = ratingsPayloadEntries.filter((e) => e.userId === user.id);
      const otherRatingsEntries = ratingsPayloadEntries.filter((e) => e.userId !== user.id);

      let ratingsBatchResult = [];

      if (ownRatingsEntries.length > 0) {
        const res = await fetch("/api/ratings/batch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            ratings: ownRatingsEntries.map(({ band_id, rating }) => ({ band_id, rating })),
          }),
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.message || "Failed to save ratings");
        }

        const data = await res.json();
        ratingsBatchResult = ratingsBatchResult.concat(data.updated);
      }

      if (otherRatingsEntries.length > 0) {
        const res = await fetch("/api/ratings/batch-admin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            ratings: otherRatingsEntries.map(({ band_id, userId, rating }) => ({
              band_id,
              user_id: userId,
              rating,
            })),
          }),
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.message || "Failed to save ratings");
        }

        const data = await res.json();
        ratingsBatchResult = ratingsBatchResult.concat(data.updated);
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
        ratingsPayloadEntries.forEach(({ band_id, userId, rating }) => {
          next[band_id] = { ...(next[band_id] || {}), [userId]: rating };
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

      setRatingEdits((old) => {
        const next = { ...old };
        ratingsPayloadEntries.forEach(({ key, userId }) => {
          if (!next[key]) return;
          const bandEdits = { ...next[key] };
          delete bandEdits[userId];
          if (Object.keys(bandEdits).length === 0) {
            delete next[key];
          } else {
            next[key] = bandEdits;
          }
        });
        return next;
      });
    } catch (e) {
      setError(e.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  // Let the parent (which owns the shared toolbar) render Add Band/Save
  // buttons that reflect our internal state and can trigger our actions.
  useEffect(() => {
    onStateChange?.({ dirtyCount, saving });
  }, [onStateChange, dirtyCount, saving]);

  // Auto-save: debounce a save a short pause after the most recent edit,
  // instead of firing a request per keystroke/commit. handleSave is read via
  // a ref so the timer isn't reset by unrelated re-renders (only by an
  // actual new edit, via editTick, or dirtyCount/saving settling).
  const handleSaveRef = useRef(handleSave);
  useEffect(() => {
    handleSaveRef.current = handleSave;
  });

  useEffect(() => {
    if (dirtyCount === 0 || saving) return;

    const timer = setTimeout(() => {
      handleSaveRef.current();
    }, AUTO_SAVE_DELAY_MS);

    return () => clearTimeout(timer);
  }, [editTick, dirtyCount, saving]);

  useImperativeHandle(ref, () => ({
    addRow: handleAddRow,
    save: handleSave,
  }));

  if (isLoading || bandsLoading) return <div>Loading…</div>;

  return (
    <div className="review-table-wrapper">
      {error && <div className="error-message">{error}</div>}

      <ReviewTableGrid
        key={pageRatingsReadyKey}
        columns={columns}
        data={pagedBands}
        meta={tableMeta}
        hideOtherReviewers={hideOtherReviewers}
        listeningPartyMode={listeningPartyMode}
      />

      <Stack alignItems="center" margin="20px">
        <StyledPagination
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
});

export default BandReviewTable;
