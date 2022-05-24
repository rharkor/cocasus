const { DataTypes } = require('sequelize');
const BaseModel = require('../../vendor/db/BaseModel');

module.exports = (sequelize) => {
  sequelize.define(
    'user',
    {
      ...BaseModel.content,

      username: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      ...BaseModel.options,
    }
  );
};
