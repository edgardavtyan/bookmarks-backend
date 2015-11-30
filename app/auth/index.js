const User = require('../db').User;

module.exports = function(passport) {
	passport.serializeUser((user, done) => {
		console.log(user);
		done(null, user.id);
	});

	passport.deserializeUser((id, done) => {
		User.Model.findById(id, (err, user) => {
			done(err, user);
		});
	});
};
