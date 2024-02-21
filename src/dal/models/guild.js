const Sequelize = require('sequelize');
const database = require('../database/database.js');

const Guild = database.define('guild', {
    id: {
        type: Sequelize.STRING,
        primaryKey: true
    }
});

module.exports = Guild;