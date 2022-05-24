const { Sequelize } = require('sequelize');
const { Umzug, SequelizeStorage } = require('umzug');
const fs = require('fs');

class Database {
  constructor(config, root, debug = process.env.DEBUG || true) {
    this.sequelize = new Sequelize(
      config.database,
      config.username,
      config.password,
      {
        host: config.host,
        dialect: config.dialect,
        logQueryParameters: debug,
        benchmark: debug,
      }
    );
    this.root = root;

    this.umzug = new Umzug({
      migrations: { glob: `${this.root}/${config.migrationsRel}/*.js` },
      context: this.sequelize.getQueryInterface(),
      storage: new SequelizeStorage({ sequelize: this.sequelize }),
      logger: console,
    });

    this.migrationsPath = config.migrations;
    this.migrationsRelPath = config.migrationsRel;
    this.modelsPath = config.models;
    this.modelsRelPath = config.modelsRel;
    this.models = this.sequelize.models;

    this.auth();
  }

  async auth() {
    // Test the model and migrations path
    if (
      !fs.existsSync(this.migrationsPath) ||
      !fs.existsSync(this.modelsPath)
    ) {
      return;
    }
    try {
      await this.sequelize.authenticate();
      this.auth = true;
      console.log('Connection has been established successfully.');
      this.referenceAllModels();
    } catch (error) {
      this.auth = false;
      console.error('Unable to connect to the database:', error);
    }
  }

  close() {
    this.sequelize.close();
  }

  referenceAllModels() {
    try {
      // read all files in models directory
      const files = fs.readdirSync(this.modelsPath);
      // for each file, require it and add it to the models object
      // Define all the models
      files.forEach((file) => {
        require(`${this.modelsPath}/${file}`)(this.sequelize);
      });
    } catch (error) {}
  }

  async migrate() {
    await this.umzug.up();
  }

  async rollback() {
    await this.umzug.down();
  }

  makeMigration(name, root) {
    // Get the model path
    const lastMigrationNumber = this.getLastMigrationNumber(root);
    // Create the migration boilerplate
    fs.writeFileSync(
      `${root}/${this.migrationsRelPath}/${lastMigrationNumber + 1}_${name}.js`,
      fs.readFileSync(`${__dirname}/../utils/models/database/migration.js`)
    );
  }

  getLastMigrationNumber(root) {
    // Get the number of the last migration
    const migrations = fs.readdirSync(`${root}/${this.migrationsRelPath}`);
    const lastMigration = migrations[migrations.length - 1];
    let lastMigrationNumber = 0;
    if (lastMigration) {
      lastMigrationNumber = lastMigration.split('_')[0];
    }
    return parseInt(lastMigrationNumber);
  }
}

module.exports = Database;
