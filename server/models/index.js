const User = require('./Users')
const Band = require('./Bands')
const Festival = require('./Festivals')
const Lineup = require('./Lineups')
const Genre = require('./Genres')
const Rating = require('./Ratings')

Band.hasMany(Lineup, {
    foreignKey: 'band_id'
})

// // Band.belongsToMany(Festival, {
// //     through: Lineup,
// //     foreignKey: 'band_id'
// // })

Lineup.belongsTo(Band, {
    foreignKey: 'band_id'
})

Lineup.belongsTo(Festival, {
    foreignKey: 'festival_id'

})

Band.belongsTo(Genre, {
    foreignKey: 'genre_id'
})

Band.hasMany(Rating, {
    foreignKey: 'band_id'
})

Rating.belongsTo(Band, {
    foreignKey: 'band_id'
})

User.hasMany(Rating, {
    foreignKey: 'user_id'
})

Rating.belongsTo(User, {
    foreignKey: 'user_id'
})

// // Festival.belongsToMany(Band, {
// //     through: Lineup,
// //     foreignKey: 'festival_id'
// // })

// Festival.hasMany(Lineup, {
//     foreignKey: 'festival_id'
// })


module.exports = { Band, User, Festival, Lineup, Genre, Rating }
