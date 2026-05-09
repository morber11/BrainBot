require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const CONSTANTS = require('../../utils/constants.js');
const { BOT_TOKEN } = process.env;
const logger = require('../../utils/logger.js');

module.exports = (client) => {
    client.handleCommands = async (commandFolders) => {

        if (!Array.isArray(commandFolders)) {
            return
        }

        commandFolders.forEach(folder => {
            const commandFilesPath = path.join(__dirname, '..', '..', 'commands', folder);
            const commandFiles = fs
                .readdirSync(commandFilesPath)
                .filter(file => file.endsWith('.js'));

            const { commands, commandArray } = client;

            if (Array.isArray(commandFiles)) {
                commandFiles.forEach(file => {
                    const commandPath = path.join(commandFilesPath, file);
                    
                    let command;
                    try {
                        command = require(commandPath);
                    } catch (err) {
                        logger.error(`Failed to load command ${file} from ${commandFilesPath}:`, err);
                        throw err;
                    }

                    if (!command || !command.data || !command.data.name) {
                        logger.info(`Skipping file without command data: ${file}`);
                        return;
                    }

                    if (command.deprecated) {
                        logger.info(`Skipping deprecated command: ${command.data.name}`);
                        return;
                    }

                    // this order does matter for short circuiting
                    if (process.env.NODE_ENV && command.devOnly && process.env.NODE_ENV !== 'development') {
                        logger.info(`Skipping dev-only command: ${command.data.name} (NODE_ENV=${process.env.NODE_ENV})`);
                        return;
                    }

                    commands.set(command.data.name, command);
                    commandArray.push(command.data.toJSON());
                    logger.info(`Registered command: ${command.data.name}`);
                });
            }
        });

        const rest = new REST({ version: '9' }).setToken(BOT_TOKEN);

        try {
            logger.info("Started refreshing application (/) commands.");

            await rest.put(Routes.applicationCommands(CONSTANTS.CLIENT.CLIENT_ID), {
                body: client.commandArray,
            });

            logger.info("Succesfully refreshed application (/) commands.");
        } catch (err) {
            logger.error(err, { handler: 'command-handler' });
        }
    };
}