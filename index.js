// imports
require('dotenv').config();
const Discord = require('discord.js');
const client = new Discord.Client();
const ytdl = require('ytdl-core');

// constants
const prefix = "?b";
const MAX_BRAINS = 300;

client.once('ready', () => {
    console.log('Ready!');
});

client.on('message', async message => {
    // scan for any mention of brains or brain emotes...
    if (!message.content.startsWith(prefix)) {
        if (message.author.bot) return;
        brainScan(message);
    }

    // post brainscan, parse for args
    const args = message.content.slice(prefix.length + 1).split(' ');
    const command = args.shift().toLowerCase();

    if (command === 'brain') {
        let _parsedParams = 0;
        _parsedParams = parseInt(args[0]);

        let _sendMsg = await getBrains(_parsedParams);

        message.channel.send(_sendMsg);
    }

    if (command === 'pondering') {
        if (message.member.voice.channel) {
            const connection = await message.member.voice.channel.join();
            connection.play(ytdl('https://www.youtube.com/watch?v=AXqMnPyx73E', { filter: 'audioonly' }));
        } else
            message.reply('You need to join a voice channel first!');
    }

    if (command === 'tonight')
        message.channel.send("The same thing we do every night, try to take over the world!");

    if (command === 'dysphoria')
        message.channel.send("https://www.javascript.com/");

    if (command === 'wise')
        message.channel.send("I am feeling wise!" + "\nhttps://www.jamesonwhiskey.com/en-IE/");

    if (command === 'sneed')
        message.channel.send("Sneed's feed & seed, formally Chucks\nhttps://sneed.club/");

    if (command === 'agar')
        message.channel.send("BTC BTFO\nhttps://agarcoin.cash/");

    if (command === 'jimcarrey') {
        let _message = "";
        _message += await getJimCarrey();
        message.channel.send(_message);
    }
});

client.login(process.env.TOKEN);

// util functions
function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

// the real big brain functions
async function brainScan(message) {
    // if someone mentions brains, react with brain emote
    if (message.content.toLowerCase().includes("brain"))
        message.react('\uD83E\uDDE0');

    // if the message is the brain emote, react with regional indicators spelling out brain.
    if (message.content.toLowerCase().includes("\uD83E\uDDE0")) {
        message.react('\uD83C\uDDE7');
        message.react('\uD83C\uDDF7');
        message.react('\uD83C\uDDE6');
        message.react('\uD83C\uDDEE');
        message.react('\uD83C\uDDF3');
    }
}

async function getBrains(numBrains) {
    if (numBrains <= 0 && isNaN(typeof (numBrains)))
        numBrains = 0;

    if (numBrains > MAX_BRAINS)
        numBrains = MAX_BRAINS;

    let msg = "";
    if (numBrains > 0)
        for (let i = 0; i < numBrains; ++i)
            msg += "Brain ";
    else
        msg += "Brain Brain Brain Brain Brain";
    return msg;
}

// TODO: make the carry images into an array and just parse for args there, should keep it cleaner.
async function getJimCarrey() {
    let num = getRandomInt(8);
    let message = "";
    switch (num) {
        case 0:
            message += "Jim Carrey 99\nhttps://www.nme.com/wp-content/uploads/2019/07/Webp.net-resizeimage-2-2.jpg";
            break;
        case 1:
            message += "Jim Carrey 37\nhttps://cdn.vox-cdn.com/thumbor/5W2c-p-j6zwXhsAdYLeBlaVhAcs=/0x0:1347x750/1200x800/filters:focal(567x268:781x482)/cdn.vox-cdn.com/uploads/chorus_image/image/66321056/sth_ff_027r2.0.jpg";
            break;
        case 2:
            message += "Jim Carrey 11\nhttps://images-na.ssl-images-amazon.com/images/I/51itOpamguL._AC_.jpg";
            break;
        case 3:
            message += "Jim Carrey 18\nhttps://cdn.discordapp.com/attachments/633293499478966282/713084719851503747/GettyImages-691030296.png";
            break;
        case 4:
            message += "Jim Carrey 49\nhttps://upload.wikimedia.org/wikipedia/en/2/27/TheCableGuy.jpg";
            break;
        case 5:
            message += "Jim Carrey 12\nhttps://img1.looper.com/img/uploads/2017/10/Carrey-Riddler.jpg";
            break;
        case 6:
            message += "Jim Carrey 63\nhttps://images.apester.com/user-images%2F6b%2F6b9c3c6d290848d89a3ee155cd3ec1de.jpg/undefined/500/undefined";
            break;
        case 7:
            message += "Jim Carrey 75\nhttps://cdn.discordapp.com/attachments/633293499478966282/713086129687101490/shutterstock_5875878f.png";
            break;
        case 8:
            message += "Jim Carrey 40\nhttps://cdn.discordapp.com/attachments/633293499478966282/713086328610357258/thumbnail.png";
            break;
        default:
            message += "Jim Carrey -1";
    }
    return message
}

