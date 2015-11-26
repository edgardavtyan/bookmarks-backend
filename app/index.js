const express = require('express');
const bodyParser = require('body-parser');
const userValidator = require('./utils/user-validator');
const app = module.exports = express();


app.use(bodyParser.urlencoded({ extended: true }));

app.post('/register', userValidator, (req, res) => {
	res.json({ errors: req.errors });
});
