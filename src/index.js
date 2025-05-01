require('dotenv').config();
const { BOT_TOKEN } = process.env;
const { Client, Events, Collection, GatewayIntentBits, ActivityType } = require('discord.js');
const fs = require('node:fs');

const client = new Client({
    presence: {
        status: 'online',
        afk: false,
        activities: [{
            name: "Pinky and the Brain",
            type: ActivityType.Watching
        }],
    },
    intents: [GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates]
});

client.commands = new Collection();
client.commandArray = [];

const functionFolders = fs.readdirSync(`./src/functions`);
for (const folder of functionFolders) {
    const funcFiles = fs
        .readdirSync(`./src/functions/${folder}`)
        .filter(file => file.endsWith('.js'));

    for (const file of funcFiles)
        require(`./functions/${folder}/${file}`)(client);
}

const commandFolders = fs.readdirSync('./src/commands');
//const commandFilesPath = path.join(__dirname, '..', '..', 'commands', commandFolders);

client.handleEvents();
client.handleCommands(commandFolders);
client.handleCrons();
client.login(BOT_TOKEN);
