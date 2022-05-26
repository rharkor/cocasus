const fs = require('fs');
const simpleLogger = require('simple-node-logger');

class Logger {
  constructor(options, debug) {
    this.options = options;
    this.debug = debug;
    this.loggers = {};
    this.loggersSource = {};
  }

  createFolder(path) {
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path, { recursive: true });
    }
  }

  createLoggers() {
    this.createFolder(this.options.error.path);
    const errorLogger = simpleLogger.createSimpleLogger({
      logFilePath: `${this.options.error.path}/${this.options.error.fileName}`,
      timestampFormat: 'YYYY-MM-DD HH:mm:ss',
    });
    const error = (err, req, res, next) => {
      errorLogger.error(err.message);
      res
        .status(parseInt(this.options.error.exceptionCode))
        .send({ error: this.debug ? err.message : this.options.error.message });
    };

    this.createFolder(this.options.access.path);
    const accessLogger = simpleLogger.createSimpleLogger({
      logFilePath: `${this.options.access.path}/${this.options.access.fileName}`,
      timestampFormat: 'YYYY-MM-DD HH:mm:ss',
    });
    const access = (req, res, next) => {
      const requestObject = {
        method: req.method,
        path: req.path,
        body: req.body,
      };
      const responseObject = {
        statusCode: res.statusCode,
        body: res.body,
      };

      accessLogger.info(
        JSON.stringify({
          request: requestObject,
          response: responseObject,
        })
      );
      next();
    };
    this.loggers.error = error;
    this.loggers.access = access;
    this.loggersSource.error = errorLogger;
    this.loggersSource.access = accessLogger;
  }

  getLoggers() {
    if (Object.keys(this.loggers).length === 0) {
      this.createLoggers();
    }
    return Object.values(this.loggers);
  }

  getSourceLoggers() {
    if (Object.keys(this.loggersSource).length === 0) {
      this.createLoggers();
    }
    return this.loggersSource;
  }
}

module.exports = Logger;
