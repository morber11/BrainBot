const Sequelize = require('sequelize');
const database = require('../database/database.js');

const Keyword = database.define('keyword', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    type: {
        type: Sequelize.STRING,
        allowNull: false
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    value: {
        type: Sequelize.INTEGER,
        allowNull: true,
    },
});

module.exports = Keyword;