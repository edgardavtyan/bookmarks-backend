/* global rootRequire */
const checkAuth = rootRequire('app/utils/middleware').checkAuth;
const Category = rootRequire('app/db/Category');

module.exports = function(app) {
	app.get('/category', checkAuth, (req, res, next) => {
		if (res.errors.length > 0) return next();

		Category.Model.find({ userId: req.user.id }, (err, categories) => {
			if (err) return next();

			res.json(categories);
		});
	});

	app.post('/category', checkAuth, Category.checkPostData, (req, res, next) => {
		if (res.errors.length > 0) return next();

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

	app.put('/category', checkAuth, Category.putValidator, (req, res, next) => {
		if (res.errors.length > 0) return next();

		Category.Model.findOneAndUpdate(
			{ _id: req.body.id },
			{ name: req.body.name },
			() => res.send());
	});

	app.delete('/category', checkAuth, (req, res, next) => {
		if (res.errors.length > 0) return next();

		Category.Model.remove({}, () => res.send());
	});
};
