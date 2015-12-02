/* global rootRequire */
const passport = require('passport');
const messages = rootRequire('app/utils/messages');

module.exports = function(app) {
	app.post('/user/login', (req, res, next) => {
		passport.authenticate('local', (err, user, info) => {
			if (info && info.error) {
				req.errors.push(info.error);
				req.message = messages.login.failed;
			} else {
				req.logIn(user, loginErr => {
					if (loginErr) {
						console.log(loginErr);
						return;
					}

					req.message = messages.login.successful;
				});
			}
			next();
		})(req, res);
	});
};
