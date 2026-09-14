const router = require('express').Router()
const sequelize = require('../../config/connection')
const { Band, Genre, Rating } = require('../../models')
const Sequelize = require('sequelize')
const { Router } = require('express')
const requireReviewer = require('../../middleware/reviewer')
const { getArtistImage } = require('../../services/spotify')

// Resolves each band's Spotify artist image server-side (in parallel, and
// cached per-artist in services/spotify.js) so the client gets it inline
// instead of firing its own request per band.
async function withSpotifyImages(bands) {
  const images = await Promise.all(bands.map((b) => getArtistImage(b.spotify_url)));
  return bands.map((b, i) => ({ ...b, spotify_image: images[i] }));
}

// Find all bands (with optional filters)
router.get("/", async (req, res) => {
  const { genre_id, limit } = req.query;

  const where = {};

  if (genre_id !== undefined) {
    const parsed = parseInt(genre_id, 10);
    if (Number.isNaN(parsed)) {
      return res.status(400).json({
        error: "Invalid query parameter",
        message: "genre_id must be a number",
      });
    }
    where.genre_id = parsed;
  }

  let parsedLimit;
  if (limit !== undefined) {
    parsedLimit = parseInt(limit, 10);
    if (Number.isNaN(parsedLimit) || parsedLimit <= 0) {
      return res.status(400).json({
        error: "Invalid query parameter",
        message: "limit must be a positive number",
      });
    }
    parsedLimit = Math.min(parsedLimit, 100);
  }

  try {
    const bands = await Band.findAll({
      where,
      order: [[Sequelize.col("average_rating"), "DESC NULLS LAST"]],
      ...(parsedLimit ? { limit: parsedLimit } : {}),
      attributes: [
        [Sequelize.col("bands.id"), "band_id"],
        "name",
        "description",
        [Sequelize.fn("ROUND", Sequelize.fn("AVG", Sequelize.col("ratings.rating")), 1), "average_rating"],
        "location",
        "url",
        "spotify_url",
        "genre_id",
        [Sequelize.col("genre.name"), "genre_name"],
        "image",
      ],
      include: [
        { model: Genre, attributes: [] },
        { model: Rating, attributes: [] },
      ],
      group: ["bands.id", "genre.name"],
      subQuery: false,
    });

    const withImages = await withSpotifyImages(bands.map((b) => b.toJSON()));
    return res.status(200).json(withImages);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: "Internal server error",
      message: err.message,
    });
  }
});

// find one band by ID
router.get('/:id', async (req, res) => {
    try {
        const dbBandData = await Band.findOne({
            where: {
                id: req.params.id
            },
            attributes: [
                'id',
                'name',
                'description',
                [Sequelize.fn('ROUND', Sequelize.fn('AVG', Sequelize.col('ratings.rating')), 1), 'average_rating'],
                'location',
                'url',
                'spotify_url',
                'genre_id',
                [Sequelize.col('genre.name'), 'genre_name'],
                'image'
            ],
            include: [
                { model: Genre, attributes: [] },
                { model: Rating, attributes: [] }
            ],
            group: ['bands.id', 'genre.name']
        })

        if (!dbBandData) return res.json(dbBandData)

        const spotify_image = await getArtistImage(dbBandData.spotify_url)
        res.json({ ...dbBandData.toJSON(), spotify_image })
    } catch (err) {
        console.log(err)
        res.status(500).json(err)
    }
})

// create a new band
router.post('/', requireReviewer, (req,res) => {
    Band.create({
        name: req.body.name,
        description: req.body.description,
        average_rating: req.body.average_rating,
        location: req.body.location,
        genre_id: req.body.genre_id,
        url: req.body.url ? String(req.body.url).trim() : null,
        spotify_url: req.body.spotify_url ? String(req.body.spotify_url).trim() : null,
    })
    .then(dbBandData => res.status(201).json(dbBandData))
    .catch(err => {
        console.log(err)
        res.status(500).json(err)
    })
})

// POST /api/bands/batch
// Body: { bands: [{ id?, client_id?, name, location, description }] }.
// Entries with an id update that band's name/location/description; entries without one create a new band.
// client_id (if provided) is echoed back on the matching result, so callers can correlate
// newly-created bands (which have no id yet when the request is sent) with their temp rows.
// Returns each band with its (recalculated) average_rating.
router.post('/batch', requireReviewer, async (req, res) => {
  try {
    const { bands } = req.body;
    if (!Array.isArray(bands) || bands.length === 0) {
      return res.status(400).json({ message: 'bands array is required' });
    }

    // id -> client_id, so the response can echo back which temp row each band came from
    const clientIdByBandId = new Map();

    await sequelize.transaction(async (t) => {
      for (const entry of bands) {
        const fields = {};
        if (entry.name !== undefined) fields.name = entry.name;
        if (entry.location !== undefined) fields.location = entry.location;
        if (entry.description !== undefined) fields.description = entry.description;
        if (entry.url !== undefined) fields.url = entry.url ? String(entry.url).trim() : null;
        if (entry.spotify_url !== undefined) {
          fields.spotify_url = entry.spotify_url ? String(entry.spotify_url).trim() : null;
        }

        if (entry.id) {
          await Band.update(fields, { where: { id: entry.id }, transaction: t });
          clientIdByBandId.set(entry.id, entry.client_id ?? null);
        } else {
          if (!fields.name || !String(fields.name).trim()) {
            throw new Error('name is required for new bands');
          }
          const created = await Band.create(fields, { transaction: t });
          clientIdByBandId.set(created.id, entry.client_id ?? null);
        }
      }
    });

    const resultIds = Array.from(clientIdByBandId.keys());

    const updatedBands = await Band.findAll({
      where: { id: { [Sequelize.Op.in]: resultIds } },
      attributes: [
        'id',
        'name',
        'description',
        'location',
        'url',
        'spotify_url',
        [Sequelize.fn('ROUND', Sequelize.fn('AVG', Sequelize.col('ratings.rating')), 1), 'average_rating'],
      ],
      include: [{ model: Rating, attributes: [] }],
      group: ['bands.id'],
    });

    const updated = updatedBands.map((b) => ({
      ...b.toJSON(),
      client_id: clientIdByBandId.get(b.id) ?? null,
    }));

    res.json({ updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

// update a band
// PUT /api/bands/:id
router.put("/:id", requireReviewer, async (req, res) => {
  try {
    const bandId = Number(req.params.id);
    if (!Number.isFinite(bandId)) {
      return res.status(400).json({ message: "Invalid band id" });
    }

    // Whitelist fields we allow updating
    const { name, location, url, spotify_url, genre_id, average_rating, description } = req.body;

    // Basic validation (match your “name + genre_id required” rule)
    if (!name || !String(name).trim()) {
      return res.status(400).json({ message: "name is required" });
    }
    if (!genre_id) {
      return res.status(400).json({ message: "genre_id is required" });
    }

    const [updatedCount] = await Band.update(
      {
        name: String(name).trim(),
        location: location ? String(location).trim() : null,
        url: url ? String(url).trim() : null,
        spotify_url: spotify_url ? String(spotify_url).trim() : null,
        genre_id: Number(genre_id),
        average_rating: Number(average_rating),
        description: description ? String(description).trim() : null,
      },
      {
        where: { id: bandId },
      }
    );

    if (updatedCount === 0) {
      return res.status(404).json({ message: "Band not found" });
    }

    // Return the updated record
    const updatedBand = await Band.findByPk(bandId);
    return res.json(updatedBand);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});


module.exports = router
