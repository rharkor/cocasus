const { dirname } = require('path');
const { validationResult, checkSchema } = require('express-validator');

const utils = require('../../utils/method');
class Request {
  constructor() {}

  static view(path, data, root = `${dirname(require.main.filename)}`) {
    return (req, res) => {
      const app = utils.getApp(root);
      const viewsPath = app.options.init.views;
      res.render(`${root}/${viewsPath}/${path}`, data);
    };
  }

  static renderToHtml(
    path,
    data,
    format = true,
    root = `${dirname(require.main.filename)}`
  ) {
    const app = utils.getApp(root);
    const viewsPath = app.options.init.views;
    if (app.engine && app.engine.env) {
      let result = app.engine.env.render(`${root}/${viewsPath}/${path}`, data);
      if (format) {
        result = result
          .replace(/\n/g, '')
          .replace(/\r/g, '')
          .replace(/"/g, '\\"')
          .replace(/'/g, "\\'");
      }
      return result;
    }
  }

  static async validate(req, rules) {
    await checkSchema(rules).run(req);
    const errors = validationResult(req);
    if (!Object.keys(errors).length === 0) {
      return errors.array();
    }
    return false;
  }

  static async redirect(res, url) {
    res.redirect(url);
  }
}

module.exports = Request;
