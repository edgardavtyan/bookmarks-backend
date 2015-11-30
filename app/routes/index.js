module.exports = function(app) {
	app.use((req, res, next) => {
		req.errors = [];
		next();
	});

	require('./user/register')(app);
	require('./user/login')(app);

	app.get('/', (req, res) => {
		res.send(req.isAuthenticated());
	});

	app.use((req, res) => {
		res.json({
			message: req.message,
			errors: req.errors,
		});
	});
};
