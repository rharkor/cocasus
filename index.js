const express = require('express');
const cors = require('cors');
const sassMiddleware = require('node-sass-middleware');
const { dirname } = require('path');
require('dotenv').config();

const Logger = require('./middlewares/Logger.middleware.js');
const Structure = require('./utils/Structure.js');
const Database = require('./utils/Database.js');

class Cocasus {
  constructor(app = null, options = {}, debug = process.env.DEBUG || true) {
    if (app) {
      this.app = app;
    } else {
      this.app = express();
    }

    this.path = dirname(require.main.filename);
    this.routes = [];

    this.options = {
      listening: {
        message: 'App listening on http://$host:$port',
        verbose: true,
        host: process.env.HOST || null,
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
          exceptionCode: process.env.EXCEPTION_CODE || 500,
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
        dest: `${this.path}/resources/static/styles`,
        outputStyle: debug ? 'nested' : 'compressed',
        type: 'sass',
      },
      db: {
        database: process.env.DB_DATABASE || 'my-database',
        username: process.env.DB_USER || 'my-user',
        password: process.env.DB_PASSWORD || 'my-password',
        host: process.env.DB_HOST || 'localhost',
        dialect: process.env.DB_DIALECT || 'mysql',
        modelsRel: 'database/models',
        models: `${this.path}/database/models`,
        migrationsRel: 'database/migrations',
        migrations: `${this.path}/database/migrations`,
        enabled: true, // Set it to false if you don't want to use the database
      },
      models: [],
      debug,
    };
    // Filter only the options that are not null
    this.options = this.assign(options, this.options);

    this.init();
  }

  init(options = {}, customApp = null) {
    if (customApp) {
      this.app = customApp;
    }

    // Init the db connection
    if (this.options.db.enabled) {
      this.db = new Database(this.options.db, null, this.options.debug);
      this.db.referenceAllModels();
      // Simplify the access to the models
      this.models = this.db.models;
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
        prefix: '/styles',
      })
    );

    if (this.options.init.cors) {
      this.app.use(cors());
    }
    if (this.options.init.json) {
      this.app.use(express.json());
    }

    // Setup the file directory
    this.app.use(express.static(this.options.init.static));

    this.options = this.assign(options, this.options);
    if (this.options.logger.enabled && !this.options.logger.object) {
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

    const callbackRun = () => {
      if (this.options.listening.verbose) {
        const message = this.options.listening.message
          .replace('$host', host)
          .replace('$port', port);
        console.log(message);
      }
    };
    if (!host) {
      host = 'localhost';
      this.server = this.app.listen(port, callbackRun);
    } else {
      this.server = this.app.listen(port, host, callbackRun);
    }
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
