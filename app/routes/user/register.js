const User = require('../../db').User;
const dbErrors = require('../../db/errors');

module.exports = function(app) {
	app.post('/register', User.Validator, (req, res, next) => {
		if (req.errors.length > 0) {
			res.statusCode = 400;
			next();
		} else {
			const user = new User.Model({
				username: req.body.username,
				password: req.body.password,
			});
			user.save(err => {
				if (err && err.code === dbErrors['duplicate-key']) {
					req.errors.push('username-exists');
				}

				next();
			});
		}
	});
};
