require('dotenv').config();
const { BOT_TOKEN } = process.env;
const { Client, Events, Collection, GatewayIntentBits, ActivityType } = require('discord.js');
const fs = require('node:fs');
const database = require('./dal/database/database.js');
const retryOperation = require('./utils/retry.js');

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


const commandFolders = fs.readdirSync('./src/commands');
//const commandFilesPath = path.join(__dirname, '..', '..', 'commands', commandFolders);

(async function init() {
    try {
        console.log('Checking database connection...');
        await retryOperation(() => database.authenticate(), 5, 1000);
        console.log('Database connection established.');

        // load functions after DB is ready
        const functionFolders = fs.readdirSync(`./src/functions`);
        for (const folder of functionFolders) {
            const funcFiles = fs
                .readdirSync(`./src/functions/${folder}`)
                .filter(file => file.endsWith('.js'));

            for (const file of funcFiles)
                require(`./functions/${folder}/${file}`)(client);
        }

        client.handleEvents();
        client.handleCommands(commandFolders);
        client.handleCrons();

        if (!BOT_TOKEN) {
            console.error('BOT_TOKEN is not set. Please set it in your .env file or environment variables.');
            process.exit(1);
        }

        await client.login(BOT_TOKEN);
        console.log('Bot logged in successfully.');
    } catch (err) {
        console.error('Startup failed:', err);
        process.exit(1);
    }
})();
