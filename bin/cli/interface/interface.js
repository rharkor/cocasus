const inquirer = require('inquirer');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const cliInterface = {};

cliInterface.commands = {
  makeController: null,
  init: null,
  getRoutes: null,
  getJobs: null,
  makeMigration: null,
  makeModel: null,
  makeJob: null,
  makeScrud: null,
  dbMigrateUp: null,
  dbMigrateDown: null,
  dbMigrateReset: null,
  dbMigrateFresh: null,
  dbSeed: null,
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
    .command(
      'make:scrud [controller] [model]',
      'Insert scrud routes in a controller',
      (yargs) => {
        return yargs
          .positional('controller', {
            describe: 'name of the controller',
            type: 'string',
          })
          .positional('model', {
            describe: 'name of the model',
            type: 'string',
          });
      },
      async (argv) => {
        const name =
          argv.controller ||
          (await askForName(null, 'What is the name of the controller?'));
        const model =
          argv.model ||
          (await askForName(
            null,
            'What is the name of the model (name declared in the model file)?'
          ));

        if (cliInterface.commands.makeScrud) {
          cliInterface.commands.makeScrud(name, model);
        }
      }
    )
    .command(
      'make:crud [controller] [model]',
      'Insert scrud routes in a controller',
      (yargs) => {
        return yargs
          .positional('controller', {
            describe: 'name of the controller',
            type: 'string',
          })
          .positional('model', {
            describe: 'name of the model',
            type: 'string',
          });
      },
      async (argv) => {
        const name =
          argv.controller ||
          (await askForName(null, 'What is the name of the controller?'));
        const model =
          argv.model ||
          (await askForName(
            null,
            'What is the name of the model (name declared in the model file)?'
          ));

        if (cliInterface.commands.makeScrud) {
          cliInterface.commands.makeScrud(name, model);
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
    .command(
      'db:migrate:reset',
      'Reset the migrations',
      (yargs) => {},
      async () => {
        if (cliInterface.commands.dbMigrateReset) {
          cliInterface.commands.dbMigrateReset();
        }
      }
    )
    .command(
      'db:migrate:fresh',
      'Reset the migrations and run them',
      (yargs) => {
        return yargs.positional('seed', {
          describe: 'seed the database',
          type: 'boolean',
          default: false,
        });
      },
      async (args) => {
        if (cliInterface.commands.dbMigrateFresh) {
          await cliInterface.commands.dbMigrateFresh();
        }
        if (cliInterface.commands.dbSeed && args.seed) {
          cliInterface.commands.dbSeed();
        }
      }
    )
    .command(
      'db:seed',
      'Seed the database',
      (yargs) => {},
      async () => {
        if (cliInterface.commands.dbSeed) {
          cliInterface.commands.dbSeed();
        }
      }
    )
    .demandCommand(1)
    .strict()
    .showHelpOnFail(true)
    .parse();
};

module.exports = cliInterface;
