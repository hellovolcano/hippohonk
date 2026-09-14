const request = require("supertest");
const { app } = require("../app");

describe("GET /ping", () => {
  it("responds so we know the app boots and the test DB connects", async () => {
    const res = await request(app).get("/ping");
    expect(res.status).toBe(200);
    expect(res.text).toBe("pong");
  });
});
