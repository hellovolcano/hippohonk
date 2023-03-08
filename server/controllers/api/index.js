const router = require('express').Router()

const userRoutes = require('./user-routes')
const bandRoutes = require('./band-routes')
const festivalRoutes = require('./festival-routes')
const lineupRoutes = require('./lineup-routes')
const genreRoutes = require('./genre-routes')

router.use('/bands', bandRoutes)
router.use('/users', userRoutes)
router.use('/festivals', festivalRoutes)
router.use('/lineups', lineupRoutes)
router.use('/genres', genreRoutes)

module.exports = router
