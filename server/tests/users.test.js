const request = require("supertest");
const { app } = require("../app");
const { createUser } = require("./helpers/factories");
const { agentLoggedInAs } = require("./helpers/auth");

describe("POST /api/users/signup", () => {
  it("creates an account and logs the session in", async () => {
    const res = await request(app)
      .post("/api/users/signup")
      .send({ email: "new@example.com", password: "password123" });

    expect(res.status).toBe(201);
    expect(res.body.email).toBe("new@example.com");
    expect(res.body.password_digest).toBeUndefined();
  });

  it("rejects a missing password", async () => {
    const res = await request(app).post("/api/users/signup").send({ email: "no-pw@example.com" });
    expect(res.status).toBe(400);
  });

  it("rejects a duplicate email", async () => {
    await createUser({ email: "taken@example.com" });

    const res = await request(app)
      .post("/api/users/signup")
      .send({ email: "taken@example.com", password: "password123" });

    expect(res.status).toBe(400);
  });
});

describe("POST /api/users/login", () => {
  it("logs in with correct credentials", async () => {
    const { user, password } = await createUser({ email: "login@example.com" });

    const res = await request(app).post("/api/users/login").send({ email: user.email, password });

    expect(res.status).toBe(200);
    expect(res.body.email).toBe(user.email);
  });

  it("rejects an incorrect password", async () => {
    const { user } = await createUser({ email: "wrongpw@example.com" });

    const res = await request(app)
      .post("/api/users/login")
      .send({ email: user.email, password: "not-the-password" });

    expect(res.status).toBe(400);
  });

  it("rejects a nonexistent email", async () => {
    const res = await request(app)
      .post("/api/users/login")
      .send({ email: "nobody@example.com", password: "whatever" });

    expect(res.status).toBe(400);
  });
});

describe("GET /api/users/me", () => {
  it("requires an active session", async () => {
    const res = await request(app).get("/api/users/me");
    expect(res.status).toBe(401);
  });

  it("returns the logged-in user's own profile", async () => {
    const { user, password } = await createUser({ email: "me@example.com", first_name: "Me" });
    const agent = await agentLoggedInAs(user, password);

    const res = await agent.get("/api/users/me");
    expect(res.status).toBe(200);
    expect(res.body.email).toBe("me@example.com");
    expect(res.body.first_name).toBe("Me");
  });
});

describe("PATCH /api/users/:id/role", () => {
  it("is forbidden for a non-admin", async () => {
    const { user, password } = await createUser({ email: "regular@example.com" });
    const other = await createUser({ email: "target@example.com" });
    const agent = await agentLoggedInAs(user, password);

    const res = await agent.patch(`/api/users/${other.user.id}/role`).send({ reviewer: true });
    expect(res.status).toBe(403);
  });

  it("lets an admin promote another user to reviewer", async () => {
    const { user: admin, password } = await createUser({ email: "admin@example.com", admin: true });
    const target = await createUser({ email: "promote-me@example.com" });
    const agent = await agentLoggedInAs(admin, password);

    const res = await agent.patch(`/api/users/${target.user.id}/role`).send({ reviewer: true });
    expect(res.status).toBe(200);
    expect(res.body.reviewer).toBe(true);
  });
});

describe("GET /api/users/:id (public profile)", () => {
  it("returns a limited public view without needing to be logged in", async () => {
    const { user } = await createUser({ email: "public@example.com", first_name: "Public" });

    const res = await request(app).get(`/api/users/${user.id}`);
    expect(res.status).toBe(200);
    expect(res.body.first_name).toBe("Public");
    expect(res.body.email).toBeUndefined();
    expect(res.body.password_digest).toBeUndefined();
  });

  it("404s for a user that doesn't exist", async () => {
    const res = await request(app).get("/api/users/999999");
    expect(res.status).toBe(404);
  });
});

describe("POST /api/users/logout", () => {
  it("ends the session", async () => {
    const { user, password } = await createUser({ email: "logout@example.com" });
    const agent = await agentLoggedInAs(user, password);

    const logoutRes = await agent.post("/api/users/logout");
    expect(logoutRes.status).toBe(204);

    const meRes = await agent.get("/api/users/me");
    expect(meRes.status).toBe(401);
  });
});
