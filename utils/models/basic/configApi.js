const cocasus = require('cocasus');

const HomeController = require('./controllers/HomeController');

const coca = new cocasus();

coca.register('get', '/', HomeController.call('index'));

coca.register('get', '/users', (req, res) => {
  coca.models.user.findAll().then((users) => {
    res.send(users);
  });
});

module.exports = coca;
