const { DataTypes } = require('sequelize');
const utils = require('../utils/method');

class BaseModel {
  constructor(name, content = {}, options = {}) {
    this.name = utils.camelToSnake(name);
    this.defaultContent = {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
    };
    this.defaultOptions = {
      freezeTableName: true,
      timestamps: true,
      underscored: true,
    };
    this.content = Object.assign({}, content, this.defaultContent);
    this.options = Object.assign({}, options, this.defaultOptions);
  }

  define(sequelize) {
    sequelize.define(this.name, this.content, this.options);
  }
}

module.exports = BaseModel;
