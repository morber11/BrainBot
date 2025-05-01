const fs = require('fs');
const path = require('path');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const CONSTANTS = require('../../utils/constants.js');
const { BOT_TOKEN } = process.env;

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
                    const command = require(path.join(commandFilesPath, file));

                    commands.set(command.data.name, command);
                    commandArray.push(command.data.toJSON());
                });
            }
        });

        const rest = new REST({ version: '9' }).setToken(BOT_TOKEN);

        try {
            console.log("Started refreshing application (/) commands.");

            await rest.put(Routes.applicationCommands(CONSTANTS.CLIENT.CLIENT_ID), {
                body: client.commandArray,
            });

            console.log("Succesfully refreshed application (/) commands.");
        } catch (err) {
            console.error(err);
        }
    };
}