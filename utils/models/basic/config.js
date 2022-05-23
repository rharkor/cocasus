const cocasus = require('cocasus');

const HomeController = require('./controllers/HomeController');

const coca = new cocasus();

coca.register('get', '/', (req, res) => {
  res.send('Hello World!');
});

coca.register('get', '/users', (req, res) => {
  coca.models.UserModel.findAll().then((users) => {
    res.send(users);
  });
});

coca.register('get', '/home', HomeController.call('index'));

module.exports = coca;
