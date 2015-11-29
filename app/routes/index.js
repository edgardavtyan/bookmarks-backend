module.exports = function(app) {
	app.use((req, res, next) => {
		req.errors = [];
		next();
	});

	require('./user/register')(app);
	require('./user/login')(app);

	app.use((req, res) => {
		res.json({ errors: req.errors });
	});
};
