const express = require("express");
const compression = require("compression");
const routes = require("./controllers");
const sequelize = require("./config/connection");
const path = require("path");
const session = require("express-session");
const SequelizeStore = require("connect-session-sequelize")(session.Store);

// Builds the Express app without starting it listening — kept separate from
// server.js so tests can import it directly (via supertest) without binding
// a real port. server.js is the thin "actually run this" entry point.
const app = express();

// Heroku sits behind a router/proxy; without this, Express can't reliably
// tell the connection is HTTPS, which breaks the `secure: true` session
// cookie below in production (login would "succeed" but never persist).
app.set("trust proxy", 1);

// Gzip every response (API JSON + the static client bundle) — Express
// doesn't do this on its own.
app.use(compression());

const sess = {
  secret: process.env.SESSION_SECRET,
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production", // true on heroku
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
  },
  resave: false,
  saveUninitialized: false,
  store: new SequelizeStore({ db: sequelize }),
};

app.use(session(sess));
sess.store.sync();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === "production") {
  const buildPath = path.join(__dirname, "..", "client", "build");

  // CRA content-hashes everything under /static (main.<hash>.js, etc.), so a
  // given filename's content never changes — safe to cache for a year.
  // Everything else (index.html, favicon.ico, manifest.json) keeps default,
  // short-lived caching so a new deploy is picked up on the next visit
  // instead of serving a stale index.html referencing old bundle hashes.
  app.use(
    "/static",
    express.static(path.join(buildPath, "static"), {
      maxAge: "1y",
      immutable: true,
    })
  );
  app.use(express.static(buildPath));
}
app.get("/ping", (req, res) => res.send("pong"));
app.use(routes);

// sessionStore is exposed alongside app so tests can call
// sessionStore.stopExpiringSessions() in teardown — otherwise its
// background cleanup interval (SequelizeStore's checkExpirationInterval)
// keeps the process alive and Jest never exits cleanly.
module.exports = { app, sessionStore: sess.store };
