let cachedToken = null;
let tokenExpiresAt = 0;

async function getAccessToken() {
  if (cachedToken && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Spotify client credentials are not configured');
  }

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!res.ok) {
    throw new Error('Failed to authenticate with Spotify');
  }

  const data = await res.json();
  cachedToken = data.access_token;
  // Refresh a minute early to avoid using a token that expires mid-request
  tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000;

  return cachedToken;
}

function extractArtistId(spotifyUrl) {
  if (!spotifyUrl) return null;
  const match = String(spotifyUrl).match(/artist\/([a-zA-Z0-9]+)/);
  return match ? match[1] : null;
}

// In-memory cache of artist_id -> { image, expiresAt }, so repeated lookups
// for the same artist (e.g. paging back and forth) don't re-hit Spotify.
const imageCache = new Map();
const IMAGE_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

async function getArtistImage(spotifyUrl) {
  const artistId = extractArtistId(spotifyUrl);
  if (!artistId) return null;

  const cached = imageCache.get(artistId);
  if (cached && Date.now() < cached.expiresAt) {
    return cached.image;
  }

  const token = await getAccessToken();

  const res = await fetch(`https://api.spotify.com/v1/artists/${artistId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    return null;
  }

  const data = await res.json();
  const image = Array.isArray(data.images) && data.images.length > 0 ? data.images[0].url : null;

  imageCache.set(artistId, { image, expiresAt: Date.now() + IMAGE_CACHE_TTL_MS });

  return image;
}

module.exports = { getArtistImage };
