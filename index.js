const express = require('express');
const cors = require('cors');
const sassMiddleware = require('node-sass-middleware');
const path = require('path');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const i18n = require('i18next');
const Backend = require('i18next-node-fs-backend');
const i18nextMiddleware = require('i18next-express-middleware');

const utils = require('./utils/method');
const Logger = require('./framework/middlewares/Logger.middleware.js');
const Database = require('./framework/database/Database.js');

class Cocasus {
  constructor(options = {}, app = null, debug = utils.getEnv('DEBUG', true)) {
    if (app) {
      this.app = app;
    } else {
      this.app = express();
    }

    this.path = process.cwd();
    this.routes = [];

    this.options = {
      listening: {
        message: 'App listening on http://$host:$port',
        verbose: true,
        host: utils.getEnv('HOST', null),
        port: utils.getEnv('PORT', 8080),
      },
      init: {
        cors: true,
        json: true,
        cookies: true,
        controllers: 'controllers',
        static: 'resources/static',
        views: 'resources/views',
        viewEngine: 'nunjucks',
      },
      logger: {
        error: {
          path: './log',
          fileName: 'error.log',
          message: 'Something went wrong..',
          exceptionCode: utils.getEnv('EXCEPTION_CODE', 500),
          exceptionTemplate: null,
          routeUndefinedCode: utils.getEnv('ROUTE_UNDEFINED_CODE', 404),
          routeUndefinedTemplate: null,
        },
        access: {
          path: './log',
          fileName: 'access.log',
        },
        object: null,
        enabled: true,
      },
      sass: {
        src: 'resources/static/styles',
        dest: 'resources/static/styles',
        outputStyle: debug ? 'nested' : 'compressed',
        type: 'sass',
      },
      db: {
        database: utils.getEnv('DB_DATABASE', 'my-database'),
        username: utils.getEnv('DB_USER', 'my-user'),
        password: utils.getEnv('DB_PASSWORD', 'my-password'),
        host: utils.getEnv('DB_HOST', 'localhost'),
        dialect: utils.getEnv('DB_DIALECT', 'mysql'),
        models: 'database/models',
        migrations: 'database/migrations',
        enabled: true, // Set it to false if you don't want to use a database
      },
      lang: {
        default: 'en',
        queryParameter: 'lang',
        cookie: 'lang',
        directory: 'resources/lang',
        enabled: true,
      },
      models: [],
      debug,
    };
    // Filter only the options that are not null
    this.options = utils.assign(options, this.options);

    this.init();
  }

  init(options = {}, customApp = null) {
    if (customApp) {
      this.app = customApp;
    }

    this.options = utils.assign(options, this.options);
    if (this.options.logger.enabled && !this.options.logger.object) {
      this.options.logger.object = new Logger(
        this.options.logger,
        this.options.debug,
        this.options.init.views
      );
    }
    this.setupLogger();

    if (this.options.init.cors) {
      this.app.use(cors());
    }
    if (this.options.init.json) {
      this.app.use(express.json());
    }
    if (this.options.init.cookies) {
      this.app.use(cookieParser());
    }

    if (this.options.lang.enabled) {
      // Setup lang
      const locales = fs
        .readdirSync(path.join(this.path, this.options.lang.directory))
        .map((file) => file.split('.')[0]);
      i18n
        .use(Backend)
        .use(i18nextMiddleware.LanguageDetector)
        .init({
          backend: {
            loadPath:
              path.join(this.path, this.options.lang.directory) +
              '/{{lng}}.json',
          },
          fallbackLng: ['en'],
          preload: locales,
        });
      this.app.use(i18nextMiddleware.handle(i18n));
    }

    this.app.set('views', path.join(this.path, this.options.init.views));
    if (this.options.init.viewEngine) {
      if (this.options.init.viewEngine === 'nunjucks') {
        const nunjucks = require('nunjucks');
        const env = nunjucks.configure(this.options.init.views, {
          autoescape: true,
          express: this.app,
        });
        this.app.engine('jinja', nunjucks.render);
        this.app.set('view engine', 'jinja');
      }
    }
    this.app.use(
      sassMiddleware({
        src: path.join(this.path, this.options.sass.src),
        dest: path.join(this.path, this.options.sass.dest),
        debug: this.options.debug,
        outputStyle: this.options.sass.outputStyle,
        indentedSyntax: this.options.sass.type === 'sass',
        prefix: '/styles',
      })
    );

    // Setup the file directory
    this.app.use(
      express.static(path.join(this.path, this.options.init.static))
    );
  }

  // It's really important to call this method after the routes
  setupLogger() {
    if (this.options.logger.object) {
      this.options.logger.object.getLoggers().forEach((logger) => {
        // Test if logger function name is routeUndefined
        if (logger.name !== 'routeUndefined') {
          this.app.use(logger);
        }
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

    utils.printEnvMessages();

    this.initDb();

    // Attach the routeUndefined logger
    if (this.options.logger.object) {
      this.options.logger.object.getLoggers().forEach((logger) => {
        if (logger.name === 'routeUndefined') {
          this.app.use(logger);
        }
      });
    }

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

  route(method, path, callback) {
    const callbackGuarded = (req, res, next) => {
      try {
        callback(req, res, next);
      } catch (e) {
        this.errorHandler(e, req, res, next);
      }
    };
    this.app[method](path, callbackGuarded);
    this.routes.push({ method, path });
  }

  getRoutes() {
    return this.routes;
  }

  errorHandler(e, req, res, next) {
    this.options.logger.object.getLoggers().find((logger) => {
      if (logger.name === 'error') {
        logger(e, req, res, next);
      }
    });
  }

  initDb() {
    // Init the db connection
    if (this.options.db.enabled) {
      this.db = new Database(
        this.options.db,
        this.options.debug,
        this.path,
        this.errorHandler.bind(this)
      );
      this.db.referenceAllModels();
      // Simplify the access to the models
      this.models = this.db.models;
    }
  }
}

module.exports = Cocasus;
