const fs = require('fs');
const { dirname } = require('path');
const simpleLogger = require('simple-node-logger');
const AbstractAppender = require('simple-node-logger').AbstractAppender;

const colors = require('../../utils/method').colors;

const basicAppender = function () {
  ('use strict');
  const appender = this;

  const opts = {
    typeName: 'basicAppender',
  };

  AbstractAppender.extend(this, opts);

  // format and write all entry/statements
  this.write = function (entry) {
    let fields = appender.formatEntry(entry);
    fields[0] = fields[0].replace(/\..../, '');
    const message = fields.join(' ');
    const level = entry.level.toLowerCase();

    process.stdout.write(colors[level](message) + '\n');
  };
};

class Logger {
  constructor(options, debug, viewsPath) {
    this.options = options;
    this.debug = debug;
    this.viewsPath = viewsPath;
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
    delete errorLogger.getAppenders()[0];
    errorLogger.addAppender(new basicAppender());
    const error = (err, req, res, next) => {
      if (error) {
        errorLogger.error(err.message);
      }
      if (!this.options.error.exceptionTemplate) {
        if (res)
          res.status(parseInt(this.options.error.exceptionCode)).send({
            error: this.debug ? err.message : this.options.error.message,
          });
      } else {
        const fileName = this.options.error.exceptionTemplate;
        const filePath = `${dirname(require.main.filename)}/${
          this.viewsPath
        }/${fileName}`;
        if (res)
          res
            .status(parseInt(this.options.error.exceptionCode))
            .render(filePath, {
              debug: this.debug,
              error: err,
            });
      }
    };
    const routeUndefined = (req, res, next) => {
      errorLogger.error(`Route ${req.url} not found`);
      if (!this.options.error.routeUndefinedTemplate) {
        res.status(parseInt(this.options.error.routeUndefinedCode)).send({
          error: this.debug
            ? `Route ${req.url} not found`
            : this.options.error.message,
        });
      } else {
        const fileName = this.options.error.routeUndefinedTemplate;
        const filePath = `${dirname(require.main.filename)}/${
          this.viewsPath
        }/${fileName}`;
        res
          .status(parseInt(this.options.error.routeUndefinedCode))
          .render(filePath, {
            debug: this.debug,
            req,
          });
      }
    };

    this.createFolder(this.options.access.path);
    const accessLogger = simpleLogger.createSimpleLogger({
      logFilePath: `${this.options.access.path}/${this.options.access.fileName}`,
      timestampFormat: 'YYYY-MM-DD HH:mm:ss',
    });
    delete accessLogger.getAppenders()[0];
    accessLogger.addAppender(new basicAppender());
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
    this.loggers.routeUndefined = routeUndefined;
    this.loggersSource.error = errorLogger;
    this.loggersSource.access = accessLogger;
    this.loggersSource.routeUndefined = routeUndefined;
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
