const router = require('express').Router()
const sequelize = require('../../config/connection')
const { Band, Genre, Rating } = require('../../models')
const Sequelize = require('sequelize')
const { Router } = require('express')
const requireReviewer = require('../../middleware/reviewer')

// Find all bands (with optional filters)
router.get("/", async (req, res) => {
  const { genre_id } = req.query;

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

  try {
    const bands = await Band.findAll({
      where,
      order: [[Sequelize.col("average_rating"), "DESC NULLS LAST"]],
      attributes: [
        [Sequelize.col("bands.id"), "band_id"],
        "name",
        "description",
        [Sequelize.fn("ROUND", Sequelize.fn("AVG", Sequelize.col("ratings.rating")), 1), "average_rating"],
        "location",
        "url",
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

    return res.status(200).json(bands);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: "Internal server error",
      message: err.message,
    });
  }
});

// find one band by ID
router.get('/:id', (req,res) => {
    Band.findOne({
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
    .then(dbBandData => res.json(dbBandData))
    .catch(err => {
        console.log(err)
        res.status(500).json(err)
    })
})

// create a new band
router.post('/', requireReviewer, (req,res) => {
    Band.create({
        name: req.body.name,
        description: req.body.description,
        average_rating: req.body.average_rating,
        location: req.body.location,
        genre_id: req.body.genre_id
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
    const { name, location, url, genre_id, average_rating, description } = req.body;

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
