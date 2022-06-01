// Suggested method: get
    // Suggested route: /
    static search(req, res, next) {
        const app = require('$apppath');
        const $model = app.models.$model;
        const query = {};
        Object.keys(req.query).forEach((key) => {
            query[key] = req.query[key];
        });
        $model.findAll({ where: query }).then((results) => {
            if (results && results.error) {
                app.errorHandler(results.error, req, res);
                return;
            }
            res.send(results);
        });
    }

    // Suggested method: put
    // Suggested route: /
    static create(req, res, next) {
        const app = require('$apppath');
        const $model = app.models.$model;
        const data = req.body;
        $model.create(data).then((results) => {
            if (results && results.error) {
                app.errorHandler(results.error, req, res);
                return;
            }
            res.send(results);
        });
    }

    // Suggested method: get
    // Suggested route: /:id
    static read(req, res, next) {
        const app = require('$apppath');
        const $model = app.models.$model;
        const id = req.params.id;
        $model.findByPk(id).then((results) => {
            if (results && results.error) {
                app.errorHandler(results.error, req, res);
                return;
            }
            res.send(results);
        });
    }

    // Suggested method: put
    // Suggested route: /:id
    static update(req, res, next) {
        const app = require('$apppath');
        const $model = app.models.$model;
        const id = req.params.id;
        const data = req.body;
        $model.update(data, { where: { id } }).then((results) => {
            if (results && results.error) {
                app.errorHandler(results.error, req, res);
                return;
            }
            res.send(results);
        });
    }

    // Suggested method: delete
    // Suggested route: /:id
    static del(req, res, next) {
        const app = require('$apppath');
        const $model = app.models.$model;
        const id = req.params.id;
        $model.destroy({ where: { id } }).then((results) => {
            if (results && results.error) {
                app.errorHandler(results.error, req, res);
                return;
            }
            res.send({ success: true });
        });
    }