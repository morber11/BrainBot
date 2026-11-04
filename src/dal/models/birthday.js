const Sequelize = require('sequelize');
const database = require('../database/database.js');

// guildId + userId is the primary key, so saving again updates the existing birthday
// users are intentionally allowed to have one birthday per server instead of one globally
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
