/* global rootRequire */
const mongoose = require('mongoose');
const errors = rootRequire('app/utils/errors');

module.exports.Model = mongoose.model('Category', new mongoose.Schema({
	name: String,
	userId: String,
	icon: String,
}));

module.exports.putValidator = function(req, res, next) {
	if (!req.body.id) {
		req.errors.push(errors.category.idEmpty);
	}

	if (!req.body.name) {
		req.errors.push(errors.category.nameEmpty);
	} else if (req.body.name.length > 100) {
		req.errors.push(errors.category.nameTooLong);
	}

	if (req.errors.length > 0) {
		res.statusCode = 400;
		res.json({ errors: req.errors });
	} else {
		next();
	}
};
