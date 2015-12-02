/* global rootRequire */
const errors = rootRequire('app/utils/errors');

module.exports = function(app) {
	app.get('/', (req, res, next) => {
		if (!req.isAuthenticated()) {
			req.errors.push(errors.auth.notAuthenticated);
		}

		next();
	});
};
