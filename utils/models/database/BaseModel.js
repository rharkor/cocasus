const { DataTypes } = require('sequelize');

module.exports = {
  content: {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
  },
  options: {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
};
