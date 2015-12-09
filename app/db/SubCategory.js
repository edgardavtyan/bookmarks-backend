/* global rootRequire */
const mongoose = require('mongoose');
const errors = rootRequire('app/utils/errors');

module.exports.Model = mongoose.model('SubCategory', new mongoose.Schema({
	name: String,
	categoryId: mongoose.Schema.Types.ObjectId,
}));

module.exports.postValidator = function(req, res, next) {
	if (res.errors.length > 0) return next();

	if (req.body.name) {
		if (req.body.name.length > 100) res.errors.push(errors.subcategory.nameTooLong);
	} else {
		req.body.name = 'New SubCategory';
	}

	if (res.errors.length > 0) res.statusCode = 400;

	next();
};
