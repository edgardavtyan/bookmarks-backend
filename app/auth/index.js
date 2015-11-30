/* global rootRequire */
const User = rootRequire('db').User;

module.exports = function(passport) {
	passport.serializeUser((user, done) => {
		done(null, user.id);
	});

	passport.deserializeUser((id, done) => {
		User.Model.findById(id, (err, user) => {
			done(err, user);
		});
	});
};
