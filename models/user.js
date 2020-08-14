'use strict';

const models = require("./index");

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        unique:  {
          args: true,
          msg: 'email already been used.',
        },
        allowNull: false,
        validate: {
          notEmpty: { msg: "Please enter a valid email" },
          isEmail: { msg: "please provide a valid email" }
        }
      },
      username: {
        type: DataTypes.STRING,
        unique: {
          args: true,
          msg: 'username already been used.',
        },
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Please enter your password' }
        }
      },
      avatar: {
        type: DataTypes.STRING,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: true
      },
       isBanned: {
        type: DataTypes.BOOLEAN,
        allowNull: true
      },
      isAdmin: {
        type: DataTypes.BOOLEAN,
        allowNull: true
      },
      isSuperAdmin: {
        type: DataTypes.BOOLEAN,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE
      },
      passwordResetToken: {
        allowNull: true,
        type: DataTypes.STRING
      },
      activationToken: {
        allowNull: true,
        type: DataTypes.STRING
      }
  }, {
    defaultScope: {
      attributes: { exclude: ['password'] },
    },
    scopes: {
        withPassword: {
            attributes: { include: []},
        },
    }
  });

  User.prototype.toJson = function(){
    let value = this.get()
    delete value.password;
    return value;
  }

  User.associate = function(models) {
    User.hasMany(models.Conversion)
    User.hasOne(models.MailSubscription)
  };

  return User;
};