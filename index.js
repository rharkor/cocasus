const express = require('express');
const subdomain = require('express-subdomain');
const cors = require('cors');
const sassMiddleware = require('node-sass-middleware');
const path = require('path');
const cookieParser = require('cookie-parser');
const formData = require('express-form-data');
const bodyParser = require('body-parser');
const fs = require('fs');
const i18n = require('i18next');
const Backend = require('i18next-node-fs-backend');
const i18nextMiddleware = require('i18next-express-middleware');

const utils = require('./utils/method');
const colors = utils.colors;
const Logger = require('./framework/middlewares/Logger.middleware.js');
const Database = require('./framework/database/Database.js');
const Jobs = require('./framework/jobs/Jobs.js');

class Cocasus {
  constructor(options = {}, app = null, debug = utils.getEnv('DEBUG', true)) {
    if (app) {
      this.app = app;
    } else {
      this.app = express();
    }

    this.path = process.cwd();
    this.routes = [];

    this.router = null;

    this.options = {
      listening: {
        message: 'App listening on http://$host:$port',
        verbose: true,
        host: utils.getEnv('HOST', null),
        subdomain: utils.getEnv('SUBDOMAIN', null),
        port: utils.getEnv('PORT', 8080),
      },
      init: {
        cors: true,
        json: true,
        cookies: true,
        form: true,
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
          exceptionCode: utils.getEnv('LOGGER_EXCEPTION_CODE', 500),
          exceptionTemplate: null,
          routeUndefinedCode: utils.getEnv('LOGGER_ROUTE_UNDEFINED_CODE', 404),
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
        debug: false,
      },
      db: {
        database: utils.getEnv('DB_DATABASE', 'my-database'),
        username: utils.getEnv('DB_USER', 'my-user'),
        password: utils.getEnv('DB_PASSWORD', 'my-password'),
        host: utils.getEnv('DB_HOST', 'localhost'),
        dialect: utils.getEnv('DB_DIALECT', 'mysql'),
        models: 'database/models',
        migrations: 'database/migrations',
        seeders: 'database/seeders',
        enabled: true, // Set it to false if you don't want to use a database
      },
      lang: {
        directory: 'resources/lang',
        enabled: true,
      },
      jobs: {
        list: {
          // exampleJob: {
          //   name: 'exampleJob',
          //   description: 'This is an example job',
          //   cron: '*/1 * * * * *',
          //   handler: () => {
          //     console.log('Example job');
          //   },
          //   enabled: false,
          // },
        },
        directory: 'jobs',
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

    this.jobs = new Jobs(this.options.jobs, this.path);

    this.initDb();

    if (this.options.init.cors) {
      this.app.use(cors());
    }
    if (this.options.init.json) {
      this.app.use(express.json());
    }
    if (this.options.init.cookies) {
      this.app.use(cookieParser());
    }
    if (this.options.init.form) {
      this.app.use(bodyParser.urlencoded({ extended: true }));
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
        this.engine = {};
        this.engine.env = env;
        this.app.engine('jinja', nunjucks.render);
        this.app.set('engine', env);
        this.app.set('view engine', 'jinja');
      }
      this.app.use((req, res, next) => {
        const engine = res.app.get('engine');
        const config = req.app.get('config');

        engine.addGlobal('config', config);
        engine.addGlobal('request', req);

        next();
      });
    }
    this.app.use(
      sassMiddleware({
        src: path.join(this.path, this.options.sass.src),
        dest: path.join(this.path, this.options.sass.dest),
        debug: this.options.sass.debug,
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
        colors.warning(
          "Warning you are running in debug mode, don't use it in production"
        )
      );
    }

    const exclusions = [];
    if (!this.options.logger.enabled) {
      exclusions.push('logger');
    }
    if (!this.options.db.enabled) {
      exclusions.push('db');
    }
    utils.printEnvMessages(exclusions);

    this.authDb();

    // register jobs
    this.jobs.startHandling();

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
          .replace(
            '$host',
            this.options.listening.subdomain
              ? this.options.listening.subdomain + '.' + host
              : host
          )
          .replace('$port', port);
        console.log(colors.success(message), '\n');
      }
    };
    if (this.options.listening.subdomain && this.router) {
      this.app.use(subdomain(this.options.listening.subdomain, this.router));
    } else if (this.router) {
      this.app.use(this.router);
    }
    if (!host) {
      host = 'localhost';
      this.server = this.app.listen(port, callbackRun);
    } else {
      this.server = this.app.listen(port, host, callbackRun);
    }
  }

  route(method, path, callback, ...options) {
    const callbackGuarded = async (req, res, next) => {
      try {
        await callback(req, res, next);
      } catch (e) {
        this.errorHandler(e, req, res, next);
      }
    };
    // Create the router if it doesn't exist
    if (!this.router && this.options.listening.subdomain) {
      this.router = express.Router();
    }
    if (this.router) {
      this.app.use(this.router);
      this.router[method](path, callbackGuarded);
    } else {
      this.app[method](path, callbackGuarded);
    }
    this.routes.push({
      method,
      path,
      name: options.name || '',
      description: options.description || '',
    });
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

  authDb() {
    if (this.options.db.enabled) {
      this.db.auth();
    }
  }
}

module.exports = Cocasus;
