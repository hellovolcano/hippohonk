const bcrypt = require("bcrypt");
const { User, Band, Genre, Festival, Lineup, Rating } = require("../../models");

let counter = 0;
function unique(prefix) {
  counter += 1;
  return `${prefix}${counter}`;
}

// Low bcrypt rounds here — this is only ever run against the disposable
// test database, and keeping it fast matters more than realism.
async function createUser(overrides = {}) {
  const password = overrides.password || "password123";
  const password_digest = await bcrypt.hash(password, 4);

  const user = await User.create({
    email: overrides.email || `${unique("user")}@example.com`,
    password_digest,
    first_name: overrides.first_name ?? "Test",
    last_name: overrides.last_name ?? "User",
    admin: overrides.admin ?? false,
    reviewer: overrides.reviewer ?? false,
    active: overrides.active ?? false,
  });

  return { user, password };
}

async function createGenre(overrides = {}) {
  return Genre.create({ name: overrides.name || unique("Genre") });
}

async function createBand(overrides = {}) {
  let genre_id = overrides.genre_id;
  if (!genre_id) {
    const genre = await createGenre();
    genre_id = genre.id;
  }

  return Band.create({
    name: overrides.name || unique("Band"),
    genre_id,
    location: overrides.location ?? "Test City",
    description: overrides.description ?? null,
    url: overrides.url ?? null,
    spotify_url: overrides.spotify_url ?? null,
  });
}

async function createFestival(overrides = {}) {
  return Festival.create({
    name: overrides.name || unique("Festival"),
    slug: overrides.slug || unique("festival-slug-"),
    date: overrides.date ?? "2027-01-01",
  });
}

async function createLineup(overrides = {}) {
  const band = overrides.band_id ? null : await createBand();
  const festival = overrides.festival_id ? null : await createFestival();

  return Lineup.create({
    band_id: overrides.band_id || band.id,
    festival_id: overrides.festival_id || festival.id,
  });
}

async function createRating(overrides = {}) {
  const band = overrides.band_id ? null : await createBand();
  const user = overrides.user_id ? null : (await createUser()).user;

  return Rating.create({
    band_id: overrides.band_id || band.id,
    user_id: overrides.user_id || user.id,
    rating: overrides.rating ?? 4,
  });
}

module.exports = {
  createUser,
  createGenre,
  createBand,
  createFestival,
  createLineup,
  createRating,
};
