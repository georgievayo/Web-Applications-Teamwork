const express = require('express');
const passport = require('passport');

const init = (data) => {
    const app = express();
    app.set('view engine', 'pug');
    app.use('/libs', express.static('node_modules'));

    const homeController = require('./controllers/home.controller')();
    const eventsController = require('./controllers/events.controller')(data);
    const usersController = require('./controllers/users.controller')(data);
    require('../config/auth.config')(app, data, passport);
    app.use((req, res, next) => {
        res.locals.user = req.user;
        next();
    });
    app.use(require('connect-flash')());
    app.use((req, res, next) => {
        res.locals.messages = require('express-messages')(req, res);
        next();
});

    app.get('/', homeController.index);
    app.get('/login', usersController.getLogin);
    app.post('/login', passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login',
    }));

    app.get('/signup', usersController.getSignup);
    app.post('/signup', usersController.postSignup);
    app.get('/logout', usersController.logout);

    app.get('/events/create', eventsController.getCreateEvent);
    app.post('/events/create', eventsController.postCreateEvent);
    app.get('/events/:eventId', eventsController.getEventById);

    // Get events by category name
    app.get('/categories', eventsController.getAllCategories);
    app.get('/categories/:categoryName',
        eventsController.getAllEventsByCategory);

    // Get events by date
    app.get('/date', eventsController.getCalendar);
    app.get('/date/:selectedDate', eventsController.getAllEventsByDate);

    app.get('/users/:username', usersController.getUserProfile);
    app.get('/users/:username/edit', usersController.getUpdateUserProfile);
    app.post('/users/:username/edit', usersController.postUpdateUserProfile);
    app.get('/users/:username/myEvents', usersController.getUserEvents);

    return Promise.resolve(app);
};

module.exports = {
    init,
};
