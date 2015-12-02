/* global rootRequire */
const messages = rootRequire('utils/messages');
const errors = rootRequire('utils/errors');
const Category = rootRequire('db/Category');

module.exports = function(app) {
	app.get('/bookmark/category', (req, res, next) => {
		if (!req.isAuthenticated()) {
			req.errors.push(errors.auth.notAuthenticated);
			req.message = messages.auth.notAuthenticated;
			return next();
		}

		Category.Model.find({ userId: req.user.id }, (err, categories) => {
			if (err) return next();

			res.json(categories);
		});
	});

	app.post('/bookmark/category', (req, res, next) => {
		if (!req.isAuthenticated()) {
			req.errors.push(errors.auth.notAuthenticated);
			req.message = messages.auth.notAuthenticated;
			return next();
		}

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
};
