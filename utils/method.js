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

utils.getEnv = (key, defaultValue) => {
  const debug = process.env.DEBUG || true;
  if (process.env[key]) {
    return process.env[key];
  }
  if (debug) console.warn(`${key} is not defined in .env file`);
  return defaultValue;
};

utils.camelToSnake = (str) => {
  return str.replace(/([A-Z])/g, '_$1').toLowerCase();
};

utils.getApp = (path) => {
  try {
    const app = require(`${path}/config.js`);
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
      moduleName === `${path}/config.js`
    ) {
      // Get the name of the not found module
      console.error('Please declare your app in config.js');
      return;
    }
    console.log(e);
  }
}

module.exports = utils;
