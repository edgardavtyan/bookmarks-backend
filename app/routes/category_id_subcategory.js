/* global rootRequire */
const async = require('async');
const checkAuth = rootRequire('app/utils/middleware').checkAuth;
const Category = rootRequire('app/db/Category');
const SubCategory = rootRequire('app/db/SubCategory');
const errors = rootRequire('app/utils/errors');

module.exports = function(app) {
	const url = '/category/:id/subcategory';

	app.all(url, checkAuth);

	app.get(url, (req, res, next) => {
		if (res.errors.length > 0) return next();

		SubCategory.Model.find({ categoryId: req.params.id }, (err, subcategories) => {
			if (err || subcategories.length === 0) {
				res.statusCode = 404;
				res.errors.push(errors.category.idNotFound);
				return next();
			}

			const mappedSubcategories = subcategories.map(elem => {
				return {
					id: elem.id,
					name: elem.name,
					categoryId: elem.categoryId,
				};
			});

			res.send(mappedSubcategories);
		});
	});

	app.post(url, SubCategory.postValidator, (req, res, next) => {
		if (res.errors.length > 0) return next();

		const data = { name: req.body.name, categoryId: req.params.id };

		async.series([
			cb => Category.Model.findById(req.params.id, (err, category) => {
				if (!category) {
					res.statusCode = 404;
					res.errors.push(errors.category.idNotFound);
					return next();
				}
				cb();
			}),
			() => SubCategory.Model.create(data, (err, subcategory) => {
				res.json({
					id: String(subcategory.id),
					name: subcategory.name,
					categoryId: String(subcategory.categoryId),
				});
			}),
		]);
	});

	app.delete(url, (req, res, next) => {
		if (res.errors.length > 0) return next();

		async.series([
			cb => Category.Model.findById(req.params.id, (err, category) => {
				if (!category) {
					res.statusCode = 404;
					res.errors.push(errors.category.idNotFound);
					return next();
				}
				cb();
			}),
			() => SubCategory.Model.remove({ categoryId: req.params.id }, () => res.send()),
		]);
	});
};
