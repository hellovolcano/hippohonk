const { Model, DataTypes } = require('sequelize');
// const bcrypt = require('bcrypt');
const sequelize = require('../config/connection');

class Band extends Model {
//   checkPassword(loginPw) {
//     return bcrypt.compareSync(loginPw, this.password)
// }
}

Band.init (
    {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT
        },
        average_rating: {
            type: DataTypes.DECIMAL(3, 2)
        },
        location: {
            type: DataTypes.STRING,
        },
        url: {
            type: DataTypes.STRING,
            validate: {
                isUrl: true
            }
        },
        spotify_url: {
            type: DataTypes.STRING,
            validate: {
                isUrl: true
            }
        },
        genre_id: {
            type: DataTypes.INTEGER
        },
        image: {
            type: DataTypes.TEXT
        },
        popularity: {
            type: DataTypes.DECIMAL(8, 5)
        },
        twitter: {
            type: DataTypes.STRING
        }

    },
    {
        sequelize,
        timestamps: true,
        freezeTableName: true,
        underscored: true,
        modelName: 'bands'
    }
)

module.exports = Band
