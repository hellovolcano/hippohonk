const router = require('express').Router()
const sequelize = require('../../config/connection')
const { Genre } = require('../../models')

// find all genres
router.get('/', (req,res) => {
    // Genres are effectively static (no delete/edit UI reads this list back
    // right after a mutation, unlike festivals), so a short cache is safe.
    res.set('Cache-Control', 'public, max-age=300')
    Genre.findAll()
    .then(dbUserData => res.json(dbUserData))
    .catch(err => {
        console.log(err)
        res.status(500).json(err)
    })
})

// create a new genre
router.post('/', (req,res) => {
    Genre.create({
        name: req.body.name,
    })
    .then(dbGenreData => res.status(201).json(dbGenreData))
    .catch(err => {
        console.log(err)
        res.status(500).json({ message: 'Server error', details: err })
    })
})


module.exports = router
