module.exports = function(req, res, next) {
	if (req.errors === undefined) {
		req.errors = [];
	}

	const username = req.body.username;
	if (username !== undefined) {
		if (username.length < 3) {
			req.errors.push('username-too-short');
		}

		if (username.length > 25) {
			req.errors.push('username-too-long');
		}

		if (!(/^[a-zA-Z0-9_]+$/g).test(username)) {
			req.errors.push('username-has-invalid-symbols');
		}
	} else {
		req.errors.push('username-empty');
	}

	const password = req.body.password;
	if (password !== undefined) {
		if (password.length < 3) {
			req.errors.push('password-too-short');
		}
	} else {
		req.errors.push('password-empty');
	}


	next();
};
