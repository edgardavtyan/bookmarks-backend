'use strict';
/* global rootRequire */
const app = require('../app');
const async = require('async');
const supertest = require('supertest');
const errors = rootRequire('app/utils/errors');
const Category = rootRequire('app/db/Category');
const User = rootRequire('app/db/User');
const faker = rootRequire('test/utils/faker-custom');
const expect = rootRequire('test/utils/chai').expect;
const utils = rootRequire('test/utils/utils');

const url = '/category';
const credentials = {
	username: 'username',
	password: 'password',
};

describe(url, () => {
	let userId;
	let categoryId;


	beforeEach(done => {
		async.series([
			cb => utils.clearModel(Category, cb),
			cb => utils.clearModel(User, cb),
			cb => utils.saveModel(Category, {name: 'Test Name'}, (err, category) => {
				categoryId = category.id;
				cb();
			}),
			() => User.Model.create(credentials, (err, user) => {
				userId = user.id;
				done();
			}),
		]);
	});

	describe('GET', () => {
		it('handle not authenticated requests', done => {
			supertest(app)
				.get(url)
				.end(utils.expectNotAuthenticated(done));
		});

		it('return all bookmark categories', done => {
			const agent = supertest.agent(app);
			async.series([
				cb => addCategories(3, userId, cb),
				cb => addCategories(5, 'other_id', cb),
				cb => utils.login(agent, credentials, cb),
				() => agent.get(url).end((err, res) => {
					expect(res.body.length).to.equal(3);
					done();
				}),
			]);
		});
	});

	describe('POST', () => {
		it('handle not authenticated users', done => {
			supertest(app)
				.post(url)
				.type('form')
				.end(utils.expectNotAuthenticated(done));
		});

		it('fill empty category fields', done => {
			const agent = supertest.agent(app);
			supertest.agent(app);
			async.series([
				cb => utils.login(agent, credentials, cb),
				() => postRequestAndQueryDb(agent, {}, (err, category) => {
					expect(category).to.not.be.null();
					expect(category.name).to.equal('New Category');
					expect(category.icon).to.equal('default');
					done();
				}),
			]);
		});

		it('fill given category fields', done => {
			const agent = supertest.agent(app);
			const categoryData = {
				name: 'Category',
				icon: 'book',
			};

			async.series([
				cb => utils.login(agent, credentials, cb),
				() => postRequestAndQueryDb(agent, categoryData, (err, category) => {
					expect(category).to.not.be.null();
					expect(category.name).to.equal(categoryData.name);
					expect(category.icon).to.equal(categoryData.icon);
					done();
				}),
			]);
		});

		it('return error if category name is too long', done => {
			const agent = supertest.agent(app);
			const name = faker.string(1000);
			async.series([
				cb => utils.login(agent, credentials, cb),
				() => utils.makePostRequest(agent, url, { name }, (err, res) => {
					expect(res.statusCode).to.equal(400);
					expect(res.body.errors).to.contain(errors.category.nameTooLong);
					done();
				}),
			]);
		});
	});

	describe('PUT', () => {
		it('handle unauthorized requests', done => {
			supertest(app).put(url).end(utils.expectNotAuthenticated(done));
		});

		it('return error given no id', done => {
			const agent = supertest.agent(app);
			async.series([
				cb => utils.login(agent, credentials, cb),
				() => utils.makePutRequest(agent, url, {}, (err, res) => {
					expect(res.statusCode).to.equal(400);
					expect(res.body.errors).to.contain(errors.category.idEmpty);
					done();
				}),
			]);
		});

		it('return error given empty category name', done => {
			const agent = supertest.agent(app);
			async.series([
				cb => utils.login(agent, credentials, cb),
				() => utils.makePutRequest(agent, url, {}, (err, res) => {
					expect(res.statusCode).to.equal(400);
					expect(res.body.errors).to.contain(errors.category.nameEmpty);
					done();
				}),
			]);
		});

		it('return error given too long category name', done => {
			const data = {
				id: categoryId,
				name: faker.string(600),
			};
			const agent = supertest.agent(app);

			async.series([
				cb => utils.login(agent, credentials, cb),
				() => utils.makePutRequest(agent, url, data, (err, res) => {
					expect(res.statusCode).to.equal(400);
					expect(res.body.errors).to.contain(errors.category.nameTooLong);
					done();
				}),
			]);
		});

		it('change category name', done => {
			const agent = supertest.agent(app);
			const data = {
				id: categoryId,
				name: faker.string(50),
			};

			async.series([
				cb => utils.login(agent, credentials, cb),
				cb => utils.makePutRequest(agent, url, data, (err, res) => {
					expect(res.statusCode).to.equal(200);
					cb();
				}),
				() => Category.Model.findById(categoryId, (dbErr, category) => {
					expect(category.name).to.equal(data.name);
					done();
				}),
			]);
		});
	});

	describe('DELETE', () => {
		it('handle unauthorized requests', done => {
			supertest(app)
				.delete(url)
				.end(utils.expectNotAuthenticated(done));
		});

		it('remove all categories', done => {
			const agent = supertest.agent(app);
			async.series([
				cb => addCategories(5, null, cb),
				cb => utils.login(agent, credentials, cb),
				cb => utils.makeDeleteRequest(agent, url, {}, cb),
				() => Category.Model.find({}, (err, categories) => {
					expect(categories).to.be.empty();
					done();
				}),
			]);
		});
	});
});

function addCategories(count, userId, callback) {
	if (!userId) userId = 0;

	const categories = [];
	for (let i = 0; i < count; i++) {
		categories.push({ userId });
	}

	Category.Model.create(categories, callback);
}

function postRequestAndQueryDb(agent, data, callback) {
	agent
	.post(url)
	.type('form')
	.send(data)
	.end((err, res) => {
		Category.Model.findById(res.body.category._id, callback);
	});
}
