const { Model, DataTypes } = require('sequelize');
// const bcrypt = require('bcrypt');
const sequelize = require('../config/connection');

class Lineup extends Model {
//   checkPassword(loginPw) {
//     return bcrypt.compareSync(loginPw, this.password)
// }
}

Lineup.init (
    {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
            autoIncrement: true,
            primaryKey: true
        },
        band_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'bands',
                key: 'id'
            }
        },
        festival_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'festivals',
                key: 'id'
            }
       }
    },
    {
        sequelize,
        timestamps: true,
        freezeTableName: true,
        underscored: true,
        modelName: 'lineups'
    },
    {
        indexes: [
            {
                name: 'lineups_pkey',
                unique: true,
                fields: ['id']
            },
            {
                name: 'index_lineups_on_band_id',
                using: 'BTREE',
                fields: ['band_id']
            },
            {
                name: 'index_lineups_on_festival_id',
                using: 'BTREE',
                fields:['festival_id']

            }
        ]

    }
)

module.exports = Lineup
