import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../auth";

import CommonChip from "../components/common/common-chip";
import SectionWrapper from "../components/common/section-wrapper";
import Button from "../components/common/forms/button";
import BandImage from "../components/band-image";
import { useSpotifyArtistImage } from "../hooks/useSpotifyArtistImage";

// ✅ import your new form
import BandForm from "../components/band-form"; // <-- adjust path to where you saved BandForm

const Band = () => {
  const { isLoggedIn, isReviewer, loading: authLoading } = useAuth();

  const { id } = useParams();
  const apiLink = "/api/bands/" + id;

  const [bandInfo, setBandInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [ratings, setRatings] = useState([]);
  const [festivals, setFestivals] = useState([]);

  const [isEditing, setIsEditing] = useState(false);

  const { imageUrl: spotifyImageUrl } = useSpotifyArtistImage(bandInfo?.spotify_url);

  useEffect(() => {
    let cancelled = false;

    async function loadBand() {
      try {
        const res = await fetch(apiLink, { credentials: "include" });
        const data = await res.json();
        if (!cancelled) {
          setBandInfo(data);
          setIsLoading(false);
        }
      } catch (err) {
        console.log(err.message);
        if (!cancelled) setIsLoading(false);
      }
    }

    async function loadRatings() {
      try {
        const res = await fetch(`/api/ratings?band_id=${id}`, { credentials: "include" });
        const data = await res.json();
        if (!cancelled) setRatings(Array.isArray(data) ? data : []);
      } catch (err) {
        console.log(err.message);
      }
    }

    async function loadFestivals() {
      try {
        const res = await fetch(`/api/lineups?band_id=${id}`, { credentials: "include" });
        const data = await res.json();
        if (!cancelled) setFestivals(Array.isArray(data) ? data : []);
      } catch (err) {
        console.log(err.message);
      }
    }

    loadBand();
    loadRatings();
    loadFestivals();
    return () => {
      cancelled = true;
    };
  }, [apiLink, id]);

  if (isLoading || authLoading) return <div>Loading…</div>;
  if (!bandInfo) return <div>Band not found</div>;

  // ✅ If editing, show the form in edit mode
  if (isEditing) {
    return (
      <div className="single-band-main-wrapper">
        <div className="reviewer-banner">
          <Button onClick={() => setIsEditing(false)}>Cancel</Button>
        </div>

        <div className="band-wrapper">
          <div className="section-wrapper white-bg" style={{ padding: 16 }}>
            <BandForm
              mode="edit"
              bandId={id}
              initialBand={bandInfo}
              onSuccess={(updatedBand) => {
                // If your API returns the full updated band, use it directly
                // Otherwise, you can re-fetch.
                setBandInfo(updatedBand || bandInfo);
                setIsEditing(false);
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  // ✅ Normal read-only band view
  return (
    <div className="single-band-main-wrapper">
      {isReviewer && isLoggedIn && (
        <div className="reviewer-banner">
          <Button onClick={() => setIsEditing(true)}>Edit Band</Button>
          <Button>Delete</Button>
        </div>
      )}

      <div className="band-wrapper">
        <div className="section-wrapper white-bg">
          <div className="section-title single-band-divs">
            <div className="single-band-image">
              <BandImage src={bandInfo.image} spotifyUrl={bandInfo.spotify_url} />
              {spotifyImageUrl && (
                <div className="band-image-attribution">
                  Photo via{" "}
                  <a href={bandInfo.spotify_url} target="_blank" rel="noreferrer">
                    Spotify
                  </a>
                </div>
              )}
            </div>
            <div className="single-band-title-block">
              <h1 className="section-title">{bandInfo.name}</h1>
              <span>{bandInfo.location}</span>
              <div className="single-band-description">{bandInfo.description}</div>

              {festivals.length > 0 && (
                <div className="single-band-festivals">
                  {festivals.map((f) => (
                    <a key={f.id} href={`/festivals/${f.festival_slug}`}>
                      <CommonChip genre={f.festival_name} />
                    </a>
                  ))}
                </div>
              )}
            </div>

          </div>

          <div className="single-band-page">

            <div className="right-band-info">
              <SectionWrapper title="Band Links" className="h3-section-wrapper">
                {!bandInfo.url && !bandInfo.spotify_url ? (
                  <div>No links yet</div>
                ) : (
                  <ul>
                    {bandInfo.url && (
                      <li>
                        <a href={bandInfo.url} target="_blank" rel="noreferrer">
                          Website
                        </a>
                      </li>
                    )}
                    {bandInfo.spotify_url && (
                      <li>
                        <a href={bandInfo.spotify_url} target="_blank" rel="noreferrer">
                          Spotify
                        </a>
                      </li>
                    )}
                  </ul>
                )}
              </SectionWrapper>

              <SectionWrapper title="Genre" className="h3-section-wrapper">
                <CommonChip genre={bandInfo.genre_name} />
              </SectionWrapper>
            </div>
          </div>

          <SectionWrapper title="Ratings" className="h3-section-wrapper">
            {ratings.length === 0 ? (
              <div>No ratings yet</div>
            ) : (
              <ul>
                {ratings.map((r) => (
                  <li key={r.id}>
                    <a href={`/profile/${r.user_id}`}>
                      {r.user?.first_name || `User #${r.user_id}`}
                    </a>
                    {": "}
                    {r.rating}/5
                  </li>
                ))}
              </ul>
            )}
          </SectionWrapper>
        </div>
      </div>
    </div>
  );
};

export default Band;
