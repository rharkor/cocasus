#!/usr/bin/env node

const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const fs = require('fs');
const Structure = require('../utils/Structure');
const inquirer = require('inquirer');
require('dotenv').config();

const Database = require('../utils/Database');

class Cli {
  constructor() {
    this.argv = yargs(hideBin(process.argv));
    this.path = process.cwd();

    this.structure = new Structure(this.path);

    this.createInterface();
  }

  createInterface() {
    yargs(hideBin(process.argv))
      .command(
        'make:controller [name]',
        'Create a new controller',
        (yargs) => {
          return yargs.positional('name', {
            describe: 'name of the controller',
            type: 'string',
          });
        },
        (argv) => {
          this.makeController(argv);
        }
      )
      .command(
        'init',
        'Initialize the project structure',
        (yargs) => {
          return yargs
            .positional('force', {
              describe: 'force the initialization (overwrite existing files)',
              alias: 'f',
              type: 'boolean',
            })
            .positional('type', {
              describe: 'The type of utilisation [web|api]',
              alias: 't',
              type: 'string',
              default: 'web',
            })
            .positional('name', {
              describe: 'The name of the project',
              alias: 'n',
              type: 'string',
            })
            .positional('root', {
              describe: 'The root of the project',
              alias: 'r',
              type: 'string',
              default: '.',
            })
            .positional('deps', {
              describe:
                'Install automatically or not the dependencies of the project',
              alias: 'd',
              type: 'boolean',
              default: true,
            });
        },
        async (argv) => {
          // ask for name
          const name = argv.name || (await this.askForName());
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
      )
      .command(
        'routes',
        'Get the routes of the app',
        (yargs) => {},
        () => {
          this.getRoutes();
        }
      )
      .command(
        'db:migrate:up',
        'Run the migrations',
        (yargs) => {},
        async () => {
          this.createDB();
          await this.db.migrate();
          this.db.close();
        }
      )
      .command(
        'db:migrate:down',
        'Rollback the migrations',
        (yargs) => {},
        async () => {
          this.createDB();
          await this.db.rollback();
          this.db.close();
        }
      )
      .command(
        'make:migration [name]',
        'Create a new migration',
        (yargs) => {},
        async (argv) => {
          const name =
            argv.name ||
            (await this.askForName(
              'create_table',
              'What is the name of the migration?'
            ));
          this.createDB();
          this.db.makeMigration(name, this.path);
          this.db.close();
        }
      )
      .showHelpOnFail(true)
      .parse();
  }

  createDB() {
    const app = this.getApp();
    this.dbOptions = {
      database: process.env.DB_DATABASE || 'cocasus',
      username: process.env.DB_USER || 'my-user',
      password: process.env.DB_PASSWORD || 'my-password',
      host: process.env.DB_HOST || 'localhost',
      dialect: process.env.DB_DIALECT || 'mysql',
      models: `${app.path}/${app.options.db.modelsRel}`,
      modelsRel: app.options.db.modelsRel,
      migrations: `${app.path}/${app.options.db.migrationsRel}`,
      migrationsRel: app.options.db.migrationsRel,
    };
    this.db = new Database(this.dbOptions, this.path);
  }

  askForName(
    def = 'cocasus-app',
    message = 'What is the name of your project?'
  ) {
    return new Promise((resolve, reject) => {
      inquirer
        .prompt([
          {
            type: 'input',
            name: 'name',
            message: message,
            default: def ? def : null,
          },
        ])
        .then((answers) => {
          resolve(answers.name);
        })
        .catch((err) => {
          reject(err);
        });
    });
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
    this.structure.createStructure(['Controllers']);

    // Get the file content from /../utils/models/controllers/BaseController.js
    let controllerContent = fs.readFileSync(
      `${__dirname}/../utils/models/controllers/BaseController.js`,
      'utf8'
    );
    // Replace all $name by the name of the controller
    const controller = controllerContent.replace(/\$name/g, name);
    // Create the file
    fs.writeFileSync(
      this.path + '/Controllers/' + name + '.js',
      controller,
      'utf8'
    );

    console.info(`Made controller ${argv.name}`);
  }
}

new Cli();
