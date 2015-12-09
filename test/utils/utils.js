/* global rootRequire */
const errors = rootRequire('app/utils/errors');
const expect = rootRequire('test/utils/chai').expect;

const utils = module.exports = {};

utils.expectUnauthorized = function(done) {
	return function(err, res) {
		expect(res.statusCode).to.equal(401);
		expect(res.body.errors).to.contain(errors.auth.notAuthenticated);
		done();
	};
};

utils.makeGetRequest = function(agent, url, data, callback) {
	agent
	.get(url)
	.send(data)
	.end(callback);
};

utils.makePostRequest = function(agent, url, data, callback) {
	agent
	.post(url)
	.type('form')
	.send(data)
	.end(callback);
};

utils.makePutRequest = function(agent, url, data, callback) {
	agent
	.put(url)
	.type('form')
	.send(data)
	.end(callback);
};

utils.makeDeleteRequest = function(agent, url, data, callback) {
	agent
	.delete(url)
	.send(data)
	.end(callback);
};

utils.login = function(agent, credentials, callback) {
	agent
	.post('/login')
	.type('form')
	.send(credentials)
	.end(callback);
};

utils.clearModel = function(model, callback) {
	model.Model.remove({}, callback);
};

utils.saveModel = function(model, data, callback) {
	new model.Model(data).save(callback);
};
