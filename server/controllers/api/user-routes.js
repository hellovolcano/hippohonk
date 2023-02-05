const router = require('express').Router()
const sequelize = require('../../config/connection')
const { User } = require('../../models')

// find all users
router.get('/', (req,res) => {
    User.findAll()
    .then(dbUserData => res.json(dbUserData))
    .catch(err => {
        console.log(err)
        res.status(500).json(err)
    })
})

//logout route
// router.post('/logout', (req, res) => {
//     // if the session loggedIn variable evaluates to true, destroy the session
//     if (req.session.loggedIn) {
//         req.session.destroy(() => {
//             res.status(204).end()
//         })
//     }
//     else {
//         res.status(404).end()
//     }
// })

module.exports = router
