#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

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
    cliInterface.commands.start = this.start.bind(this);
    cliInterface.commands.dev = this.dev.bind(this);
    cliInterface.commands.dbMigrateUp = this.migrateUp.bind(this);
    cliInterface.commands.dbMigrateDown = this.migrateDown.bind(this);
    cliInterface.commands.makeMigration = this.makeMigration.bind(this);

    cliInterface.createInterface();
  }

  getRoutes() {
    if (utils.getApp(this.path)) {
      const routes = utils.getApp(this.path).getRoutes();
      if (routes) {
        routes.forEach((route) => {
          console.log(
            `Method '${route.method.toUpperCase()}' | Path '${route.path}'`
          );
        });
      }
    }
  }

  start() {
    const app = utils.getApp(this.path);
    if (app) {
      app.start();
    }
  }

  dev() {
    // Start with nodemon
    const packageJson = `${this.path}/package.json`;
    if (fs.existsSync(packageJson)) {
      // install nodemon
      exec('npm install nodemon', (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          return;
        }
        console.log(stdout);
        // Add the watch command
        const packageJsonContent = JSON.parse(fs.readFileSync(packageJson));
        packageJsonContent.scripts.watch = 'nodemon app.js';
        fs.writeFileSync(
          packageJson,
          JSON.stringify(packageJsonContent, null, 2)
        );
        console.log('Added nodemon to package.json');
        console.log(
          'You can now run "npm run watch" to start the server with hot reload'
        );
      });
    } else {
      console.error(`${appJsPath} not found`);
    }
  }

  createDB() {
    const app = utils.getApp(this.path);
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
