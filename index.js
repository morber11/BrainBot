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
    if (!message.content.startsWith(prefix)) {
        if (message.author.bot) return;

        if (message.content.toLowerCase().includes("brain"))
            message.react('\uD83E\uDDE0');

        if (message.content.toLowerCase().includes("\uD83E\uDDE0")) {
            message.react('\uD83C\uDDE7');
            message.react('\uD83C\uDDF7');
            message.react('\uD83C\uDDE6');
            message.react('\uD83C\uDDEE');
            message.react('\uD83C\uDDF3');
        }

    }

    const args = message.content.slice(prefix.length + 1).split(' ');
    const command = args.shift().toLowerCase();

    if (command === 'brain') {
        let _parsedParams = 0;
        _parsedParams = parseInt(args[0]);

        if (_parsedParams <= 0 && isNaN(typeof (_parsedParams)))
            _parsedParams = 0;

        if (_parsedParams > MAX_BRAINS)
            _parsedParams = MAX_BRAINS;

        let _sendMsg = "";

        if (_parsedParams > 0)
            for (let i = 0; i < _parsedParams; ++i)
                _sendMsg += "Brain ";
        else
            _sendMsg += "Brain Brain Brain Brain Brain";

        message.channel.send(_sendMsg);
    }

    if (command === 'pondering') {
        if (message.member.voice.channel) {
            const connection = await message.member.voice.channel.join();

            connection.play(ytdl('https://www.youtube.com/watch?v=AXqMnPyx73E', {filter: 'audioonly'}));
        } else {
            message.reply('You need to join a voice channel first!');
        }
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
        let _x = getRandomInt(8);
        let _message = "";

        console.log("Random num selected: " + _x);

        if (_x == 0)
            _message += "Jim Carrey 99\nhttps://www.nme.com/wp-content/uploads/2019/07/Webp.net-resizeimage-2-2.jpg";
        else if (_x == 1)
            _message += "Jim Carrey 37\nhttps://cdn.vox-cdn.com/thumbor/5W2c-p-j6zwXhsAdYLeBlaVhAcs=/0x0:1347x750/1200x800/filters:focal(567x268:781x482)/cdn.vox-cdn.com/uploads/chorus_image/image/66321056/sth_ff_027r2.0.jpg";
        else if (_x == 2)
            _message += "Jim Carrey 11\nhttps://images-na.ssl-images-amazon.com/images/I/51itOpamguL._AC_.jpg";
        else if (_x == 3)
            _message += "Jim Carrey 18\nhttps://cdn.discordapp.com/attachments/633293499478966282/713084719851503747/GettyImages-691030296.png";
        else if (_x == 4)
            _message += "Jim Carrey 49\nhttps://upload.wikimedia.org/wikipedia/en/2/27/TheCableGuy.jpg";
        else if (_x == 5)
            _message += "Jim Carrey 12\nhttps://img1.looper.com/img/uploads/2017/10/Carrey-Riddler.jpg";
        else if (_x == 6)
            _message += "Jim Carrey 63\nhttps://images.apester.com/user-images%2F6b%2F6b9c3c6d290848d89a3ee155cd3ec1de.jpg/undefined/500/undefined";
        else if (_x == 7)
            _message += "Jim Carrey 75\nhttps://cdn.discordapp.com/attachments/633293499478966282/713086129687101490/shutterstock_5875878f.png";
        else if (_x == 8)
            _message += "Jim Carrey 40\nhttps://cdn.discordapp.com/attachments/633293499478966282/713086328610357258/thumbnail.png";

        message.channel.send(_message);
    }
});

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

client.login(process.env.TOKEN);

