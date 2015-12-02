/* global rootRequire */
const errors = rootRequire('app/utils/errors');
const checkAuth = rootRequire('app/utils/middleware').checkAuth;
const Category = rootRequire('app/db/Category');

module.exports = function(app) {
	app.get('/bookmark/category', checkAuth, (req, res, next) => {
		Category.Model.find({ userId: req.user.id }, (err, categories) => {
			if (err) return next();

			res.json(categories);
		});
	});

	app.post('/bookmark/category', checkAuth, (req, res) => {
		if (req.body.name && req.body.name.length > 100) {
			req.errors.push(errors.category.nameTooLong);
		}

		if (req.errors.length > 0) {
			res.statusCode = 400;
			return res.json({ errors: req.errors });
		}

		if (req.body.name === undefined || req.body.name === '') {
			req.body.name = 'New Category';
		}

		if (req.body.icon === undefined || req.body.icon === '') {
			req.body.icon = 'default';
		}

		new Category.Model({
			name: req.body.name,
			icon: req.body.icon,
			userId: req.user.id,
		}).save((err, category) => {
			res.json({ category });
		});
	});

	app.put('/bookmark/category', checkAuth, Category.putValidator, (req, res) => {
		Category.Model.findOneAndUpdate(
			{ _id: req.body.id },
			{ name: req.body.name },
			() => res.send());
	});
};
