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
};
