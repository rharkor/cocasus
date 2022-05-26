const { DataTypes } = require('sequelize');

const utils = require('../utils/method');

class Model {
  constructor(name, content = {}, options = {}) {
    this.name = utils.camelToSnake(name);
    this.defaultContent = {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    };
    this.defaultOptions = {
      timestamps: true,
    };
    this.content = Object.assign({}, content, this.defaultContent);
    this.options = Object.assign({}, options, this.defaultOptions);
  }

  define(sequelize) {
    sequelize.define(this.name, this.content, this.options);
  }
}

module.exports = Model;
