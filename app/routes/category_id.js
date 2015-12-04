/* global rootRequire */
const checkAuth = rootRequire('app/utils/middleware').checkAuth;
const Category = rootRequire('app/db/Category');
const errors = rootRequire('app/utils/errors');

const url = '/category/:id';

module.exports = function(app) {
	app.all(url, checkAuth);

	app.get(url, (req, res, next) => {
		if (res.errors.length > 0) return next();

		Category.Model.findById(req.params.id, (err, category) => {
			if (!category) {
				res.statusCode = 400;
				res.errors.push(errors.category.idNotFound);
				return next();
			}

			res.json({
				id: category.id,
				name: category.name,
			});
		});
	});

	app.put(url, (req, res, next) => {
		if (res.errors.length > 0) return next();

		const query = { _id: req.params.id };
		Category.Model.findOneAndUpdate(query, req.body, { new: true }, (err, category) => {
			if (!category) {
				res.statusCode = 400;
				res.errors.push(errors.category.idNotFound);
				return next();
			}

			res.json({
				id: category.id,
				name: category.name,
			});
		});
	});

	app.delete(url, (req, res, next) => {
		if (res.errors.length > 0) return next();

		Category.Model.remove({ _id: req.params.id }, (err, result) => {
			if (!result || result.result.n === 0) {
				res.statusCode = 400;
				res.errors.push(errors.category.idNotFound);
				return next();
			}

			res.send();
		});
	});
};
