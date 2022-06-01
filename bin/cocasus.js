#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { table } = require('table');

const utils = require('../utils/method');
const colors = utils.colors;

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
    cliInterface.commands.getJobs = this.getJobs.bind(this);
    cliInterface.commands.makeMigration = this.makeMigration.bind(this);
    cliInterface.commands.makeModel = this.makeModel.bind(this);
    cliInterface.commands.makeJob = this.makeJob.bind(this);
    cliInterface.commands.makeScrud = this.makeScrud.bind(this);
    cliInterface.commands.dbMigrateUp = this.migrateUp.bind(this);
    cliInterface.commands.dbMigrateDown = this.migrateDown.bind(this);
    cliInterface.commands.dbMigrateReset = this.migrateReset.bind(this);
    cliInterface.commands.dbMigrateFresh = this.migrateFresh.bind(this);
    cliInterface.commands.dbSeed = this.dbSeed.bind(this);

    cliInterface.createInterface();
  }

  getRoutes() {
    if (utils.getApp(this.path)) {
      const routes = utils.getApp(this.path).getRoutes();
      if (routes) {
        const data = [
          [
            utils.colors.info('Method: '),
            utils.colors.info('Path: '),
            utils.colors.info('Name: '),
            utils.colors.info('Description: '),
          ],
          ...routes.map((route) => [
            route.method,
            route.path,
            route.name,
            route.description,
          ]),
        ];
        const config = {
          header: {
            alignment: 'center',
            content: 'Routes',
          },
          columnDefault: {
            paddingLeft: 2,
            paddingRight: 2,
          },
        };
        console.log(table(data, config));
      }
    }
  }

  getJobs() {
    if (utils.getApp(this.path)) {
      utils.getApp(this.path).jobs.printJobs();
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

  async dbSeed() {
    // Get the app
    const app = utils.getApp(this.path);
    if (!app) {
      return;
    }
    // Don't handle the error
    app.db.sequelize.query = app.db.defaultQuery;

    const dbSeeder = app.options.db.seeders;
    const files = fs.readdirSync(dbSeeder);
    // Execute the seeders
    for (const seeder of files) {
      await require(path.join(this.path, dbSeeder, seeder))(app);
    }

    app.db.close();
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

  async migrateReset() {
    this.createDB();
    await this.db.reset();
    this.db.close();
  }

  async migrateFresh() {
    this.createDB();
    await this.db.fresh();
    this.db.close();
  }

  makeMigration(name) {
    this.createDB();
    this.db.makeMigration(name);
    this.db.close();
  }

  makeController(baseName) {
    let name = baseName;
    if (!name.endsWith('Controller')) {
      name = `${name}Controller`;
    }

    // Init the folder structure
    this.structure.createStructure([
      'controllers',
      path.join('vendor', 'http', 'controllers', 'Controller.js'),
      path.join('vendor', 'http', 'requests', 'Request.js'),
      path.join('resources', 'views', 'base.html'),
    ]);

    // Get the file content
    let controllerContent = fs.readFileSync(
      `${__dirname}/cli/models/controllers/TemplateController.js`,
      'utf8'
    );
    // Replace all $name by the name of the controller
    const controller = controllerContent.replace(/\$name/g, name);
    // Get the app
    const app = utils.getApp(this.path);
    if (!app) {
      return;
    }
    const controllersPath = app.options.init.controllers;
    // Create the file
    fs.writeFileSync(
      path.join(this.path, controllersPath, name + '.js'),
      controller,
      'utf8'
    );

    console.info(colors.success(`Made controller ${baseName}`));
  }

  makeModel(baseName) {
    let name = baseName;
    if (!name.endsWith('Model')) {
      name = `${name}Model`;
    }

    // Init the folder structure
    this.structure.createStructure([
      path.join('database', 'models'),
      path.join('vendor', 'db', 'Model.js'),
    ]);

    // Get the file content
    let modelContent = fs.readFileSync(
      `${__dirname}/cli/models/database/BaseModel.js`,
      'utf8'
    );
    // Replace all $name by the name of the model
    const app = utils.getApp(this.path);
    if (!app) {
      return;
    }
    const modelsPath = app.options.db.models;
    const nameFirstUpper = name.charAt(0).toUpperCase() + name.slice(1);
    let snakeName = utils.camelToSnake(baseName);
    if (snakeName.charAt(0) === '_') {
      snakeName = snakeName.slice(1);
    }
    const model = modelContent
      .replace(/\$name/g, snakeName)
      .replace(/\$nfu/g, nameFirstUpper);
    // Create the file
    fs.writeFileSync(
      path.join(this.path, modelsPath, name + '.js'),
      model,
      'utf8'
    );

    console.info(colors.success(`Made model ${baseName}`));
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

  makeJob(baseName) {
    let name = baseName;
    if (!baseName.endsWith('Job')) {
      name = `${baseName}Job`;
    }

    // Init the folder structure
    this.structure.createStructure([
      'jobs',
      path.join('vendor', 'jobs', 'Job.js'),
    ]);

    // Get the file content
    let jobContent = fs.readFileSync(
      `${__dirname}/cli/models/jobs/baseJob.js`,
      'utf8'
    );
    // Replace all $name by the name of the job
    const job = jobContent.replace(/\$name/g, baseName);
    // Get the app
    const app = utils.getApp(this.path);
    if (!app) {
      return;
    }
    const jobsPath = app.options.jobs.directory;
    // Create the file
    fs.writeFileSync(path.join(this.path, jobsPath, name + '.js'), job, 'utf8');

    console.info(colors.success(`Made job ${baseName}`));
  }

  makeScrud(name, model) {
    if (!name.endsWith('Controller')) {
      name = `${name}Controller`;
    }
    name = name.replace('.js', '');

    const reversePath = name.split('/').length - 1;
    const appPath = '../config.js';
    let basePath = '';
    for (let i = 0; i < reversePath; i++) {
      basePath += '../';
    }
    basePath += appPath;

    const scrud = fs.readFileSync(
      `${__dirname}/cli/models/controllers/Crud.js`,
      'utf8'
    );
    const app = utils.getApp(this.path);
    if (!app) {
      return;
    }
    const controllerPath = app.options.init.controllers;
    const controller = fs.readFileSync(
      path.join(this.path, controllerPath, name + '.js'),
      'utf8'
    );
    const scrudContent = scrud
      .replace(/\$model/g, model)
      .replace(/\$apppath/g, basePath);
    // Insert at the end of the controller
    const controllerContent = controller.replace(
      /(.*)}(.*)/gs,
      `$1
    ${scrudContent}
    }
    $2`
    );
    // Create the file
    fs.writeFileSync(
      path.join(this.path, controllerPath, name + '.js'),
      controllerContent,
      'utf8'
    );

    console.info(colors.success(`Included scrud in ${name} based on ${model}`));
  }
}

new Cli();
