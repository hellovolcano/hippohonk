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
            type: DataTypes.NUMBER
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
        genre_id: {
            type: DataTypes.NUMBER
        },
        image: {
            type: DataTypes.TEXT
        },
        popularity: {
            type: DataTypes.NUMBER
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
