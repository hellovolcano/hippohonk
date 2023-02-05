const router = require('express').Router()
const sequelize = require('../../config/connection')
const { Band } = require('../../models')

// find all bands
router.get('/', (req,res) => {
    Band.findAll({
        order: [
            ["average_rating", "DESC"]
        ]
    })
    .then(dbUserData => res.json(dbUserData))
    .catch(err => {
        console.log(err)
        res.status(500).json(err)
    })
})

// find one band
router.get('/:id', (req,res) => {
    Band.findOne({
        where: {
            id: req.params.id
        },
        attributes: ['id','name','description','location']
    })
    .then(dbBandData => res.json(dbBandData))
    .catch(err => {
        console.log(err)
        res.status(500).json(err)
    })
})

module.exports = router
