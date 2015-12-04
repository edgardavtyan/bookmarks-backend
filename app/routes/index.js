module.exports = function(app) {
	app.use((req, res, next) => {
		res.errors = [];
		next();
	});

	require('./root')(app);
	require('./register')(app);
	require('./login')(app);
	require('./category')(app);

	app.use((req, res) => {
		res.json({ errors: res.errors });
	});
};
