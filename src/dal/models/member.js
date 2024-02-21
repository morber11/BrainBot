const Sequelize = require('sequelize');
const database = require('../database/database.js');

const Member = database.define('member', {
    id: {
        type: Sequelize.STRING,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING,
        allowNull: true
    },
    despairCount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: new Date(new Date().toUTCString())
    },
    updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: new Date(new Date().toUTCString())
    },
});

module.exports = Member;