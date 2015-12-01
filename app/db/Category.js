const mongoose = require('mongoose');

module.exports.Model = mongoose.model('Category', new mongoose.Schema({
	name: String,
	userId: String,
	icon: String,
}));
