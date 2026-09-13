import { useEffect, useState } from "react";

// Resolves a Spotify artist URL to that artist's image, if any.
// Returns null (with loading:false) when there's no URL, the lookup
// fails, or Spotify simply has no image for that artist - callers
// should fall back to their own default image in all of those cases.
export function useSpotifyArtistImage(spotifyUrl) {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(!!spotifyUrl);

  useEffect(() => {
    if (!spotifyUrl) {
      setImageUrl(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    fetch(`/api/spotify/artist-image?spotify_url=${encodeURIComponent(spotifyUrl)}`)
      .then((res) => (res.ok ? res.json() : { image: null }))
      .then((data) => {
        if (!cancelled) setImageUrl(data.image || null);
      })
      .catch(() => {
        if (!cancelled) setImageUrl(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [spotifyUrl]);

  return { imageUrl, loading };
}
