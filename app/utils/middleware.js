/* global rootRequire */
const errors = rootRequire('app/utils/errors');

const utils = module.exports = {};

utils.checkAuth = function(req, res, next) {
	if (req.isAuthenticated()) return next();

	res.statusCode = 400;
	res.json({ errors: [errors.auth.notAuthenticated] });
};
