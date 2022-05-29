# Cocasus

Cocasus is a simple, fast, and powerful web framework for Javascript.

```js
const cocasus = require('cocasus');

const coca = new cocasus();

coca.route('/', (req, res) => {
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

All the detailed documentation can be found on the [Documentation](https://cocasus.devision.fr/docs)
