const { DataTypes } = require('sequelize');
const Migration = require('../../vendor/db/Migration');

async function up({ context: queryInterface }) {
  await Migration.call(
    queryInterface,
    // Name of the method
    '',
    // Arguments
    ''
  );
}

async function down({ context: queryInterface }) {
  await Migration.call(
    queryInterface,
    // Name of the method
    '',
    // Arguments
    ''
  );
}

module.exports = { up, down };
