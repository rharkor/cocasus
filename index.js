const express = require('express');
const cors = require('cors');
const sassMiddleware = require('node-sass-middleware');
const { dirname } = require('path');
require('dotenv').config();

const Logger = require('./middlewares/Logger.middleware.js');
const Structure = require('./utils/structure.js');

class Cocasus {
  constructor(app = null, options = {}, debug = true) {
    if (app) {
      this.app = app;
    } else {
      this.app = express();
    }
    this.path = dirname(require.main.filename);
    this.routes = [];

    this.options = {
      listening: {
        message: 'Listening on http://$host:$port',
        verbose: true,
        host: process.env.HOST || 'localhost',
        port: process.env.PORT || 8080,
      },
      init: {
        cors: true,
        json: true,
        static: `${this.path}/resources/static`,
        views: `${this.path}/resources/views`,
        viewEngine: 'nunjucks',
      },
      logger: {
        error: {
          path: './log',
          fileName: 'error.log',
          message: 'Something went wrong..',
          exceptionCode: 500,
        },
        access: {
          path: './log',
          fileName: 'access.log',
        },
        object: null,
        enabled: true,
      },
      sass: {
        src: `${this.path}/resources/static/styles`,
        dest: `${this.path}/resources/static/styles/compiled`,
        outputStyle: debug ? 'nested' : 'compressed',
        type: 'sass',
      },
      debug,
    };
    // Filter only the options that are not null
    this.options = this.assign(options, this.options);

    this.init();
  }

  init(options = {}, customApp = null) {
    this.#plug();

    if (customApp) {
      this.app = customApp;
    }

    this.app.set('views', this.options.init.views);
    if (this.options.init.viewEngine) {
      if (this.options.init.viewEngine === 'nunjucks') {
        const nunjucks = require('nunjucks');
        nunjucks.configure(this.options.init.views, {
          autoescape: true,
          express: this.app,
        });
        this.app.engine('jinja', nunjucks.render);
        this.app.set('view engine', 'jinja');
      }
    }
    this.app.use(
      sassMiddleware({
        src: this.options.sass.src,
        dest: this.options.sass.dest,
        debug: this.options.debug,
        outputStyle: this.options.sass.outputStyle,
        indentedSyntax: this.options.sass.type === 'sass',
      })
    );

    this.app.use(cors());
    this.app.use(express.json());

    // Setup the file directory
    this.app.use(express.static(this.options.init.static));

    this.options = this.assign(options, this.options);
    if (this.options.logger.enabled) {
      this.options.logger.object = new Logger(
        this.options.logger,
        this.options.debug
      );
    }
  }

  assign(target, source) {
    const keys = Object.keys(source);
    const result = {};
    for (let i = 0; i < keys.length; i += 1) {
      const key = keys[i];
      if (key in target) {
        if (typeof target[key] === 'object') {
          result[key] = this.assign(target[key], source[key]);
        } else {
          result[key] = target[key];
        }
      } else {
        result[key] = source[key];
      }
    }
    return result;
  }

  #plug() {
    Object.prototype.isEmpty = function () {
      for (var prop in this) if (this.hasOwnProperty(prop)) return false;
      return true;
    };
  }

  initDirectory() {
    new Structure(this.path).createStructure();
  }

  // It's really important to call this method after the routes
  setupLogger() {
    if (this.options.logger.object) {
      this.options.logger.object.getLoggers().forEach((logger) => {
        this.app.use(logger);
      });
    }
  }

  start(
    host = this.options.listening.host,
    port = this.options.listening.port
  ) {
    if (this.options.debug) {
      console.log(
        "Warning you are running in debug mode, don't use it in production"
      );
    }
    this.setupLogger();
    this.server = this.app.listen(port, host, () => {
      if (this.options.listening.verbose) {
        const message = this.options.listening.message
          .replace('$host', host)
          .replace('$port', port);
        console.log(message);
      }
    });
  }

  register(method, path, callback) {
    this.app[method](path, callback);
    this.routes.push({ method, path });
  }

  getRoutes() {
    return this.routes;
  }
}

module.exports = Cocasus;
