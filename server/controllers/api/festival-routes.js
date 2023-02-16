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

// find one festival by slug
router.get('/:slug', (req,res) => {
    Festival.findOne({
        where: {
            slug: req.params.slug
        },
    })
    .then(dbUserData => res.json(dbUserData))
    .catch(err => {
        console.log(err)
        res.status(500).json(err)
    })
})

module.exports = router
