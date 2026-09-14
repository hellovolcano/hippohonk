const { truncateAll } = require("./helpers/db");

afterEach(async () => {
  await truncateAll();
});

// Deliberately no afterAll(() => sequelize.close()) here: this file runs
// once per test file (that's what setupFilesAfterEnv means), and closing
// the shared connection after every individual file broke later files that
// still needed it. One-time-at-the-very-end cleanup belongs in
// globalTeardown.js instead, which — unlike this file — really does only
// run once for the whole suite.
