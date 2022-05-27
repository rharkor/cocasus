#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const utils = require('../utils/method');

const cliInterface = require('./cli/interface/interface');
const Database = require('./cli/database/Database');
const Structure = require('./cli/structure/Structure');

class Cli {
  constructor() {
    this.path = process.cwd();

    this.structure = new Structure(this.path);

    this.createInterface();
  }

  createInterface() {
    cliInterface.commands.makeController = this.makeController.bind(this);
    cliInterface.commands.init = this.init.bind(this);
    cliInterface.commands.getRoutes = this.getRoutes.bind(this);
    cliInterface.commands.dbMigrateUp = this.migrateUp.bind(this);
    cliInterface.commands.dbMigrateDown = this.migrateDown.bind(this);
    cliInterface.commands.makeMigration = this.makeMigration.bind(this);

    cliInterface.createInterface();
  }

  getApp() {
    try {
      const app = require(`${this.path}/config.js`);
      // Test if app is an empty bracket
      if (Object.keys(app).length === 0) {
        console.error(
          'No app found, make sure to export your app in config.js\nExample: module.exports = coca;'
        );
        return;
      }
      return app;
    } catch (e) {
      const moduleName = e.message.split("'")[1];
      if (
        e.code === 'MODULE_NOT_FOUND' &&
        moduleName === `${this.path}/config.js`
      ) {
        // Get the name of the not found module
        console.error('Please declare your app in config.js');
        return;
      }
      console.log(e);
    }
  }

  getRoutes() {
    if (this.getApp()) {
      const routes = this.getApp().getRoutes();
      if (routes) {
        routes.forEach((route) => {
          console.log(
            `Method '${route.method.toUpperCase()}' | Path '${route.path}'`
          );
        });
      }
    }
  }

  createDB() {
    const app = this.getApp();
    this.dbOptions = {
      database: utils.getEnv('DB_DATABASE', 'cocasus'),
      username: utils.getEnv('DB_USER', 'my-user'),
      password: utils.getEnv('DB_PASSWORD', 'my-password'),
      host: utils.getEnv('DB_HOST', 'localhost'),
      dialect: utils.getEnv('DB_DIALECT', 'mysql'),
      models: app.options.db.models,
      migrations: app.options.db.migrations,
    };
    this.db = new Database(this.dbOptions, this.path);
  }

  async migrateUp() {
    this.createDB();
    await this.db.migrate();
    this.db.close();
  }

  async migrateDown() {
    this.createDB();
    await this.db.rollback();
    this.db.close();
  }

  makeMigration(name) {
    this.createDB();
    this.db.makeMigration(name);
    this.db.close();
  }

  makeController(argv) {
    if (!argv.name) {
      console.log('Please provide a controller name');
      return;
    }
    let name = argv.name;
    if (!name.endsWith('Controller')) {
      name = `${name}Controller`;
    }

    // Init the folder structure
    this.structure.createStructure([
      'controllers',
      path.join('vendor', 'http', 'controllers', 'Controller.js'),
      path.join('vendor', 'http', 'requests', 'Request.js'),
      path.join('resources', 'views', 'base.jinja'),
    ]);

    // Get the file content from /../utils/models/controllers/BaseController.js
    let controllerContent = fs.readFileSync(
      `${__dirname}/cli/models/controllers/BaseController.js`,
      'utf8'
    );
    // Replace all $name by the name of the controller
    const controller = controllerContent.replace(/\$name/g, name);
    // Create the file
    fs.writeFileSync(
      this.path + '/controllers/' + name + '.js',
      controller,
      'utf8'
    );

    console.info(`Made controller ${argv.name}`);
  }

  async init(argv, name) {
    if (argv.root !== '.') {
      this.structure.path = `${this.path}/${argv.root}`;
      // Create the folder structure
      fs.mkdirSync(this.structure.path, { recursive: true });
    }
    if (argv.force) {
      this.structure.createStructure(
        null,
        true,
        {
          name,
        },
        argv.type,
        argv.deps
      );
    } else {
      this.structure.createStructure(
        null,
        false,
        {
          name,
        },
        argv.type,
        argv.deps
      );
    }
  }
}

new Cli();
