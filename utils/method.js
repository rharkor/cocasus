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

module.exports = utils;
