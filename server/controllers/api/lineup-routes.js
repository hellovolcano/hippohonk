const router = require('express').Router()
const sequelize = require('../../config/connection')
const { Band, Festival, Lineup, Rating } = require('../../models')
const Sequelize = require('sequelize')
const requireReviewer = require('../../middleware/reviewer')

// find all lineups
router.get('/', (req,res) => {
    Lineup.findAll({
        attributes: ['id','band_id', 'festival_id'],
        include: [{
            model: Band,
            attributes: []
        },
        {
            model: Festival,
            attributes: []
        }],
    })
    .then(dbUserData => res.json(dbUserData))
    .catch(err => {
        console.log(err)
        res.status(500).json(err)
    })
})


// find all bands in a lineup by festival id
router.get('/:id', (req,res) => {
    Lineup.findAll({
        where: {
            festival_id: req.params.id
        },
        attributes: ['id','festival_id',
            [Sequelize.col('band.id'), 'band_id'],
            [Sequelize.col('band.name'), 'name'],
            [Sequelize.col('band.description'), 'description'],
            [Sequelize.col('band.location'), 'location'],
            [Sequelize.fn('ROUND', Sequelize.fn('AVG', Sequelize.col('band->ratings.rating')), 1), 'average_rating'],
            [Sequelize.col('band.image'), 'image'],
            [Sequelize.col('band.url'), 'url'],
            [Sequelize.col('band.spotify_url'), 'spotify_url'],
            [Sequelize.col('festival.name'), 'festival_name'],
            [Sequelize.col('band.genre_id'), 'genre_id']
        ],
        include: [{
            model: Band,
            attributes: [],
            include: [{ model: Rating, attributes: [] }]
        },
        {
            model: Festival,
            attributes: []
        }],
        group: ['lineups.id', 'band.id', 'festival.id'],
        order: [
            [Sequelize.col('average_rating'), 'DESC NULLS LAST']
        ]
    })
    .then(dbUserData => res.json(dbUserData))
    .catch(err => {
        console.log(err)
        res.status(500).json(err)
    })
})

router.post('/', requireReviewer, async (req, res) => {
    try {
        const lineup = await Lineup.create({
            band_id: req.body.band_id,
            festival_id: req.body.festival_id
        })
        res.json(lineup)
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: 'Server error' })
    }
})


module.exports = router
