/* global rootRequire */
const LocalStrategy = require('passport-local').Strategy;
const User = rootRequire('db').User;
const errors = rootRequire('utils/errors');

module.exports = new LocalStrategy((username, password, done) => {
	User.Model.findOne({ username }, (err, user) => {
		if (err) {
			return done(err);
		}

		if (!user) {
			return done(null, false, { error: errors.username.notFound });
		}

		if (user.password !== password) {
			return done(null, false, { error: errors.password.notFound });
		}

		return done(null, user);
	});
});
