const Sequelize = require('sequelize');
const database = require('../database/database.js');

const Poll = database.define('poll', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    guildId: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    channelId: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    messageId: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
    },
    creatorId: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    question: {
        type: Sequelize.TEXT,
        allowNull: false,
    },
    options: {
        type: Sequelize.JSON,
        allowNull: false,
    },
    endsAt: {
        type: Sequelize.DATE,
        allowNull: false,
    },
    notify: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
    singleChoice: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    ended: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
}, {
    timestamps: true,
});

module.exports = Poll;
