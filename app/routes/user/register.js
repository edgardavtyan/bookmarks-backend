/* global rootRequire */
const User = rootRequire('app/db').User;
const dbErrors = rootRequire('app/db/errors');
const errors = rootRequire('app/utils/errors');

module.exports = function(app) {
	app.post('/register', User.Validator, (req, res, next) => {
		if (res.errors.length > 0) return next();

		const user = new User.Model({
			username: req.body.username,
			password: req.body.password,
		});

		user.save(err => {
			if (err && err.code === dbErrors['duplicate-key']) {
				res.errors.push(errors.username.exists);
			}

			next();
		});
	});
};
