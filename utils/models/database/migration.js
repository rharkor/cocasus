const { DataTypes } = require('sequelize');
const BaseModel = require('../../vendor/db/BaseModel');

const name = 'table-name';

const content = {
  // Add your own fields here
  // ...
};

/**
 * Auto generated model
 * Complete the fields above
 */
async function up({ context: queryInterface }) {
  await queryInterface.createTable(
    name,
    {
      ...BaseModel.content,
      ...content,
    },
    {
      ...BaseModel.options,
    }
  );
}

async function down({ context: queryInterface }) {
  await queryInterface.dropTable(name);
}

module.exports = { up, down };
