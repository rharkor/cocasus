# Cocasus

Cocasus is a simple, fast, and powerful web framework for Javascript.

```js
const cocasus = require('cocasus');

const coca = new cocasus();

coca.register('/', (req, res) => {
  res.send('Hello World!');
});

coca.start();
```

## Installation

This framework is available through the [npm registry](https://www.npmjs.com).

Make sure to install Node.js first.

Then create a new project with following command:

```sh
npm init
```

You can now install cocasus

```sh
npm install cocasus
```

## Initialization

Cocasus is a framework with a precise architecture.
To make sure to have a clean environment initialize the project with the following command:

```sh
# Existing project
cocasus init

# Override all files if necessary
cocasus init --force

# Initialize the project directly with npx
npx cocasus init
```

## Usage

This framework is based on multiple npm packages. When you initialize the cocasus app you can specify a lot of options to customize the framework and it's subpackages.

This is an example of all available options :

```js
const cocasus = require('cocasus');
const express = require('express');
const { dirname } = require('path');
require('dotenv').config();

// You can attach an express app directly to the cocasus instance
// This can be very usefull on existing projects
const app = express();

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// All the path are in absolute format, except the path with 'Rel' suffix which are relative to the project root
const absPath = dirname(require.main.filename);
const options = {
  listening: {
    message: 'App listening on http://$host:$port', // Message when the app is started
    verbose: true, // If false no message will be displayed
    host: process.env.HOST || null, // Host to listen on (for docker use we suggest to put null)
    port: process.env.PORT || 8080, // Port to listen on
  },
  init: {
    cors: true, // Enable CORS
    json: true, // Enable JSON parsing
    static: `${absPath}/resources/static`, // Static folder (accessible on /)
    views: `${absPath}/resources/views`, // Views folder
    viewEngine: 'nunjucks', // View engine (nunjucks, pug, ejs, ...), make sure to install the corresponding package and naming your html file with the same extension as the view engine
  },
  logger: {
    error: {
      path: './log', // Path to the log folder
      fileName: 'error.log', // Name of the log file
      message: 'Something went wrong..', // Message to display when an error occurs
      exceptionCode: process.env.EXCEPTION_CODE || 500, // Code to send when an error occurs
    },
    access: {
      path: './log', // Path to the log folder
      fileName: 'access.log', // Name of the log file
    },
    object: null, // If you want to use a custom logger, you can pass an object with the following methods: error, info, warn, debug
    enabled: true, // If false no log will be created
  },
  sass: {
    src: `${absPath}/resources/static/styles`, // Path to the sass folder
    dest: `${absPath}/resources/static/styles`, // Path to the sass compilation (css) destination folder
    outputStyle: debug ? 'nested' : 'compressed', // Nested, expanded, compact, compressed
    type: 'sass', // sass, scss
  },
  db: {
    database: process.env.DB_DATABASE || 'cocasus', // Database name
    username: process.env.DB_USER || 'my-user', // Database username
    password: process.env.DB_PASSWORD || 'my-password', // Database password
    host: process.env.DB_HOST || 'localhost', // Database host
    dialect: process.env.DB_DIALECT || 'mysql', // Database dialect (mysql, postgres, sqlite, ...)  (see https://sequelize.org/master/manual/getting-started.html#dialects)
    modelsRel: 'database/models', // Relative path to the models folder
    models: `${absPath}/database/models`, // Path to the models folder
    migrationsRel: 'database/migrations', // Relative path to the migrations folder
    migrations: `${absPath}/database/migrations`, // Path to the migrations folder
    enabled: true, // Set it to false if you don't want to use the database
  },
  models: [], // List of models (it's automatically added so don't add it manually)
  debug, // If true, the framework will log all the information
};

const coca = new cocasus(app, options); // If the app is null the framework will automatically create a new express app

// Start the server
coca.start();
```

## Features

- Robust routing
- The performance of express
- The power of sequelize
- Easy to use
- Migrations
- Logging
- Models
- Controllers

## Documentation

All the detailed documentation can be found on the [Github repository](https://github.com/rharkor/cocasus/wiki)
