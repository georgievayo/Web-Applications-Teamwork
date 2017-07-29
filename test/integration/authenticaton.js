const request = require('supertest');
const { expect, should, assert } = require('chai');
const { cleanUp } = require('../shared/db.utils');

const init = require('../../app/app');

const signUpUser = (agent, user) => {
    return new Promise((resolve, reject) => {
        agent.post('/signup')
            .type('form')
            .send({
                username: user.username,
                password: user.password,
                passwordConfirm: user.username,
                email: user.email,
            })
            .end((err, res) => {
                resolve(res);
            });
    });
};

const signInUser = (agent, user) => {
    return new Promise((resolve, reject) => {
        agent.post('/signin')
            .type('form')
            .send({
                username: user.username,
                password: user.password,
            })
            .end((err, res) => {
                resolve(res);
            });
    });
};

describe('Authentication: ', () => {
    const config = {
        connectionString: 'mongodb://localhost/Events-test',
        port: 3002,
    };

    const user = {
        username: 'test-user',
        password: '123456',
        email: 'test-user@mail.com',
    };

    let app = null;
    let agent = null;

    beforeEach(() => Promise.resolve()
        .then(() => require('../../db').init(config.connectionString))
        .then((db) => require('../../data').init(db))
        .then((data) => require('../../app').init(data))
        .then((app_) => {
            app = app_;
            agent = request.agent(app_);
        })
    );

    afterEach(() => cleanUp(config.connectionString));

    describe('Signup: ', () => {
        describe('GET: ', () => {
            it('- should return 200', (done) => {
                request(app)
                    .get('/signup')
                    .expect(200)
                    .end((err, res) => {
                        if (err) {
                            return done(err);
                        }
                        return done();
                    });
            });
        });

        describe('POST: ', () => {
            it('- valid username, password and email', (done) => {
                agent.post('/signup')
                    .type('form')
                    .send({
                        username: user.username,
                        password: user.password,
                        passwordConfirm: user.password,
                        email: user.email,
                    })
                    .expect(302)
                    .end((err, res) => {
                        if (err) {
                            return done(err);
                        }
                        return done();
                    });
            });

            it('- short username', (done) => {
                agent.post('/signup')
                    .type('form')
                    .send({
                        username: '1',
                        password: user.password,
                        passwordConfirm: user.password,
                        email: user.email,
                    })
                    .expect(400)
                    .end((err, res) => {
                        if (err) {
                            return done(err);
                        }
                        return done();
                    });
            });

            it('- short password', (done) => {
                agent.post('/signup')
                    .type('form')
                    .send({
                        username: user.username,
                        password: '1',
                        passwordConfirm: '1',
                        email: user.email,
                    })
                    .expect(400)
                    .end((err, res) => {
                        if (err) {
                            return done(err);
                        }
                        return done();
                    });
            });

            it('- different passwords', (done) => {
                agent.post('/signup')
                    .type('form')
                    .send({
                        username: user.username,
                        password: '1',
                        passwordConfirm: `${user.password}1`,
                        email: user.email,
                    })
                    .expect(400)
                    .end((err, res) => {
                        if (err) {
                            return done(err);
                        }
                        return done();
                    });
            });

            it('- invalid email', (done) => {
                agent.post('/signup')
                    .type('form')
                    .send({
                        username: user.username,
                        password: user.password,
                        passwordConfirm: user.password,
                        email: 'invalid',
                    })
                    .expect(400)
                    .end((err, res) => {
                        if (err) {
                            return done(err);
                        }
                        return done();
                    });
            });
        });
    });

    describe('Login: ', () => {
        beforeEach(() => signUpUser(agent, user));

        describe('GET: ', () => {
            it('- should return 200', (done) => {
                request(app)
                    .get('/login')
                    .expect(200)
                    .end((err, res) => {
                        if (err) {
                            return done(err);
                        }
                        return done();
                    });
            });
        });

        describe('POST: ', () => {
            it('- correct username and password', (done) => {
                agent.post('/login')
                    .type('form')
                    .send({
                        username: user.username,
                        password: user.password,
                    })
                    .expect(302)
                    .end((err, res) => {
                        if (err) {
                            return done(err);
                        }
                        return done();
                    });
            });

            it('- wrong username', (done) => {
                agent.post('/login')
                    .type('form')
                    .send({
                        username: '1',
                        password: user.password,
                    })
                    .expect(302)
                    .end((err, res) => {
                        if (err) {
                            return done(err);
                        }
                        return done();
                    });
            });

            it('- wrong password', (done) => {
                agent.post('/signup')
                    .type('form')
                    .send({
                        username: user.username,
                        password: '1',
                    })
                    .expect(400)
                    .end((err, res) => {
                        if (err) {
                            return done(err);
                        }
                        return done();
                    });
            });
        });
    });

    describe('Logout: ', () => {
        describe('GET: ', () => {
            it('- should return 302', (done) => {
                signUpUser(agent, user);
                signInUser(agent, user);

                request(app)
                    .get('/logout')
                    .expect(302)
                    .end((err, res) => {
                        if (err) {
                            return done(err);
                        }
                        return done();
                    });
            });
        });
    });
});
