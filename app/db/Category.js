/* global rootRequire */
const mongoose = require('mongoose');
const errors = rootRequire('app/utils/errors');

module.exports.Model = mongoose.model('Category', new mongoose.Schema({
	name: String,
	userId: String,
	icon: String,
}));

module.exports.putValidator = function(req, res, next) {
	if (res.errors.length > 0) return next();

	if (!req.body.id) {
		res.errors.push(errors.category.idEmpty);
	}

	if (!req.body.name) {
		res.errors.push(errors.category.nameEmpty);
	} else if (req.body.name.length > 100) {
		res.errors.push(errors.category.nameTooLong);
	}

	if (res.errors.length > 0) {
		res.statusCode = 400;
	}

	next();
};

module.exports.checkPostData = function(req, res, next) {
	if (res.errors.length > 0) return next();

	if (req.body.name && req.body.name.length > 100) {
		res.errors.push(errors.category.nameTooLong);
	}

	if (res.errors.length > 0) {
		res.statusCode = 400;
	}

	next();
};
