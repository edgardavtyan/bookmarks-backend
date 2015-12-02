module.exports = function(app) {
	app.use((req, res, next) => {
		res.errors = [];
		next();
	});

	require('./root')(app);
	require('./user/register')(app);
	require('./user/login')(app);
	require('./category')(app);

	app.use((req, res) => {
		res.json({ errors: res.errors });
	});
};
