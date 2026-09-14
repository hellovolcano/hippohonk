const sequelize = require("../config/connection");
const { truncateAll } = require("./helpers/db");

afterEach(async () => {
  await truncateAll();
});

afterAll(async () => {
  // Required lazily, here, rather than at module top-level: this file runs
  // before every test file, so an eager require("../app") would force the
  // real (unmocked) routes/services to load and cache before a test file's
  // own jest.mock() of one of their dependencies (see lineups.test.js) ever
  // got a chance to register.
  const { sessionStore } = require("../app");
  sessionStore.stopExpiringSessions();
  await sequelize.close();
});
