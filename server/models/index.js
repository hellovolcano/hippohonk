const User = require('./Users')
const Band = require('./Bands')
const Festival = require('./Festivals')
const Lineup = require('./Lineups')
const Genre = require('./Genres')

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

// // Festival.belongsToMany(Band, {
// //     through: Lineup,
// //     foreignKey: 'festival_id'
// // })

// Festival.hasMany(Lineup, {
//     foreignKey: 'festival_id'
// })


module.exports = { Band, User, Festival, Lineup, Genre }
