module.exports = {
  testEnvironment: "node",
  globalSetup: "<rootDir>/tests/globalSetup.js",
  globalTeardown: "<rootDir>/tests/globalTeardown.js",
  setupFilesAfterEnv: ["<rootDir>/tests/setupAfterEnv.js"],
  testMatch: ["<rootDir>/tests/**/*.test.js"],
  testTimeout: 15000,
  // sequelize.close() (called in tests/globalTeardown.js) doesn't always
  // release the underlying pg socket at the OS level immediately — a known
  // rough edge, not a real leak (all tests finish in well under a second;
  // only process exit is delayed by Sequelize's ~10s default pool idle
  // timeout). forceExit is the standard mitigation for this combination.
  forceExit: true,
};
