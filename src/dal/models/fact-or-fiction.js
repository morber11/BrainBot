const Sequelize = require('sequelize');
const database = require('../database/database.js');

const FactOrFiction = database.define('fact-or-fiction', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    entryHash: {
        type: Sequelize.STRING,
        allowNull: false
    },
    value: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: new Date(new Date().toUTCString())
    },
});

module.exports = FactOrFiction;