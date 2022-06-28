const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');
const utils = require('../../utils/method');
const colors = utils.colors;

class Database {
  constructor(config, debug = utils.getEnv('DEBUG', true), path, errorHandler) {
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

    this.defaultQuery = async function () {
      try {
        return await Sequelize.prototype.query.apply(this, arguments);
      } catch (err) {
        throw err;
      }
    };
    this.sequelize.query = async function () {
      try {
        return await Sequelize.prototype.query.apply(this, arguments);
      } catch (err) {
        // handle it
        err.error = err.original;
        throw err;
      }
    };

    this.migrationsPath = config.migrations;
    this.modelsPath = config.models;
    this.models = this.sequelize.models;
    this.path = path;
  }

  async auth() {
    // Test the model and migrations path
    if (
      !fs.existsSync(path.join(this.path, this.migrationsPath)) ||
      !fs.existsSync(path.join(this.path, this.modelsPath))
    ) {
      return;
    }
    try {
      await this.sequelize.authenticate();
      this.referenceAllModels();
    } catch (error) {
      console.error(colors.error('Unable to connect to the database:'), error);
    }
  }

  handleLogging(message) {
    return console.log(colors.debug(message));
  }

  close() {
    this.sequelize.close();
  }

  referenceAllModels() {
    try {
      // read all files in models directory
      const files = fs.readdirSync(path.join(this.path, this.modelsPath));
      // for each file, require it and add it to the models object
      // Define all the models
      files.forEach((file) => {
        const model = require(`${path.join(
          this.path,
          this.modelsPath
        )}/${file}`);
        model.define(this.sequelize);
      });
    } catch (error) {
      console.error(error);
    }
  }
}

module.exports = Database;
