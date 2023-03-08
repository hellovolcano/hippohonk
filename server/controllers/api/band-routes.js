const router = require('express').Router()
const sequelize = require('../../config/connection')
const { Band, Genre } = require('../../models')
const Sequelize = require('sequelize')
const { Router } = require('express')

// find all bands
router.get('/', (req,res) => {
    Band.findAll({
        order: [
            ["average_rating", "DESC"]
        ],
        attributes: [[Sequelize.col('bands.id'), 'band_id'],'name','description','average_rating','location','url','genre_id',[Sequelize.col('genre.name'), 'genre_name'],'image'],
        include: [{
            model: Genre,
            attributes: []
        }]
    })
    .then(dbUserData => res.json(dbUserData))
    .catch(err => {
        console.log(err)
        res.status(500).json(err)
    })
})

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
    .then(dbBandData => res.json(dbBandData))
    .catch(err => {
        console.log(err)
    })
})

module.exports = router
