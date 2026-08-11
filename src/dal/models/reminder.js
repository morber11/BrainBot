const Sequelize = require('sequelize');
const database = require('../database/database.js');

const Reminder = database.define('reminder', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    guildId: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    channelId: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    creatorId: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    userId: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    remindAt: {
        type: Sequelize.DATE,
        allowNull: false,
    },
    alertAt: {
        type: Sequelize.DATE,
        allowNull: false,
    },
    alertOffsetMinutes: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 15,
    },
    message: {
        type: Sequelize.TEXT,
        allowNull: false,
    },
    alertSent: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    advanceSendingAt: {
        type: Sequelize.DATE,
        allowNull: true,
    },
    reminderSendingAt: {
        type: Sequelize.DATE,
        allowNull: true,
    },
    complete: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
}, {
    timestamps: true,
});

module.exports = Reminder;