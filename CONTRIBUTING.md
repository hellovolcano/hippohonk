# Contributing to Hippohonk

## Project structure

This is a monorepo with two apps:

- `server/` — Express + Sequelize (Postgres) API
- `client/` — Create React App frontend

## Local setup

1. From the repo root: `npm install` (this also installs `server/` and `client/`'s own dependencies via the root `install` script).
2. Create `server/.env` with real local-development credentials: `DATABASE_URL`, `SESSION_SECRET`, `PORT`, `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`.
3. Set up `server/.env.test` for running tests — see **Server tests** below. This must point at a separate, disposable database, never the one `server/.env` uses.

### Running the app locally

`npm run dev` from the repo root runs the client and server together.

## Testing

### Server tests

**Required before opening a PR that touches anything in `server/`.**

The suite uses **Jest** + **Supertest**, running against a real, isolated Postgres database — never production, and never your regular local development database.

**One-time setup:**

1. Create a dedicated test database, either:
   - locally: `createdb hippohonk_test`, or
   - via Docker (no local Postgres install needed): `docker-compose up -d` from the repo root.
2. Copy `server/.env.test.example` to `server/.env.test` and adjust `DATABASE_URL` if needed (it defaults to the local `createdb` option above). `SPOTIFY_CLIENT_ID`/`SPOTIFY_CLIENT_SECRET` are optional — not every contributor has their own Spotify dev app credentials, and the suite doesn't require them (see below).

**Running the suite:**

```bash
cd server
npm test
```

This sets `NODE_ENV=test`, which is what makes the app read `.env.test`'s `DATABASE_URL` instead of the real one. The schema is dropped and rebuilt from scratch (`sequelize.sync({ force: true })`) on every run, and every table is truncated between individual tests — **`.env.test` must never point at a database you care about.**

**Writing new server tests:**

- Any new route or non-trivial business logic change should come with coverage in `server/tests/`.
- Use the real (test) database for anything touching actual query behavior — aggregates, joins, `GROUP BY`, ordering. This app relies on real Postgres semantics in places, and a mocked/in-memory DB has already been shown to hide real bugs that only appear against a real query engine. `server/tests/helpers/` has factories and DB helpers to keep this easy.
- Do mock external services — tests should never require network access or real third-party credentials. See `server/tests/lineups.test.js` for the pattern used to mock `server/services/spotify.js`.
- The one exception is `server/tests/spotify.test.js`, which has a small block that exercises the real Spotify API — it's automatically skipped unless `SPOTIFY_CLIENT_ID`/`SPOTIFY_CLIENT_SECRET` are set in `.env.test`. Follow that pattern (`describe.skip` gated on the relevant env vars) for anything else that can only meaningfully be tested against a real external service.

### Client tests

Create React App ships Jest + React Testing Library out of the box, but no real test suite exists yet in `client/` — `npm test` there currently only runs the stock CRA boilerplate test. This is a gap, not a deliberate choice; contributions here are welcome.

## Before opening a PR

- [ ] `cd server && npm test` passes
- [ ] `cd client && npm run build` succeeds
