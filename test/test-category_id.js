/* global rootRequire */
'use strict';
const app = require('../app');
const async = require('async');
const supertest = require('supertest');
const Category = rootRequire('app/db/Category');
const User = rootRequire('app/db/User');
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
			cb => utils.clearModel(Category, cb),
			cb => utils.clearModel(User, cb),
			cb => utils.saveModel(Category, { name: 'TestName' }, (err, result) => {
				testCategory = { id: result.id, name: result.name };
				cb();
			}),
			() => utils.saveModel(User, credentials, done),
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
				() => utils.makeGetRequest(agent, `${url}/-123`, {}, (err, res) => {
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
				() => utils.makeGetRequest(agent, `${url}/${testCategory.id}`, {}, (err, res) => {
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
				() => utils.makePutRequest(agent, `${url}/0`, {}, (err, res) => {
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
				cb => utils.makePutRequest(agent, testUrl, newData, (err, res) => {
					expect(res.statusCode).to.equal(200);
					expect(res.body).to.eql({ id: testCategory.id, name: newData.name });
					cb();
				}),
				() => Category.Model.findById(testCategory.id, (err, category) => {
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
				() => utils.makeDeleteRequest(agent, `${url}/0`, {}, (err, res) => {
					expect(res.statusCode).to.eql(400);
					expect(res.body.errors).to.contain(errors.category.idNotFound);
					done();
				}),
			]);
		});

		it('delete category with given existing id', done => {
			const agent = supertest.agent(app);
			const query = `${url}/${testCategory.id}`;
			async.series([
				cb => utils.login(agent, credentials, cb),
				cb => utils.makeDeleteRequest(agent, query, {}, (err, res) => {
					expect(res.statusCode).to.eql(200);
					cb();
				}),
				() => Category.Model.findById(testCategory.id, (err, category) => {
					expect(category).to.be.null();
					done();
				}),
			]);
		});
	});
});
