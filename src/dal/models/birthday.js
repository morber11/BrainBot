const Sequelize = require('sequelize');
const database = require('../database/database.js');

const Birthday = database.define('birthday', {
    guildId: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false,
    },
    userId: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false,
    },
    month: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    day: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
}, {
    timestamps: true,
});

module.exports = Birthday;
