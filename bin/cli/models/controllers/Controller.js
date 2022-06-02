const Request = require('../requests/Request');
const sp = require('synchronized-promise');

class Controller {
  static call(method) {
    // Call the method
    return async (req, res, next) => {
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

        let resp = await this[method](req, res, next);
        // Test if the response is a function
        if (typeof resp === 'function') {
          resp = await resp(req, res, next);
          return;
        }
        if (resp) {
          res.send(resp);
        }
      } catch (error) {
        next(new Error(error));
      }
    };
  }
}

module.exports = Controller;
