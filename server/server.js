const express = require('express')
const routes = require('./controllers')
const sequelize = require('./config/connection')
const path = require('path')
const cors = require('cors')

// const session = require('express-session')

// const SequelizeStore = require('connect-session-sequelize')(session.Store)

// const sess = {
//     secret: process.env.SESSION_SECRET,
//     cookie: {},
//     resave: false,
//     saveUnitialized: true,
//     store: new SequelizeStore({
//         db: sequelize
//     })
// }

const app = express()
const PORT = process.env.PORT || 3001

// app.use(session(sess))
// app.use(cors)
app.use(express.json())
app.use(express.urlencoded({ extended: true}))
// app.use(express.static(path.join(__dirname, 'public')))

// app.use(routes)

sequelize.sync({ force: false }).then(() => {
    app.listen(PORT, () => console.log(`Now listening on Port ${PORT}`))
})

app.use(routes)

app.get('/', (req, res) => {
    res.send('Server is up, ya turkeysssssss.')
})

// app.listen(PORT, () => console.log(`Now listening on ${PORT}`))