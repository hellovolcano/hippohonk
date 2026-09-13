import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../auth";

export default function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/users/${id}`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data) => {
        if (!cancelled) setProfile(data);
      })
      .catch(() => {
        if (!cancelled) setStatus("User not found");
      });

    fetch(`/api/ratings?user_id=${id}`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (!cancelled) setRatings(Array.isArray(data) ? data : []);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (status) return <p>{status}</p>;
  if (!profile) return null;

  const isOwnProfile = String(currentUser?.id) === String(profile.id);

  // API already orders by created_at DESC
  const recentRatings = ratings.slice(0, 10);

  const topRatings = [...ratings]
    .sort((a, b) => {
      if (b.rating !== a.rating) return b.rating - a.rating;
      return new Date(b.createdAt) - new Date(a.createdAt);
    })
    .slice(0, 10);

  return (
    <div style={{ maxWidth: 400, margin: "2rem auto", fontFamily: "sans-serif" }}>
      <h2>
        {profile.first_name} {profile.last_name}
      </h2>

      <div>
        {profile.reviewer && (
          <span style={{ marginRight: 8, padding: "2px 8px", border: "1px solid #999", borderRadius: 12 }}>
            reviewer
          </span>
        )}
        {profile.admin && (
          <span style={{ padding: "2px 8px", border: "1px solid #999", borderRadius: 12 }}>
            admin
          </span>
        )}
      </div>

      {profile.description && (
        <p style={{ marginTop: 12 }}>{profile.description}</p>
      )}

      {isOwnProfile && (
        <button style={{ marginTop: 12 }} onClick={() => navigate("/profile/edit")}>
          Edit
        </button>
      )}

      <div style={{ marginTop: 24 }}>
        <h3>Most Recent Ratings</h3>
        {recentRatings.length === 0 ? (
          <p>No ratings yet</p>
        ) : (
          <ul>
            {recentRatings.map((r) => (
              <li key={r.id}>
                <a href={`/band/${r.band_id}`}>{r.band?.name || `Band #${r.band_id}`}</a>
                {": "}
                {r.rating}/5
              </li>
            ))}
          </ul>
        )}
      </div>

      <div style={{ marginTop: 24 }}>
        <h3>Top Rated Bands</h3>
        {topRatings.length === 0 ? (
          <p>No ratings yet</p>
        ) : (
          <ul>
            {topRatings.map((r) => (
              <li key={r.id}>
                <a href={`/band/${r.band_id}`}>{r.band?.name || `Band #${r.band_id}`}</a>
                {": "}
                {r.rating}/5
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
