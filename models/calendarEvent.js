const Sequelize = require('sequelize');
const db = require('../config/DBConfig');

const CalendarEvent = db.define('calendarEvent', {
    eventName: {
        type: Sequelize.STRING
    },
    eventDate: {
        type: Sequelize.DATEONLY,
    },
    eventStart: {
        type: Sequelize.TIME,
    },
    eventDescription: {
        type: Sequelize.STRING,
    },
});

module.exports = CalendarEvent;