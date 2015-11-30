module.exports = function(app) {
	app.use((req, res, next) => {
		req.errors = [];
		next();
	});

	require('./root')(app);
	require('./user/register')(app);
	require('./user/login')(app);

	app.use((req, res) => {
		res.json({
			message: req.message,
			errors: req.errors,
		});
	});
};
