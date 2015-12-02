/* global rootRequire */
const checkAuth = rootRequire('app/utils/middleware').checkAuth;

module.exports = function(app) {
	app.get('/', checkAuth);
};
