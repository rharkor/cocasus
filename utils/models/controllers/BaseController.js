const Controller = require('../vendor/http/controllers/Controller');
const Request = require('../vendor/http/requests/Request');

class $name extends Controller {
  static path = __dirname;

  static index() {
    return `Controller ${this.name}`;
  }
}

module.exports = $name;
