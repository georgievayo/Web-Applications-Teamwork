const { expect } = require('chai');
const sinon = require('sinon');

describe('Users controller', () => {
    let data = null;
    let controller = null;
    let user = null;
    let foundItems = [];

    let req = null;
    let res = null;

    beforeEach(() => {
        data = {
            users: {
                getUser(username) {
                    return Promise.resolve(user);
                },
                getEvents(username) {
                    return Promise.resolve(foundItems);
                },
                getUserByPattern(pattern) {
                    return Promise.resolve(foundItems);
                },
                create(object) {
                    return;
                },
            },
        };

        controller =
            require('../../../../app/controllers/users.controller')(data);

        req = require('../../req-res').getRequestMock();
        res = require('../../req-res').getResponseMock();
    });

    describe('getLogin', () => {
        it('should redirect to user profile if there is auth. user', () => {
            req = require('../../req-res').getRequestMock({
                user: {
                    username: 'test',
                },
            });

            const spy = sinon.spy(res, 'redirect');
            const route = '/users/' + req.user.username;

            controller.getLogin(req, res);

            sinon.assert.calledWith(spy, route);
        });

        it('should render login view if there is no authenticated user', () => {
            controller.getLogin(req, res);

            expect(res.viewName).to.be.equal('login');
        });
    });

    describe('getSignup', () => {
        it('should redirect to user profile if there is auth. user', () => {
            req = require('../../req-res').getRequestMock({
                user: {
                    username: 'test',
                },
            });

            const spy = sinon.spy(res, 'redirect');
            const route = '/users/' + req.user.username;

            controller.getSignup(req, res);

            sinon.assert.calledWith(spy, route);
        });

        it('should render signup view if there is no authenticated user',
        () => {
            controller.getSignup(req, res);

            expect(res.viewName).to.be.equal('signup');
        });
    });

    describe('postSignup', () => {
        it(`should render signup view again and return 
            status code 400 if server validation did not pass`,
        () => {
            const result = {
                isEmpty: function() {
                    return false;
                },
                array: function() {
                    return [];
                },
            };

            req = require('../../req-res').getRequestMock({
                body: {
                    username: 'test',
                    password: '123456',
                },
                assert: function() {
                    return this;
                },
                len: function(first, second) {
                    return this;
                },
                equals: function(pass) {
                    return this;
                },
                isEmail: function() {
                    return this;
                },

                getValidationResult: function() {
                    return new Promise((resolve, rej) => {
                        resolve(result);
                    });
                },
            });

            const spy = sinon.spy(res, 'status');

            return controller.postSignup(req, res)
                .then(() => {
                    sinon.assert.calledWith(spy, 400);

                    expect(res.context).to.be.deep.equal({
                        context: req.body,
                        errors: result.array(),
                    });

                    expect(res.viewName).to.be.equal('signup');
                });
        });

        it(`should call create method of data.users
            if validation passes and redirect to login page`, () => {
                const result = {
                    isEmpty: function() {
                        return true;
                    },
                };

                req = require('../../req-res').getRequestMock({
                    body: {
                        username: 'test',
                        password: '123456',
                    },
                    assert: function() {
                        return this;
                    },
                    len: function(first, second) {
                        return this;
                    },
                    equals: function(pass) {
                        return this;
                    },
                    isEmail: function() {
                        return this;
                    },

                    getValidationResult: function() {
                        return new Promise((resolve, rej) => {
                            resolve(result);
                        });
                    },
                });

                const createSpy = sinon.spy(data.users, 'create');
                const redirectSpy = sinon.spy(res, 'redirect');

                return controller.postSignup(req, res)
                    .then(() => {
                        sinon.assert.calledWith(createSpy, req.body);

                        sinon.assert.calledWith(redirectSpy, '/login');
                    });
            });
    });

    describe('getUserProfile', () => {
        it('should redirect to error page if user is not found', () => {
            req = require('../../req-res').getRequestMock({
                params: { username: 'test' },
            });
            user = null;
            const spy = sinon.spy(res, 'redirect');
            const route = '/error';

            return controller.getUserProfile(req, res)
                .then(() => {
                    sinon.assert.calledWith(spy, route);
                });
        });

        it(`should render users/profile view without current
            user if there is no authenticated user`, () => {
                req = require('../../req-res').getRequestMock({
                    params: { username: 'test' },
                });
                user = {
                    username: 'test',
                };

                return controller.getUserProfile(req, res)
                    .then(() => {
                        expect(res.context).to.be.deep.equal({
                            context: user,
                        });

                        expect(res.viewName).to.be.equal('users/profile');
                    });
        });

        it(`should render users/profile view with current
            user if there is authenticated user`, () => {
                req = require('../../req-res').getRequestMock({
                    user: user,
                    params: { username: 'simona' },
                });
                user = {
                    username: 'test',
                };

                return controller.getUserProfile(req, res)
                    .then(() => {
                        expect(res.context).to.be.deep.equal({
                            context: user,
                            currentUser: req.user.username,
                        });

                        expect(res.viewName).to.be.equal('users/profile');
                    });
        });
    });

    describe('updateUserProfile', () => {
        it(`should render all errors if there 
        is error in server validation`, () => {
            // TO DO
        });
    });

    describe('getUserEvents', () => {
        it(`should render partials/events view 
            without context if no events were found`, () => {
            req = require('../../req-res').getRequestMock({
                params: { username: 'test' },
            });

            return controller.getUserEvents(req, res)
                .then(() => {
                    expect(res.viewName).to.be.equal('partials/events');
                });
        });

        it(`should render partials/events view 
            with context if some events were found`, () => {
            req = require('../../req-res').getRequestMock({
                params: { username: 'test' },
            });
            foundItems = [1, 2, 3, 4];

            return controller.getUserEvents(req, res)
                .then(() => {
                    expect(res.context).to.be.deep.equal({
                        events: foundItems,
                    });

                    expect(res.viewName).to.be.equal('partials/events');
                });
        });
    });

    describe('searchUser', () => {
        it(`should render partials/users view
            if isPartial query parameter is specified`, () => {
                req = require('../../req-res').getRequestMock({
                    query: {
                        name: 'pattern',
                        isPartial: true,
                    },
                });
                foundItems = [1, 2, 3, 4];

                return controller.searchUser(req, res)
                    .then(() => {
                        expect(res.context).to.be.deep.equal({
                            users: foundItems,
                        });

                        expect(res.viewName).to.be.equal('partials/users');
                    });
        });

        it(`should render search/search view
            if isPartial query parameter is not specified`, () => {
                req = require('../../req-res').getRequestMock({
                    query: {
                        name: 'pattern',
                    },
                });
                foundItems = [1, 2, 3, 4];

                return controller.searchUser(req, res)
                    .then(() => {
                        expect(res.context).to.be.deep.equal({
                            title: req.query.name,
                            users: foundItems,
                        });

                        expect(res.viewName).to.be.equal('search/search');
                    });
        });
    });
});
