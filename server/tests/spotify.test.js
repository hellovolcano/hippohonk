const { getArtistImage } = require("../services/spotify");

describe("getArtistImage", () => {
  it("returns null for a missing spotify_url, without any network call", async () => {
    expect(await getArtistImage(null)).toBeNull();
    expect(await getArtistImage(undefined)).toBeNull();
    expect(await getArtistImage("")).toBeNull();
  });

  it("returns null for a URL that isn't a Spotify artist link, without any network call", async () => {
    expect(await getArtistImage("https://example.com/not-spotify")).toBeNull();
    expect(await getArtistImage("https://open.spotify.com/album/notAnArtist123")).toBeNull();
  });

  // SPOTIFY_CLIENT_ID/SECRET aren't guaranteed to be set locally — not every
  // contributor has their own Spotify dev app credentials, and .env.test
  // deliberately doesn't require them (every other test mocks this service
  // instead, see tests/lineups.test.js). This block only runs when they're
  // actually present, so the suite still passes cleanly without them.
  const hasSpotifyCredentials = Boolean(process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_SECRET);
  const describeWithCredentials = hasSpotifyCredentials ? describe : describe.skip;

  describeWithCredentials("with real Spotify credentials configured", () => {
    it("fetches a real artist's image from the live API", async () => {
      // Portugal. the Man — a real, stable artist with a profile image, used
      // elsewhere in this codebase's own manual testing for the same reason.
      const image = await getArtistImage("https://open.spotify.com/artist/4kI8Ie27vjvonwaB2ePh8T");
      expect(typeof image).toBe("string");
      expect(image).toMatch(/^https:\/\//);
    }, 15000);
  });
});
