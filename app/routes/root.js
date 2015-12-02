/* global rootRequire */
const errors = rootRequire('app/utils/errors');
const messages = rootRequire('app/utils/messages');

module.exports = function(app) {
	app.get('/', (req, res, next) => {
		if (!req.isAuthenticated()) {
			req.errors.push(errors.auth.notAuthenticated);
			req.message = messages.auth.notAuthenticated;
		}

		next();
	});
};
