#!/usr/bin/env node

const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const fs = require('fs');
const Structure = require('../utils/Structure');
const inquirer = require('inquirer');

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
      .parse();
  }

  askForName() {
    return new Promise((resolve, reject) => {
      inquirer
        .prompt([
          {
            type: 'input',
            name: 'name',
            message: 'What is the name of your project?',
            default: 'cocasus-app',
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
