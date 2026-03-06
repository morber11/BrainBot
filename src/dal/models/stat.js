const Sequelize = require('sequelize');
const database = require('../database/database.js');

const Stat = database.define('stat', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    stat: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
    },
    count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
});

module.exports = Stat;
