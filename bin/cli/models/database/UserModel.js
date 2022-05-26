const { DataTypes } = require('sequelize');
const Model = require('../../vendor/db/Model');

const User = new Model(
  'user',
  {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {}
);

module.exports = User;
