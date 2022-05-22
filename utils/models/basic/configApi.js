const cocasus = require('cocasus');

const HomeController = require('./controllers/HomeController');

const coca = new cocasus();

coca.register('get', '/', HomeController.call('index'));

module.exports = coca;
