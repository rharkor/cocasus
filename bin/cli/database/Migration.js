const Model = require('../../vendor/db/Model');

const Migration = {
  call: (queryInterface, method, ...args) => {
    if (method === 'createTable' && args[0] instanceof Model) {
      const model = args[0];
      const tableName = model.name;
      const content = model.content;
      const options = model.options;
      const result = queryInterface[method](tableName, content, options);
      return result;
    } else if (method === 'dropTable' && args[0] instanceof Model) {
      const model = args[0];
      const tableName = model.name;
      const result = queryInterface[method](tableName);
      return result;
    }
    const result = queryInterface[method](...args);
    return result;
  },
};

module.exports = Migration;
