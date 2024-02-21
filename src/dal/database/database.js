const Sequelize = require('sequelize');
const config = require('../../config.json');

const { path: dbPath, username: dbUser, password: dbPassword } = config.database;

const sequelize = new Sequelize('database', dbUser, dbPassword, {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
	storage: dbPath,
});

module.exports = sequelize;