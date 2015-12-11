/* global rootRequire */
'use strict';
const app = require('../app');
const async = require('async');
const supertest = require('supertest');
const Category = rootRequire('app/db/Category').Model;
const User = rootRequire('app/db/User').Model;
const errors = rootRequire('app/utils/errors');
const utils = rootRequire('test/utils/utils');
const expect = rootRequire('test/utils/chai').expect;

const url = '/category';
const credentials = {
	username: 'username',
	password: 'password',
};

let testCategory;

describe(`${url}/:id`, () => {
	beforeEach(done => {
		async.series([
			cb => Category.remove({}, cb),
			cb => User.remove({}, cb),
			cb => Category.create({ name: 'TestName' }, (err, result) => {
				testCategory = { id: result.id, name: result.name };
				cb();
			}),
			() => User.create(credentials, done),
		]);
	});

	describe('GET', () => {
		it('handle unauthorized requests', done => {
			supertest(app).get('/category/123').end(utils.expectUnauthorized(done));
		});

		it('return error given non existing id', done => {
			const agent = supertest.agent(app);
			async.series([
				cb => utils.login(agent, credentials, cb),
				() => agent.get(`${url}/-123`).end((err, res) => {
					expect(res.statusCode).to.equal(400);
					expect(res.body.errors).to.contain(errors.category.idNotFound);
					done();
				}),
			]);
		});

		it('return category given existing id', done => {
			const agent = supertest.agent(app);
			async.series([
				cb => utils.login(agent, credentials, () => cb(null)),
				() => agent.get(`${url}/${testCategory.id}`).end((err, res) => {
					expect(res.statusCode).to.equal(200);
					expect(res.body).to.eql(testCategory);
					done();
				}),
			]);
		});
	});

	describe('PUT', () => {
		it('handle unauthorized requests', done => {
			supertest(app).put(`${url}/123`).end(utils.expectUnauthorized(done));
		});

		it('return error given non existing id', done => {
			const agent = supertest.agent(app);
			async.series([
				cb => utils.login(agent, credentials, cb),
				() => agent.put(`${url}/0`).end((err, res) => {
					expect(res.statusCode).to.equal(400);
					expect(res.body.errors).to.contain(errors.category.idNotFound);
					done();
				}),
			]);
		});

		it('update category with given existing id', done => {
			const agent = supertest.agent(app);
			const testUrl = `${url}/${testCategory.id}`;
			const newData = { name: 'New Name' };
			async.series([
				cb => utils.login(agent, credentials, cb),
				cb => agent.put(testUrl).type('form').send(newData).end((err, res) => {
					expect(res.statusCode).to.equal(200);
					expect(res.body).to.eql({ id: testCategory.id, name: newData.name });
					cb();
				}),
				() => Category.findById(testCategory.id, (err, category) => {
					expect(category.name).to.eql(newData.name);
					done();
				}),
			]);
		});
	});

	describe('DELETE', () => {
		it('handle unauthroized requests', done => {
			supertest(app).delete(`${url}/123`).end(utils.expectUnauthorized(done));
		});

		it('return error given non existing id', done => {
			const agent = supertest.agent(app);
			async.series([
				cb => utils.login(agent, credentials, cb),
				() => agent.delete(`${url}/0`).end((err, res) => {
					expect(res.statusCode).to.eql(400);
					expect(res.body.errors).to.contain(errors.category.idNotFound);
					done();
				}),
			]);
		});

		it('delete category with given existing id', done => {
			const agent = supertest.agent(app);
			const testUrl = `${url}/${testCategory.id}`;
			async.series([
				cb => utils.login(agent, credentials, cb),
				cb => agent.delete(testUrl).end((err, res) => {
					expect(res.statusCode).to.eql(200);
					cb();
				}),
				() => Category.findById(testCategory.id, (err, category) => {
					expect(category).to.be.null();
					done();
				}),
			]);
		});
	});
});
