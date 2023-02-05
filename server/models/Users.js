const { Model, DataTypes } = require('sequelize');
// const bcrypt = require('bcrypt');
const sequelize = require('../config/connection');

class User extends Model {
//   checkPassword(loginPw) {
//     return bcrypt.compareSync(loginPw, this.password)
// }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password_digest: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1]
      }
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    admin: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    reviewer: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
  },
  {
    // hooks: {
    //   beforeCreate: async newUser => {
    //     try {
    //       newUser.password = await bcrypt.hash(newUser.password, 10);
    //       return newUser;
    //     } catch (err) {
    //       console.log(err);
    //       return err;
    //     }
    //   },
    //   beforeUpdate: async updatedUser => {
    //     try {
    //       updatedUser.password = await bcrypt.hash(
    //         updatedUser.password,
    //         10
    //       );
    //       return updatedUser;
    //     } catch (err) {
    //       console.log(err);
    //       return err;
    //     }
    //   }
    // },
    sequelize,
    timestamps: true,
    freezeTableName: true,
    underscored: true,
    modelName: 'users'
  }
);

module.exports = User
