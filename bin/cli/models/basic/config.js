const cocasus = require('cocasus');

const HomeController = require('./controllers/HomeController');

const coca = new cocasus({
  logger: {
    error: {
      exceptionTemplate: 'errors/500.jinja',
      routeUndefinedTemplate: 'errors/404.jinja',
    },
  },
});

coca.route('get', '/', (req, res) => {
  res.send('Hello World!');
});

coca.route('get', '/users', (req, res) => {
  coca.models.user.findAll().then((users) => {
    if (users && users.error) {
      coca.errorHandler(users.error, req, res);
      return;
    }
    res.send(users);
  });
});

coca.route('get', '/users/:id', (req, res) => {
  coca.models.user.findByPk(req.params.id).then((user) => {
    if (user && user.error) {
      coca.errorHandler(user.error, req, res);
      return;
    }
    res.send(user);
  });
});

coca.route('get', '/home', HomeController.call('index'));

HomeController.crud(coca, coca.models.user, '/crud/users');

module.exports = coca;
