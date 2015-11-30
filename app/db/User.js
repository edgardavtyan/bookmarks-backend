/* global rootRequire */
const mongoose = require('mongoose');
const errors = rootRequire('utils/errors');

module.exports.Model = mongoose.model('User', new mongoose.Schema({
	username: {
		type: String,
		required: true,
		unique: true,
	},
	password: {
		type: String,
		required: true,
	},
}));

module.exports.Validator = function(req, res, next) {
	if (req.errors === undefined) {
		req.errors = [];
	}

	const username = req.body.username;
	if (username !== undefined) {
		if (username.length < 3) {
			req.errors.push(errors.username.tooShort);
		}

		if (username.length > 25) {
			req.errors.push(errors.username.tooLong);
		}

		if (!(/^[a-zA-Z0-9_]+$/g).test(username)) {
			req.errors.push(errors.username.invalidSymbols);
		}
	} else {
		req.errors.push(errors.username.empty);
	}

	const password = req.body.password;
	if (password !== undefined) {
		if (password.length < 3) {
			req.errors.push(errors.password.tooShort);
		}

		if (password.length > 25) {
			req.errors.push(errors.password.tooLong);
		}
	} else {
		req.errors.push(errors.password.empty);
	}

	next();
};
