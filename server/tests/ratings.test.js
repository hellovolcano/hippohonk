const request = require("supertest");
const { app } = require("../app");
const { createUser, createBand, createRating } = require("./helpers/factories");
const { agentLoggedInAs } = require("./helpers/auth");

describe("GET /api/ratings?band_id=", () => {
  it("only shows ratings from active reviewers by default", async () => {
    const band = await createBand();
    const activeReviewer = await createUser({ active: true, reviewer: true });
    const inactiveReviewer = await createUser({ active: false, reviewer: true });
    await createRating({ band_id: band.id, user_id: activeReviewer.user.id, rating: 5 });
    await createRating({ band_id: band.id, user_id: inactiveReviewer.user.id, rating: 1 });

    const res = await request(app).get(`/api/ratings?band_id=${band.id}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].user_id).toBe(activeReviewer.user.id);
  });

  it("bypasses the active/reviewer filter with all=true", async () => {
    const band = await createBand();
    const inactiveReviewer = await createUser({ active: false, reviewer: true });
    await createRating({ band_id: band.id, user_id: inactiveReviewer.user.id, rating: 3 });

    const res = await request(app).get(`/api/ratings?band_id=${band.id}&all=true`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  it("supports comma-separated band_id for batch lookups", async () => {
    const bandA = await createBand();
    const bandB = await createBand();
    const reviewer = await createUser({ active: true, reviewer: true });
    await createRating({ band_id: bandA.id, user_id: reviewer.user.id, rating: 4 });
    await createRating({ band_id: bandB.id, user_id: reviewer.user.id, rating: 2 });

    const res = await request(app).get(`/api/ratings?band_id=${bandA.id},${bandB.id}&all=true`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });
});

describe("POST /api/ratings", () => {
  it("requires an active session", async () => {
    const band = await createBand();
    const res = await request(app).post("/api/ratings").send({ band_id: band.id, rating: 5 });
    expect(res.status).toBe(401);
  });

  it("creates a rating for the logged-in user", async () => {
    const band = await createBand();
    const { user, password } = await createUser({ email: "rater@example.com" });
    const agent = await agentLoggedInAs(user, password);

    const res = await agent.post("/api/ratings").send({ band_id: band.id, rating: 5 });
    expect(res.status).toBe(201);
    expect(res.body.user_id).toBe(user.id);
    expect(res.body.rating).toBe(5);
  });
});

describe("POST /api/ratings/batch", () => {
  it("requires a reviewer session", async () => {
    const { user, password } = await createUser({ email: "notreviewer@example.com" });
    const band = await createBand();
    const agent = await agentLoggedInAs(user, password);

    const res = await agent.post("/api/ratings/batch").send({ ratings: [{ band_id: band.id, rating: 4 }] });
    expect(res.status).toBe(403);
  });

  it("creates/updates ratings and returns recalculated averages", async () => {
    const { user, password } = await createUser({ email: "batchreviewer@example.com", reviewer: true });
    const band = await createBand();
    const agent = await agentLoggedInAs(user, password);

    const res = await agent.post("/api/ratings/batch").send({ ratings: [{ band_id: band.id, rating: 5 }] });
    expect(res.status).toBe(200);
    expect(res.body.updated).toHaveLength(1);
    expect(Number(res.body.updated[0].average_rating)).toBe(5);
  });

  it("deletes a rating when given a null rating", async () => {
    const { user, password } = await createUser({ email: "unrater@example.com", reviewer: true });
    const band = await createBand();
    const agent = await agentLoggedInAs(user, password);

    await agent.post("/api/ratings/batch").send({ ratings: [{ band_id: band.id, rating: 3 }] });
    const res = await agent.post("/api/ratings/batch").send({ ratings: [{ band_id: band.id, rating: null }] });

    expect(res.status).toBe(200);
    const stillVisible = await request(app).get(`/api/ratings?band_id=${band.id}&all=true`);
    expect(stillVisible.body).toHaveLength(0);
  });
});
