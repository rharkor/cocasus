const Request = require('../requests/Request');
const sp = require('synchronized-promise');

class Controller {
  static call(method) {
    // Call the method
    return (req, res, next) => {
      try {
        // Pass Request.validate to the req
        req.validate = (rules) => {
          const request = req;
          delete request.validate;
          const syncValidate = sp(Request.validate);
          const validation = syncValidate(request, rules);
          if (validation) {
            const errors = [];
            validation.forEach((error) => {
              errors.push(error.msg);
            });
            throw errors;
          }

          return validation;
        };

        const resp = this[method](req, res, next);
        // Test if the response is a function
        if (typeof resp === 'function') {
          resp(req, res, next);
          return;
        }
        res.send(resp);
      } catch (error) {
        next(new Error(error));
      }
    };
  }

  static crud(
    app,
    model,
    route,
    options = {
      search: {
        enabled: true,
        method: 'get',
        path: '/',
        handler: null,
      },
      create: {
        enabled: true,
        method: 'put',
        path: '/',
        handler: null,
      },
      read: {
        enabled: true,
        method: 'get',
        path: '/:id',
        handler: null,
      },
      update: {
        enabled: true,
        method: 'put',
        path: '/:id',
        handler: null,
      },
      delete: {
        enabled: true,
        method: 'delete',
        path: '/:id',
        handler: null,
      },
    }
  ) {
    // Search
    if (options.search.enabled) {
      const searchPath =
        options.search.path.charAt(0) === '/'
          ? options.search.path
          : `/${options.search.path}`;
      app.route(
        options.search.method,
        `${route}${searchPath}`,
        options.search.handler
          ? options.search.handler
          : (req, res, next) => {
              const query = {};
              Object.keys(req.query).forEach((key) => {
                query[key] = req.query[key];
              });
              model.findAll({ where: query }).then((results) => {
                if (results && results.error) {
                  app.errorHandler(results.error, req, res);
                  return;
                }
                res.send(results);
              });
            }
      );
    }

    // Create
    if (options.create.enabled) {
      const createPath =
        options.create.path.charAt(0) === '/'
          ? options.create.path
          : `/${options.create.path}`;

      app.route(
        options.create.method,
        `${route}${createPath}`,
        options.create.handler
          ? options.create.handler
          : (req, res, next) => {
              const data = req.body;
              model.create(data).then((results) => {
                if (results && results.error) {
                  app.errorHandler(results.error, req, res);
                  return;
                }
                res.send(results);
              });
            }
      );
    }

    // Read
    if (options.read.enabled) {
      const readPath =
        options.read.path.charAt(0) === '/'
          ? options.read.path
          : `/${options.read.path}`;

      app.route(
        options.read.method,
        `${route}${readPath}`,
        options.read.handler
          ? options.read.handler
          : (req, res, next) => {
              const id = req.params.id;
              model.findByPk(id).then((results) => {
                if (results && results.error) {
                  app.errorHandler(results.error, req, res);
                  return;
                }
                res.send(results);
              });
            }
      );
    }

    // Update
    if (options.update.enabled) {
      const updatePath =
        options.update.path.charAt(0) === '/'
          ? options.update.path
          : `/${options.update.path}`;

      app.route(
        options.update.method,
        `${route}${updatePath}`,
        options.update.handler
          ? options.update.handler
          : (req, res, next) => {
              const id = req.params.id;
              const data = req.body;
              model.update(data, { where: { id } }).then((results) => {
                if (results && results.error) {
                  app.errorHandler(results.error, req, res);
                  return;
                }
                res.send(results);
              });
            }
      );
    }

    // Delete
    if (options.delete.enabled) {
      const deletePath =
        options.delete.path.charAt(0) === '/'
          ? options.delete.path
          : `/${options.delete.path}`;

      app.route(
        options.delete.method,
        `${route}${deletePath}`,
        options.delete.handler
          ? options.delete.handler
          : (req, res, next) => {
              const id = req.params.id;
              model.destroy({ where: { id } }).then((results) => {
                if (results && results.error) {
                  app.errorHandler(results.error, req, res);
                  return;
                }
                res.send({ success: true });
              });
            }
      );
    }
  }
}

module.exports = Controller;
