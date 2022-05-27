const nunjucks = require('nunjucks');
const fs = require('fs');
const { dirname } = require('path');
const { validationResult, checkSchema } = require('express-validator');

class Request {
  constructor() {}

  static view(
    path,
    data,
    root = `${dirname(require.main.filename)}/resources/views`
  ) {
    return (req, res) => {
      res.render(`${root}/${path}`, data);
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
