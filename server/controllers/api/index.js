const router = require('express').Router()

const userRoutes = require('./user-routes')
const bandRoutes = require('./band-routes')

router.use('/bands', bandRoutes)
router.use('/users', userRoutes)

module.exports = router
