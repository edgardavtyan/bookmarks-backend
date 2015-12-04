const passport = require('passport');

module.exports = function(app) {
	app.post('/login', (req, res, next) => {
		passport.authenticate('local', (err, user, info) => {
			if (info && info.error) {
				res.errors.push(info.error);
				return next();
			}

			req.logIn(user, loginErr => {
				if (loginErr) {
					console.log(loginErr);
					return next();
				}
			});
			next();
		})(req, res);
	});
};
