const Controller = require('../vendor/http/controllers/Controller');

class $name extends Controller {
  static path = __dirname;

  static index() {
    return {
      state: 'success',
      message: 'Hello World!',
    };
  }
}

module.exports = $name;
