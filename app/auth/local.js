/* global rootRequire */
const LocalStrategy = require('passport-local').Strategy;
const User = rootRequire('db').User;

module.exports = new LocalStrategy((username, password, done) => {
	User.Model.findOne({ username }, (err, user) => {
		if (err) {
			return done(err);
		}

		if (!user) {
			return done(null, false, { error: 'username-not-found' });
		}

		if (user.password !== password) {
			return done(null, false, { error: 'password-not-found' });
		}

		return done(null, user);
	});
});
