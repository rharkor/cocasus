const { Sequelize } = require('sequelize');
const { Umzug, SequelizeStorage } = require('umzug');
const path = require('path');
const fs = require('fs');
const utils = require('../../../utils/method');
const colors = utils.colors;

class Database {
  constructor(config, root, debug = utils.getEnv('DEBUG', true)) {
    this.sequelize = new Sequelize(
      config.database,
      config.username,
      config.password,
      {
        host: config.host,
        dialect: config.dialect,
        logQueryParameters: debug,
        benchmark: debug,
        logging: debug ? this.handleLogging : false,
      }
    );
    this.root = root;
    this.debug = debug;

    this.umzug = new Umzug({
      migrations: {
        glob: `${path.join(this.root, config.migrations)}/*.js`,
      },
      context: this.sequelize.getQueryInterface(),
      storage: new SequelizeStorage({ sequelize: this.sequelize }),
      logger: console,
    });

    this.migrationsPath = config.migrations;
    this.modelsPath = config.models;
    this.models = this.sequelize.models;
  }

  handleLogging(message) {
    return console.log(colors.debug(message));
  }

  close() {
    this.sequelize.close();
  }

  async migrate() {
    await this.umzug.up();
  }

  async rollback() {
    await this.umzug.down();
  }

  async reset() {
    await this.umzug.down({ to: 0 });
  }

  async fresh() {
    await this.umzug.down({ to: 0 });
    await this.umzug.up();
  }

  makeMigration(name) {
    name = utils.camelToSnake(name);
    // Get the model path
    const lastMigrationNumber = this.getLastMigrationNumber(this.root);
    // Create the migration boilerplate
    fs.writeFileSync(
      `${this.root}/${this.migrationsPath}/${
        lastMigrationNumber + 1
      }_${name}.js`,
      fs.readFileSync(`${__dirname}/../models/database/migration.js`)
    );
    if (this.debug) {
      console.log(colors.success('Migration created successfully.'));
    }
  }

  getLastMigrationNumber() {
    // Get the number of the last migration
    const migrations = fs.readdirSync(`${this.root}/${this.migrationsPath}`);
    const lastMigration = migrations[migrations.length - 1];
    let lastMigrationNumber = 0;
    if (lastMigration) {
      lastMigrationNumber = lastMigration.split('_')[0];
    }
    return parseInt(lastMigrationNumber);
  }
}

module.exports = Database;
