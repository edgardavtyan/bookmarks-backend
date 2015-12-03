/* global rootRequire */
const errors = rootRequire('app/utils/errors');

const utils = module.exports = {};

utils.checkAuth = function(req, res, next) {
	if (!req.isAuthenticated()) {
		res.statusCode = 401;
		res.errors.push(errors.auth.notAuthenticated);
	}

	next();
};
