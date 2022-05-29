const Model = require('../../vendor/db/Model');

const Migration = {
  call: (queryInterface, method, ...args) => {
    if (method === 'createTable' && args[0] instanceof Model) {
      const model = args[0];
      const tableName = model.name;
      const content = model.content;
      // Reorder the columns
      const columns = {};
      if (content.id !== undefined) {
        columns.id = content.id;
      }
      for (const columnName in content) {
        if (
          columnName !== 'id' &&
          columnName !== 'createdAt' &&
          columnName !== 'updatedAt'
        ) {
          columns[columnName] = content[columnName];
        }
      }
      if (content.createdAt !== undefined) {
        columns.createdAt = content.createdAt;
      }
      if (content.updatedAt !== undefined) {
        columns.updatedAt = content.updatedAt;
      }
      const options = model.options;
      const result = queryInterface[method](tableName, columns, options);
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
