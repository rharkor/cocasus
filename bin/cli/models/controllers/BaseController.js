const Controller = require('../vendor/http/controllers/Controller');
const Request = require('../vendor/http/requests/Request');

class $name extends Controller {
  static path = __dirname;

  static index() {
    // Return randomly a description
    const descriptions = ['home.desc1', 'home.desc2'];
    const description =
      descriptions[Math.floor(Math.random() * descriptions.length)];
    return Request.view('base.html', { description, date: new Date() });
  }
}

module.exports = $name;
