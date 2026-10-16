const Sequelize = require('sequelize');
const database = require('../database/database.js');

const Guild = database.define('guild', {
    id: {
        type: Sequelize.STRING,
        primaryKey: true
    },
    pollEmojis: {
        type: Sequelize.JSON,
        allowNull: true
    }
});

module.exports = Guild;