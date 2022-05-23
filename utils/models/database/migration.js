const { DataTypes } = require('sequelize');
const BaseModel = require('../../vendor/db/BaseModel');

async function up({ context: queryInterface }) {
  await queryInterface.createTable(
    'table-name',
    {
      ...BaseModel.content,

      // Add your own fields here
      // ...
    },
    {
      ...BaseModel.options,
    }
  );
}

async function down({ context: queryInterface }) {
  await queryInterface.dropTable('table-name');
}

module.exports = { up, down };
