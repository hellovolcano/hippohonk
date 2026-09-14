const sequelize = require("../../config/connection");

// Belt-and-suspenders: even though config/connection.js already points at a
// separate DATABASE_URL under NODE_ENV=test, this file TRUNCATEs every
// table — refuse to load it at all outside a test run.
if (process.env.NODE_ENV !== "test") {
  throw new Error(
    "tests/helpers/db.js must only be used with NODE_ENV=test — refusing to risk touching a real database."
  );
}

// Wipes every table's rows (but keeps the schema) between tests, so each
// test starts from a clean slate regardless of what earlier tests created.
async function truncateAll() {
  const tableNames = Object.values(sequelize.models)
    .map((model) => `"${model.getTableName()}"`)
    .join(", ");

  if (!tableNames) return;
  await sequelize.query(`TRUNCATE ${tableNames} RESTART IDENTITY CASCADE;`);
}

module.exports = { truncateAll };
