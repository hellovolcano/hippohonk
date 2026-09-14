const request = require("supertest");
const { app } = require("../../app");

// supertest's plain request(app) sends a fresh, cookieless request every
// call — request.agent(app) persists cookies across calls on the same
// agent, which is what session-based login/auth needs here.
async function agentLoggedInAs(user, password) {
  const agent = request.agent(app);
  await agent.post("/api/users/login").send({ email: user.email, password }).expect(200);
  return agent;
}

module.exports = { agentLoggedInAs };
