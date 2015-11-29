module.exports = function(app) {
	require('./user/register')(app);

	app.post('/register', (req, res) => {
		res.json({ errors: req.errors });
	});
};
