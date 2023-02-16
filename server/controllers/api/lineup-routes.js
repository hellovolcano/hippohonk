const router = require('express').Router()
const sequelize = require('../../config/connection')
const { Band, Festival, Lineup } = require('../../models')
const Sequelize = require('sequelize')

// find all lineups
router.get('/', (req,res) => {
    Lineup.findAll({
        attributes: ['id','band_id', 'festival_id'],
        include: {
            model: Band,
            attributes: ['id','name']
        },
        include: {
            model: Festival,
            attributes: ['name','date']
        }
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
            [Sequelize.col('band.average_rating'), 'average_rating'],
            [Sequelize.col('band.image'), 'image'],
            [Sequelize.col('festival.name'), 'festival_name']
        ],
        include: [{
            model: Band,
            attributes: []
        },
        {
            model: Festival,
            attributes: []
        }],
        order: [
            [ Band, "average_rating" , "DESC"]
        ]
    })
    .then(dbUserData => res.json(dbUserData))
    .catch(err => {
        console.log(err)
        res.status(500).json(err)
    })
})



module.exports = router
