const { Sequelize } = require('sequelize');
const SequelizeModel = require('sequelize/lib/model');
const path = require('path');
const fs = require('fs');
const utils = require('../../utils/method');

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
        logging: debug ? console.log : false,
      }
    );

    this.sequelize.query = async function () {
      try {
        // proxy this call
        return {
          resp: await Sequelize.prototype.query.apply(this, arguments),
          error: false,
        };
      } catch (err) {
        // handle it
        return {
          resp: null,
          error: err,
        };
      }
    };

    // const orgFindAll = SequelizeModel.findAll;
    // SequelizeModel.findAll = function () {
    //   return orgFindAll.apply(this, arguments).catch((err) => {
    //     errorHandler(err);
    //   });
    // };

    this.migrationsPath = config.migrations;
    this.modelsPath = config.models;
    this.models = this.sequelize.models;
    this.path = path;

    this.auth();
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
