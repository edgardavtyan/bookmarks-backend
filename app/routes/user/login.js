const passport = require('passport');

module.exports = function(app) {
	app.post('/user/login', (req, res, next) => {
		passport.authenticate('local', (err, user, info) => {
			if (info && info.error) req.errors.push(info.error);
			next();
		})(req, res);
	});
};
