const cocasus = require('cocasus');

const HomeController = require('./controllers/HomeController');

const coca = new cocasus({
  lang: {
    enabled: false,
  }
});

coca.route('get', '/', HomeController.call('index'));

coca.route('get', '/users', (req, res) => {
  coca.models.user.findAll().then((users) => {
    res.send(users);
  });
});

module.exports = coca;
