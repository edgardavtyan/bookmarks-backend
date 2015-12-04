/* global rootRequire */
const errors = rootRequire('app/utils/errors');
const expect = rootRequire('test/utils/chai').expect;

const utils = module.exports = {};

utils.expectNotAuthenticated = function(done) {
	return function(err, res) {
		expect(res.statusCode).to.equal(401);
		expect(res.body.errors).to.contain(errors.auth.notAuthenticated);
		done();
	};
};

utils.makePostRequest = function(agent, url, data, callback) {
	return function() {
		agent
		.post(url)
		.type('form')
		.send(data)
		.end(callback);
	};
};

utils.makePutRequest = function(agent, url, data, callback) {
	return function() {
		agent
		.put(url)
		.type('form')
		.send(data)
		.end(callback);
	};
};

utils.makeDeleteRequest = function(agent, url, data, callback) {
	return function() {
		agent
		.delete(url)
		.send(data)
		.end(callback);
	};
};

utils.login = function(agent, credentials) {
	return function(callback) {
		agent
		.post('/login')
		.type('form')
		.send(credentials)
		.end(callback);
	};
};

utils.clearModel = function(model) {
	return function(callback) {
		model.Model.remove({}, callback);
	};
};

utils.saveModel = function(model, data, callback) {
	return function(innerCallback) {
		new model.Model(data).save((err, category) => {
			if (callback) callback(category);
			innerCallback();
		});
	};
};
