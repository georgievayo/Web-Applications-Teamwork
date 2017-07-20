module.exports = (data) => {
    return {
        getCreateEvent: (req, res) => {
            if (!req.user) {
                return res.redirect('/login');
            }

            return data.categories.getAll()
                .then((categories) => {
                    return res.render('events/create', {
                        categories: categories,
                    });
                });
        },
        postCreateEvent: (req, res) => {
            if (!req.user) {
                return res.redirect('/login');
            }

            const event = req.body;

            return data.events.getByTitle(event.title)
                .then((result) => {
                    if (result !== null) {
                        return res.redirect('/error');
                    }

                    event.likes = 0;
                    event.photo = 'photo.jpg';
                    event.user = req.user.username;

                    data.events.create(event);

                    if (typeof event.categories === 'string') {
                        const category = event.categories;
                        data.categories.addEventToCategory(category, event);
                    } else {
                        event.categories.forEach((category) => {
                            data.categories.addEventToCategory(category, event);
                        });
                    }

                    data.users.addEventToUser(event.user, event);

                    return res.redirect('/');
                });
        },
        getEventByTitle: (req, res) => {
            const title = req.params.title;

            let event;
            data.events.getByTitle(title)
                .then((eventInformation) => {
                    event = eventInformation;
                    return data.chats.getLatestMessages(event.title);
                })
                .then((messages) => {
                    return res.render('events/details', {
                        event: event,
                        chat: messages,
                        user: req.user,
                    });
                });
        },
        getAllCategories: (req, res) => {
            return data.categories.getAll()
                .then((categories) => {
                    return res.render('categories/all', {
                        categories: categories,
                    });
                });
        },
        getEventsByCategory: (req, res) => { // Error here
            const category = req.params.name;

            return data.categories.getEventsByCategory(category)
                .then((events) => {
                    events = events.slice(0, 4);
                    return res.render('partials/events', {
                        events: events,
                    });
                });
        },
        getAllEventsByCategory: (req, res) => { // Error here
            const category = req.params.name;

            return data.categories.getEventsByCategory(category)
                .then((events) => {
                    // console.log(events); // OK
                    res.render('events/events', {
                        title: category,
                        events: events,
                    });
                });
        },
        getCalendar: () => {

        },
        getAllEventsByDate: (req, res) => {
            const date = req.params.date;

            return data.events.getByDate(date)
                .then((events) => {
                    return res.render('partials/events', {
                        events: events,
                    });
                });
        },
        updateEvent: (req, res) => {
            if (!req.user) {
                return res.redirect('/login');
            }

            const newEvent = req.body;
            const title = req.params.title;

            return data.events.getByTitle(title)
                .then((event) => {
                    if (event === null) {
                        return res.redirect('/error');
                    }

                    if (event.user !== req.user.username) {
                        return res.redirect('/error');
                    }

                    data.events.update(title, newEvent.date, newEvent.time,
                        newEvent.place, newEvent.details, newEvent.photo);

                    data.users.updateEvent(
                        event.user, title, newEvent.date,
                        newEvent.time, newEvent.place, newEvent.details,
                        event.categories, event.likes, newEvent.photo);

                    if (typeof event.categories === 'string') {
                        const category = event.categories;
                        data.categories.updateEvent(
                            category, title, newEvent.date, newEvent.time,
                            newEvent.place, newEvent.details, event.categories,
                            event.likes, newEvent.photo, event.user);
                    } else {
                        event.categories.forEach((category) => {
                            data.categories.updateEvent(category, title,
                                newEvent.date, newEvent.time, newEvent.place,
                                newEvent.details, event.categories,
                                event.likes, newEvent.photo, event.user);
                        });
                    }

                    return res.redirect('/api/events/' + title);
                });
        },
        deleteEvent: (req, res) => {
            if (!req.user) {
                return res.redirect('/login');
            }

            const title = req.params.title;

            return data.events.getEventByTitle(title)
                .then((event) => {
                    if (event === null) {
                        return res.redirect('/error');
                    }

                    if (event.user !== req.user.username) {
                        return res.redirect('/error');
                    }

                    data.events.remove(title);

                    data.users.removeEvent(req.user.username, title);

                    if (typeof event.categories === 'string') {
                        const category = event.categories;
                        data.categories.removeEvent(category, event);
                    } else {
                        event.categories.forEach((category) => {
                            data.categories.removeEvent(category, event);
                        });
                    }

                    return res.redirect('/');
                });
        },

        searchEvent: (req, res) => {
            const pattern = req.query.title;
            const partial = req.query.isPartial;

            if (partial) {
                return data.events.getByTitlePattern(pattern)
                .then((events) => {
                    return res.render('partials/events', {
                        events: events,
                    });
                });
            }

            return data.events.getByTitlePattern(pattern)
                .then((events) => {
                    return res.render('events/events', {
                        title: 'Search: ' + pattern,
                        events: events,
                    });
                });
        },
    };
};
