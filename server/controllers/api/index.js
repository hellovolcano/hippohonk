const router = require('express').Router()

const userRoutes = require('./user-routes')
const bandRoutes = require('./band-routes')
const festivalRoutes = require('./festival-routes')
const lineupRoutes = require('./lineup-routes')

router.use('/bands', bandRoutes)
router.use('/users', userRoutes)
router.use('/festivals', festivalRoutes)
router.use('/lineups', lineupRoutes)

module.exports = router
