const inquirer = require('inquirer');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const cliInterface = {};

cliInterface.commands = {
  makeController: null,
  init: null,
  getRoutes: null,
  getJobs: null,
  dbMigrateUp: null,
  dbMigrateDown: null,
  makeMigration: null,
  makeModel: null,
  makeJob: null,
};

function askForName(
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

cliInterface.createInterface = () => {
  yargs(hideBin(process.argv))
    // BASIC
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
        const name = argv.name || (await askForName());
        if (cliInterface.commands.init) {
          cliInterface.commands.init(argv, name);
        }
      }
    )
    .command(
      'routes',
      'Get the routes of the app',
      (yargs) => {},
      () => {
        if (cliInterface.commands.getRoutes) {
          cliInterface.commands.getRoutes();
        }
      }
    )
    .command(
      'jobs',
      'Get the jobs of the app',
      (yargs) => {},
      () => {
        if (cliInterface.commands.getJobs) {
          cliInterface.commands.getJobs();
        }
      }
    )
    // MAKE:
    .command(
      'make:controller [name]',
      'Create a new controller',
      (yargs) => {
        return yargs.positional('name', {
          describe: 'name of the controller',
          type: 'string',
        });
      },
      async (argv) => {
        const name =
          argv.name ||
          (await askForName(null, 'What is the name of the controller?'));
        if (cliInterface.commands.makeController) {
          cliInterface.commands.makeController(name);
        }
      }
    )
    .command(
      'make:model [name]',
      'Create a new model',
      (yargs) => {
        return yargs.positional('name', {
          describe: 'name of the model',
          type: 'string',
        });
      },
      async (argv) => {
        const name =
          argv.name ||
          (await askForName(null, 'What is the name of the model?'));
        if (cliInterface.commands.makeModel) {
          cliInterface.commands.makeModel(name);
        }
      }
    )
    .command(
      'make:migration [name]',
      'Create a new migration',
      (yargs) => {
        return yargs.positional('name', {
          describe: 'name of the migration',
          type: 'string',
        });
      },
      async (argv) => {
        const name =
          argv.name ||
          (await askForName(null, 'What is the name of the migration?'));
        if (cliInterface.commands.makeMigration) {
          cliInterface.commands.makeMigration(name);
        }
      }
    )
    .command(
      'make:job [name]',
      'Create a new job',
      (yargs) => {
        return yargs.positional('name', {
          describe: 'name of the job',
          type: 'string',
        });
      },
      async (argv) => {
        const name =
          argv.name || (await askForName(null, 'What is the name of the job?'));
        if (cliInterface.commands.makeJob) {
          cliInterface.commands.makeJob(name);
        }
      }
    )
    // DB:
    .command(
      'db:migrate:up',
      'Run the migrations',
      (yargs) => {},
      async () => {
        if (cliInterface.commands.dbMigrateUp) {
          cliInterface.commands.dbMigrateUp();
        }
      }
    )
    .command(
      'db:migrate:down',
      'Rollback the migrations',
      (yargs) => {},
      async () => {
        if (cliInterface.commands.dbMigrateDown) {
          cliInterface.commands.dbMigrateDown();
        }
      }
    )
    .demandCommand(1)
    .strict()
    .showHelpOnFail(true)
    .parse();
};

module.exports = cliInterface;
