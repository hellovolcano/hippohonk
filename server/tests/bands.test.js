const request = require("supertest");
const { app } = require("../app");
const { createUser, createBand, createGenre, createRating } = require("./helpers/factories");
const { agentLoggedInAs } = require("./helpers/auth");

describe("GET /api/bands", () => {
  it("lists bands", async () => {
    await createBand({ name: "Band A" });
    await createBand({ name: "Band B" });

    const res = await request(app).get("/api/bands");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body.map((b) => b.name).sort()).toEqual(["Band A", "Band B"]);
  });

  it("filters by genre_id", async () => {
    const rock = await createGenre({ name: "Rock" });
    const jazz = await createGenre({ name: "Jazz" });
    await createBand({ name: "Rock Band", genre_id: rock.id });
    await createBand({ name: "Jazz Band", genre_id: jazz.id });

    const res = await request(app).get(`/api/bands?genre_id=${rock.id}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe("Rock Band");
  });

  it("rejects a non-numeric genre_id", async () => {
    const res = await request(app).get("/api/bands?genre_id=not-a-number");
    expect(res.status).toBe(400);
  });

  it("respects limit, capped at 100", async () => {
    for (let i = 0; i < 3; i += 1) {
      await createBand({ name: `Band ${i}` });
    }

    const res = await request(app).get("/api/bands?limit=2");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  it("includes each band's computed average_rating", async () => {
    const band = await createBand({ name: "Rated Band" });
    await createRating({ band_id: band.id, rating: 4 });
    await createRating({ band_id: band.id, rating: 2 });

    const res = await request(app).get("/api/bands");
    const found = res.body.find((b) => b.band_id === band.id);
    expect(Number(found.average_rating)).toBe(3);
  });
});

describe("GET /api/bands/:id", () => {
  it("returns a single band", async () => {
    const band = await createBand({ name: "Solo Band" });

    const res = await request(app).get(`/api/bands/${band.id}`);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Solo Band");
  });

  it("returns null for a nonexistent band rather than erroring", async () => {
    const res = await request(app).get("/api/bands/999999");
    expect(res.status).toBe(200);
    expect(res.body).toBeNull();
  });
});

describe("POST /api/bands", () => {
  it("requires an active session", async () => {
    const genre = await createGenre();
    const res = await request(app).post("/api/bands").send({ name: "New Band", genre_id: genre.id });
    expect(res.status).toBe(401);
  });

  it("is forbidden for a logged-in non-reviewer", async () => {
    const { user, password } = await createUser({ email: "notareviewer@example.com" });
    const genre = await createGenre();
    const agent = await agentLoggedInAs(user, password);

    const res = await agent.post("/api/bands").send({ name: "New Band", genre_id: genre.id });
    expect(res.status).toBe(403);
  });

  it("creates a band for a reviewer", async () => {
    const { user, password } = await createUser({ email: "reviewer@example.com", reviewer: true });
    const genre = await createGenre();
    const agent = await agentLoggedInAs(user, password);

    const res = await agent.post("/api/bands").send({ name: "New Band", genre_id: genre.id });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe("New Band");
  });
});

describe("PUT /api/bands/:id", () => {
  it("requires a name and genre_id", async () => {
    const { user, password } = await createUser({ email: "editor@example.com", reviewer: true });
    const band = await createBand();
    const agent = await agentLoggedInAs(user, password);

    const res = await agent.put(`/api/bands/${band.id}`).send({ name: "", genre_id: "" });
    expect(res.status).toBe(400);
  });
});
