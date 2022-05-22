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
    // Get the file content
    let content = fs.readFileSync(`${root}/${path}`, 'utf8');
    // Render the file
    content = nunjucks.renderString(content, data);
    return (req, res) => {
      res.send(content);
    };
  }

  static async validate(req, rules) {
    await checkSchema(rules).run(req);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errors.array();
    }
    return false;
  }
}

module.exports = Request;
