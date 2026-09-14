// Never hit the real Spotify API from tests — slow, flaky, and needs real
// credentials. This also lets us assert on exactly what URL the route
// resolved an image for, which is what the regression test below needs.
jest.mock("../services/spotify", () => ({
  getArtistImage: jest.fn(),
}));

const request = require("supertest");
const { app } = require("../app");
const { getArtistImage } = require("../services/spotify");
const { createBand, createFestival, createLineup } = require("./helpers/factories");

beforeEach(() => {
  getArtistImage.mockReset();
});

describe("GET /api/lineups/:festivalId", () => {
  it("lists the festival's bands", async () => {
    getArtistImage.mockResolvedValue(null);
    const festival = await createFestival();
    const band = await createBand({ name: "Lineup Band" });
    await createLineup({ festival_id: festival.id, band_id: band.id });

    const res = await request(app).get(`/api/lineups/${festival.id}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe("Lineup Band");
  });

  // Regression test: spotify_url reaches this model via a raw Sequelize.col
  // alias (Lineup has no such attribute of its own), so accessing it as a
  // direct instance property silently returns undefined instead of the
  // real value — getArtistImage(undefined) always resolves to "no image."
  // See lineup-routes.js's comment for the full explanation.
  it("resolves each band's real spotify_url, not undefined, when fetching its image", async () => {
    getArtistImage.mockResolvedValue("https://i.scdn.co/image/fake");
    const festival = await createFestival();
    const band = await createBand({ spotify_url: "https://open.spotify.com/artist/abc123" });
    await createLineup({ festival_id: festival.id, band_id: band.id });

    const res = await request(app).get(`/api/lineups/${festival.id}`);

    expect(res.status).toBe(200);
    expect(getArtistImage).toHaveBeenCalledWith("https://open.spotify.com/artist/abc123");
    expect(res.body[0].spotify_image).toBe("https://i.scdn.co/image/fake");
  });

  it("returns null spotify_image for a band with no spotify_url", async () => {
    getArtistImage.mockResolvedValue(null);
    const festival = await createFestival();
    const band = await createBand({ spotify_url: null });
    await createLineup({ festival_id: festival.id, band_id: band.id });

    const res = await request(app).get(`/api/lineups/${festival.id}`);
    expect(res.body[0].spotify_image).toBeNull();
  });
});

describe("GET /api/lineups", () => {
  it("filters by band_id", async () => {
    const bandA = await createBand();
    const bandB = await createBand();
    const festival = await createFestival();
    await createLineup({ festival_id: festival.id, band_id: bandA.id });
    await createLineup({ festival_id: festival.id, band_id: bandB.id });

    const res = await request(app).get(`/api/lineups?band_id=${bandA.id}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].band_id).toBe(bandA.id);
  });
});
