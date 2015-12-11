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

utils.login = function(agent, credentials, callback) {
	agent
	.post('/login')
	.type('form')
	.send(credentials)
	.end(callback);
};
