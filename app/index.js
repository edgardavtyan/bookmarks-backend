const express = require('express');
const bodyParser = require('body-parser');
const User = require('./db').User;
const dbErrors = require('./db/errors');
const app = module.exports = express();

require('./db');

app.use(bodyParser.urlencoded({ extended: true }));

app.post('/register', User.Validator, (req, res, next) => {
	if (req.errors.length > 0) {
		res.statusCode = 400;
		next();
	} else {
		const user = new User.Model({
			username: req.body.username,
			password: req.body.password,
		});
		user.save(err => {
			if (err && err.code === dbErrors['duplicate-key']) {
				req.errors.push('username-exists');
			}

			next();
		});
	}
});

app.post('/register', (req, res) => {
	res.json({ errors: req.errors });
});

app.listen(1377);
