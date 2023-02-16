const { Model, DataTypes } = require('sequelize');
// const bcrypt = require('bcrypt');
const sequelize = require('../config/connection');

class Festival extends Model {
//   checkPassword(loginPw) {
//     return bcrypt.compareSync(loginPw, this.password)
// }
}

Festival.init (
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
        date: {
            type: DataTypes.DATEONLY
        },
        slug: {
            type: DataTypes.STRING
        }
    },
    {
        sequelize,
        timestamps: true,
        freezeTableName: true,
        underscored: true,
        modelName: 'festivals'
    }
)

module.exports = Festival;
