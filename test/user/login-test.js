/* global rootRequire */
rootRequire('app');
const restler = require('restler');
const messages = rootRequire('app/utils/messages');
const errors = rootRequire('app/utils/errors');
const config = rootRequire('app/config');
const User = rootRequire('app/db').User;
const expect = rootRequire('test/utils/chai').expect;

describe('Login', () => {
	beforeEach(done => {
		User.Model.remove({}, () => done());
	});

	it('return error given not existing username', done => {
		const data = { username: 'user', password: '123123' };
		makeLoginRequest(data, body => {
			expect(body.errors).to.contain(errors.username.notFound);
			expect(body.message).to.contain(messages.login.failed);
			done();
		});
	});

	it('login given correct data', done => {
		const data = { username: 'user', password: '123123' };
		new User.Model(data).save(() => {
			makeLoginRequest(data, body => {
				expect(body.errors).to.be.empty();
				expect(body.message).to.contain(messages.login.successful);
				done();
			});
		});
	});
});

function makeLoginRequest(data, callback) {
	restler.post(`${config.server.url}/user/login`, { data }).on('complete', callback);
}
