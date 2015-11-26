const express = require('express');
const bodyParser = require('body-parser');
const userValidator = require('./utils/user-validator');
const app = module.exports = express();


app.use(bodyParser.urlencoded({ extended: true }));

app.post('/register', userValidator, (req, res) => {
	if (req.errors.length > 0) res.statusCode = 400;
	res.json({ errors: req.errors });
});
