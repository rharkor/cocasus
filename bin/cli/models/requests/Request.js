const { dirname } = require('path');
const { validationResult, checkSchema } = require('express-validator');

const utils = require('../../utils/method');
class Request {
  constructor() {}

  static view(
    path,
    data,
    root = `${dirname(require.main.filename)}`
  ) {
    return (req, res) => {
      const app = utils.getApp(root);
      const viewsPath = app.options.init.views;
      res.render(`${root}/${viewsPath}/${path}`, data);
    };
  }

  static async validate(req, rules) {
    await checkSchema(rules).run(req);
    const errors = validationResult(req);
    if (!Object.keys(errors).length === 0) {
      return errors.array();
    }
    return false;
  }
}

module.exports = Request;
