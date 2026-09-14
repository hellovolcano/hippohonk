// Runs once, after every test file has finished — unlike
// tests/setupAfterEnv.js's hooks, which run per test file. Closing the
// shared DB connection here (rather than per-file) is what actually needs
// to happen exactly once, at the very end.
module.exports = async () => {
  const sequelize = require("../config/connection");
  await sequelize.close();
};
