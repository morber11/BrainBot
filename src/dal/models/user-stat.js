const Sequelize = require('sequelize');
const database = require('../database/database.js');

const UserStat = database.define('user_stat', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    userId: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    stat: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    user_friendly_name: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: ''
    },
    count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
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
}, {
    tableName: 'user_stat',
    timestamps: false,
});

module.exports = UserStat;
