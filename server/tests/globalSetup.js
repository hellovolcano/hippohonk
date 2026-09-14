// Runs once, before any test file. Rebuilds the test database's schema
// from scratch. NODE_ENV=test (set by the npm "test" script) is what makes
// config/connection.js point at server/.env.test's DATABASE_URL instead of
// the real one — never run this outside that.
module.exports = async () => {
  if (process.env.NODE_ENV !== "test") {
    throw new Error(
      "Refusing to run the test suite's globalSetup outside NODE_ENV=test — " +
        "this drops and recreates every table on whatever DATABASE_URL is active."
    );
  }

  const sequelize = require("../config/connection");

  // Register every model as a side effect of requiring it, so sync() below
  // has something to build. Deliberately requiring ../models directly here
  // instead of ../app: requiring the full app would also load every route
  // file (and whatever they import, like services/spotify) into a module
  // cache that — for reasons not fully pinned down, but confirmed by
  // testing — ends up shared with the actual test run. That left routes'
  // captured references pointing at the real, un-mocked service instead of
  // whatever a test file's jest.mock() set up later.
  require("../models");

  // Also register connect-session-sequelize's own Session model (used by
  // express-session), without pulling in the rest of the app.
  const session = require("express-session");
  const SequelizeStore = require("connect-session-sequelize")(session.Store);
  new SequelizeStore({ db: sequelize });

  await sequelize.sync({ force: true });
  // Deliberately not calling sequelize.close() here — despite globalSetup
  // supposedly running in its own process, closing it here was leaving the
  // actual test run's connection manager unusable. Letting the process
  // exit naturally is enough.
};
