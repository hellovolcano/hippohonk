const router = require('express').Router()
const sequelize = require('../../config/connection')
const { Festival } = require('../../models')

// find all festivals
router.get('/', (req,res) => {
    Festival.findAll({
        order: [
            ["date", "DESC"]
        ]
    })
    .then(dbUserData => res.json(dbUserData))
    .catch(err => {
        console.log(err)
        res.status(500).json(err)
    })
})

// find one festival
router.get('/:id', (req,res) => {
    Band.findOne({
        where: {
            id: req.params.id
        },
    })
    .then(dbBandData => res.json(dbBandData))
    .catch(err => {
        console.log(err)
        res.status(500).json(err)
    })
})

module.exports = router
