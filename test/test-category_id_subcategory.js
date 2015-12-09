/* global rootRequire */
'use strict';
const app = require('../app');
const async = require('async');
const supertest = require('supertest');
const User = rootRequire('app/db/User');
const Category = rootRequire('app/db/Category');
const SubCategory = rootRequire('app/db/SubCategory');
const errors = rootRequire('app/utils/errors');
const utils = rootRequire('test/utils/utils');
const expect = rootRequire('test/utils/chai').expect;
const faker = rootRequire('test/utils/faker-custom');

const credentials = { username: 'user', password: 'pass' };
let categoryId, url;

describe('/category/:id/subcategory', () => {
	beforeEach(done => {
		async.series([
			cb => User.Model.remove({}, cb),
			cb => Category.Model.remove({}, cb),
			cb => SubCategory.Model.remove({}, cb),
			cb => User.Model.create(credentials, cb),
			() => utils.saveModel(Category, { name: 'TestCategory' }, (err, category) => {
				categoryId = category.id;
				url = `/category/${categoryId}/subcategory`;
				done();
			}),
		]);
	});

	describe('GET', () => {
		it('handle unauthorized requests', done => {
			supertest(app).get(url).end(utils.expectUnauthorized(done));
		});

		it('return 404 given non existing id', done => {
			const agent = supertest.agent(app);
			async.series([
				cb => utils.login(agent, credentials, cb),
				() => agent.get('/category/123/subcategory').end((err, res) => {
					expect(res.statusCode).to.eql(404);
					done();
				}),
			]);
		});

		it('return all subcategories', done => {
			const agent = supertest.agent(app);
			async.series([
				cb => utils.login(agent, credentials, cb),
				cb => SubCategory.Model.create({ name: 'TestName1', categoryId }, cb),
				cb => SubCategory.Model.create({ name: 'TestName2', categoryId }, cb),
				cb => SubCategory.Model.create({ name: 'TestName3', categoryId: faker.string(24) }, cb),
				cb => SubCategory.Model.create({ name: 'TestName4', categoryId: faker.string(24) }, cb),
				() => agent.get(url).end((err, res) => {
					expect(res.body[0]).to.contain({ name: 'TestName1', categoryId: String(categoryId) });
					expect(res.body[1]).to.contain({ name: 'TestName2', categoryId: String(categoryId) });
					done();
				}),
			]);
		});
	});

	describe('POST', () => {
		it('handle unauthorized requests', done => {
			supertest(app).post('/category/123/subcategory').end(utils.expectUnauthorized(done));
		});

		it('return error given non existing id', done => {
			const agent = supertest.agent(app);
			const id = faker.string(24);
			async.series([
				cb => utils.login(agent, credentials, cb),
				() => utils.makePostRequest(agent, `/category/${id}/subcategory`, {}, (err, res) => {
					expect(res.statusCode).to.eql(404);
					expect(res.body.errors).to.contain(errors.category.idNotFound);
					done();
				}),
			]);
		});

		it('return error given too long name', done => {
			const agent = supertest.agent(app);
			const data = { name: faker.string(2000) };
			async.series([
				cb => utils.login(agent, credentials, cb),
				() => utils.makePostRequest(agent, url, data, (err, res) => {
					expect(res.statusCode).to.eql(400);
					expect(res.body.errors).to.contain(errors.subcategory.nameTooLong);
					done();
				}),
			]);
		});

		it('set default name given empty name', done => {
			const agent = supertest.agent(app);
			async.series([
				cb => utils.login(agent, credentials, cb),
				cb => utils.makePostRequest(agent, url, {}, (err, res) => {
					expect(res.statusCode).to.eql(200);
					expect(res.body).to.contain({ name: 'New SubCategory' });
					cb();
				}),
				() => SubCategory.Model.findOne({}, (err, subcategory) => {
					expect(subcategory.name).to.eql('New SubCategory');
					done();
				}),
			]);
		});

		it('save subcategory', done => {
			const agent = supertest.agent(app);
			const data = { name: faker.string(25) };
			async.series([
				cb => utils.login(agent, credentials, cb),
				cb => utils.makePostRequest(agent, url, data, (err, res) => {
					expect(res.statusCode).to.eql(200);
					expect(res.body).to.contain({ name: data.name, categoryId: String(categoryId) });
					cb();
				}),
				() => SubCategory.Model.findOne({}, (err, subcategory) => {
					expect(subcategory.name).to.eql(data.name);
					done();
				}),
			]);
		});
	});

	describe('DELETE', () => {
		it('handle unauthorized requests', done => {
			supertest(app).delete(url).end(utils.expectUnauthorized(done));
		});

		it('return 404 given non existing category id', done => {
			const agent = supertest.agent(app);
			async.series([
				cb => utils.login(agent, credentials, cb),
				() => utils.makeDeleteRequest(agent, `/category/${faker.string(24)}/subcategory`, {}, (err, res) => {
					expect(res.statusCode).to.eql(404);
					expect(res.body.errors).to.contain(errors.category.idNotFound);
					done();
				}),
			]);
		});

		it('delete all subcategories with given category id', done => {
			const agent = supertest.agent(app);
			async.series([
				cb => utils.login(agent, credentials, cb),
				cb => SubCategory.Model.create([{categoryId}, {categoryId}, {}, {}, {}], cb),
				cb => utils.makeDeleteRequest(agent, url, {}, (err, res) => {
					expect(res.statusCode).to.eql(200);
					cb();
				}),
				() => SubCategory.Model.find({}, (err, subcategories) => {
					expect(subcategories.length).to.eql(3);
					done();
				}),
			]);
		});
	});
});
