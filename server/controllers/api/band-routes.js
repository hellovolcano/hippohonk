const router = require('express').Router()
const sequelize = require('../../config/connection')
const { Band, Genre } = require('../../models')
const Sequelize = require('sequelize')
const { Router } = require('express')

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
      order: [["average_rating", "DESC"]],
      attributes: [
        [Sequelize.col("bands.id"), "band_id"],
        "name",
        "description",
        "average_rating",
        "location",
        "url",
        "genre_id",
        [Sequelize.col("genre.name"), "genre_name"],
        "image",
      ],
      include: [{ model: Genre, attributes: [] }],
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
        attributes: ['id','name','description','average_rating','location','url','genre_id',[Sequelize.col('genre.name'), 'genre_name'],'image'],
        include: [{
            model: Genre,
            attributes: []
        }]
    })
    .then(dbBandData => res.json(dbBandData))
    .catch(err => {
        console.log(err)
        res.status(500).json(err)
    })
})

// create a new band
router.post('/', (req,res) => {
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

module.exports = router
