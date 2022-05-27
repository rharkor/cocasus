const { DataTypes } = require('sequelize');
const Migration = require('../../vendor/db/Migration');

const UserModel = require('../models/UserModel');

async function up({ context: queryInterface }) {
  await Migration.call(
    queryInterface,
    // Name of the method
    'createTable',
    // Arguments
    UserModel
  );
}

async function down({ context: queryInterface }) {
  await Migration.call(
    queryInterface,
    // Name of the method
    'dropTable',
    // Arguments
    UserModel
  );
}

module.exports = { up, down };
