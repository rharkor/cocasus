const cocasus = require('cocasus');

const HomeController = require('./controllers/HomeController');

const coca = new cocasus({
  logger: {
    error: {
      exceptionTemplate: 'errors/500.jinja',
      routeUndefinedTemplate: 'errors/404.jinja'
    }
  }
});

coca.register('get', '/', (req, res) => {
  res.send('Hello World!');
});

coca.register('get', '/users', (req, res) => {
  coca.models.user.findAll().then((users) => {
    res.send(users);
  });
});

coca.register('get', '/home', HomeController.call('index'));

module.exports = coca;
