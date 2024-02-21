const Sequelize = require('sequelize');
const database = require('../database/database.js');

const CustomUrl = database.define('url', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    url: {
        type: Sequelize.STRING,
        allowNull: false
    },
    type: {
        type: Sequelize.STRING,
        allowNull: false
    },
    value: {
        type: Sequelize.STRING,
        allowNull: true
    },
});

module.exports = CustomUrl;