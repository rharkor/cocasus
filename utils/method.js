const chalk = require('chalk');
const { table } = require('table');
require('dotenv').config();

const utils = {};

utils.assign = (target, source) => {
  const keys = Object.keys(source);
  const result = {};
  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];
    if (key in target) {
      if (typeof target[key] === 'object') {
        result[key] = utils.assign(target[key], source[key]);
      } else {
        result[key] = target[key];
      }
    } else {
      result[key] = source[key];
    }
  }
  return result;
};

utils.colors = {
  error: chalk.bold.red,
  warning: chalk.hex('#FFA500'), // Orange color
  success: chalk.green,
  info: chalk.blue,
  debug: chalk.hex('#008080'), // Teal color
};

let envMessages = [];

utils.getEnv = (key, defaultValue) => {
  const debug = process.env.DEBUG || true;
  if (process.env[key]) {
    return process.env[key];
  }
  if (debug)
    envMessages.push([
      utils.colors.warning(key),
      utils.colors.debug(defaultValue),
    ]);
  return defaultValue;
};

utils.printEnvMessages = (exclude) => {
  if (envMessages.length > 0) {
    exclude.forEach((element) => {
      envMessages = envMessages.filter((message) => {
        if (
          !message[0]
            .replace(/.*;0m/, '')
            .startsWith(element.toUpperCase() + '_')
        )
          return message;
      });
    });

    const data = [
      [utils.colors.info('Key: '), utils.colors.info('Default Value: ')],
      ...envMessages,
    ];
    const config = {
      header: {
        alignment: 'center',
        content: 'The following environment variables are not defined in .env',
      },
      columnDefault: {
        paddingLeft: 2,
        paddingRight: 2,
        width: 40,
      },
    };
    console.log(table(data, config));
  }
};

utils.camelToSnake = (str) => {
  return str.replace(/([A-Z])/g, '_$1').toLowerCase();
};

utils.getApp = (path) => {
  try {
    const app = require(`${path}/config.js`);
    // Test if app is an empty bracket
    if (Object.keys(app).length === 0) {
      console.log(
        utils.colors.error(
          'No app found, make sure to export your app in config.js\nExample: module.exports = app;'
        )
      );
      return;
    }
    return app;
  } catch (e) {
    const moduleName = e.message.split("'")[1];
    if (e.code === 'MODULE_NOT_FOUND' && moduleName === `${path}/config.js`) {
      // Get the name of the not found module
      console.log(utils.colors.error('Please declare your app in config.js'));
      return;
    }
    console.error(e);
  }
};

module.exports = utils;
