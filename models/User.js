'use strict';
const { Model, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = ( sequelize ) => {

  class User extends Model {}

  User.init({
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { /* if value is null */
          msg: 'A first name is required'
        }, 
        notEmpty: { /* if value is an empty string */ 
          msg: 'Please provide a first name'
        }
      }
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'A last name is required'
        }, 
        notEmpty: {
          msg: 'Please provide a last name'
        }
      }
    },
    emailAddress: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        msg: 'The email you entered already exists'
      },
      validate: {
        notNull: {
          msg: 'An email is required'
        },
        isEmail: { /* if value is not valid email format */
          msg: 'Please provide a valid email address'
        }
      }
    },
    password: {
      type: DataTypes.VIRTUAL,
      allowNull: false, 
      validate: {
        notNull: {
          msg: 'A password is required'
        },
        notEmpty: {
          msg: 'Please provide a password'
        },
        len: { /* password length arguments */
          args: [8, 20],
          msg: 'The password should be between 8 and 20 characters in length'
        }
      }
    },
    confirmedPassword: {
      type: DataTypes.STRING,
      allowNull: false,
      set(val) {
        if (val === this.password) {
          const hashedPassword = bcrypt.hashSync(val, 10);
          this.setDataValue('confirmedPassword', hashedPassword);
        }
      },
      validate: {
        notNull: {
          msg: 'Both passwords must match'
        }
      }
    }
  }, { sequelize });

  User.associate = (models) => {
    User.hasMany(models.Course, {
      foreignKey: {
        fieldName: 'userId'
      }
    });
  };

  return User;
};
