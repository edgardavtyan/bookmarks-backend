const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/test1');
mongoose.connection.on('error', err => console.log('Connection error:', err.message));

module.exports.User = require('./User');
