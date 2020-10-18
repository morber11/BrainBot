"use strict";

// Imports.
require('dotenv').config();
const Discord = require('discord.js');
const client = new Discord.Client();
const ytdl = require('ytdl-core');
const commands = ('./commands');

// Constants
const BOT_PREFIX = "?b";
const MAX_BRAINS = 300;
const BOT_TOKEN = process.env.BOT_TOKEN


client.once('ready', () => {
    //client.user.setActivity("pondering");
    console.log('Ready!');
});

client.on('message', async message => {
    // scan for any mention of brains or brain emotes...
    if (!message.content.startsWith(BOT_PREFIX)) {
        if (message.author.bot) return;
        await parseForBrains(message); return;
    }

    // post parseForBrains, parse for args
    // parse for args
    const args = message.content.slice(BOT_PREFIX.length + 1).split(' ');
    const ctx = {
        args: args,
        message: message
    };

    await handleCommandFromCtx(ctx);
});

// Now we finally login
client.login(BOT_TOKEN);

// Command functions
async function handleCommandFromCtx(ctx) {
    let command = ctx.args.shift().toLowerCase();

    if (command === 'brain')
        await getBrains(ctx);
    else if (command === 'pondering' || command === "pdr")
        await ponder(ctx);
    else if (command === 'gadget')
        await gogoGadget(ctx);
    else if (command === 'jimcarrey' || command === 'carrey' || command === 'jc')
        await showJimCarrey(ctx);
    else {
        let hasResponded = await handleSimpleResponse(ctx, command)
        if (!hasResponded)
            ctx.message.channel.send('Please enter a valid command');
    }
}

// Main Command Functions
async function parseForBrains(message) {

    // If someone mentions brains, react with brain emote
    if (message.content.toLowerCase().includes("brain"))
        message.react('\uD83E\uDDE0');

    // If the message is the brain emote, react with regional indicators spelling out brain.
    if (message.content.toLowerCase().includes("\uD83E\uDDE0")) {
        message.react('\uD83C\uDDE7');
        message.react('\uD83C\uDDF7');
        message.react('\uD83C\uDDE6');
        message.react('\uD83C\uDDEE');
        message.react('\uD83C\uDDF3');
    }
}

async function getBrains(ctx) {
    let numOfBrains = 0;
    numOfBrains = parseInt(ctx.args[0]);

    if (numOfBrains <= 0 && isNaN(typeof (numBrains)))
        numOfBrains = 0;

    if (numOfBrains > MAX_BRAINS)
        numOfBrains = MAX_BRAINS;

    let msg = "";
    if (numOfBrains > 0)
        for (let i = 0; i < numOfBrains; ++i)
            msg += "Brain ";
    else
        msg += "Brain Brain Brain Brain Brain";

    ctx.message.channel.send(msg);
}

async function ponder(ctx) {
    let message = ctx.message;

    if (message.member.voice.channel) {
        const connection = await message.member.voice.channel.join();
        connection.play(ytdl('https://www.youtube.com/watch?v=AXqMnPyx73E', { filter: 'audioonly' }));
    } else
        message.reply('You need to join a voice channel first!');
}

async function showJimCarrey(ctx) {
    let carreyArray = ["Jim Carrey 99\nhttps://www.nme.com/wp-content/uploads/2019/07/Webp.net-resizeimage-2-2.jpg"
        , "Jim Carrey 37\nhttps://cdn.vox-cdn.com/thumbor/5W2c-p-j6zwXhsAdYLeBlaVhAcs=/0x0:1347x750/1200x800/filters:focal(567x268:781x482)/cdn.vox-cdn.com/uploads/chorus_image/image/66321056/sth_ff_027r2.0.jpg"
        , "Jim Carrey 11\nhttps://images-na.ssl-images-amazon.com/images/I/51itOpamguL._AC_.jpg"
        , "Jim Carrey 18\nhttps://cdn.discordapp.com/attachments/633293499478966282/713084719851503747/GettyImages-691030296.png"
        , "Jim Carrey 49\nhttps://upload.wikimedia.org/wikipedia/en/2/27/TheCableGuy.jpg"
        , "Jim Carrey 12\nhttps://img1.looper.com/img/uploads/2017/10/Carrey-Riddler.jpg"
        , "Jim Carrey 63\nhttps://images.apester.com/user-images%2F6b%2F6b9c3c6d290848d89a3ee155cd3ec1de.jpg/undefined/500/undefined"
        , "Jim Carrey 75\nhttps://cdn.discordapp.com/attachments/633293499478966282/713086129687101490/shutterstock_5875878f.png"
        , "Jim Carrey 40\nhttps://cdn.discordapp.com/attachments/633293499478966282/713086328610357258/thumbnail.png"
        , "Jim Carrey 13\nhttps://www.gannett-cdn.com/presto/2020/07/06/USAT/7df2db60-9143-443f-8611-747c0c965170-jim_carrey.JPG?crop=4255,3192,x544,y0&quality=50&width=640"
        , "Jim Carrey 21\nhttps://media.apnarm.net.au/media/images/2020/06/17/v3imagesbin92c595d02242488368b128570ae59a9c-x2hfjwgjlikfl5mriu2_t1880.jpg"
        , "Jim Carrey 29\nhttps://www.irishcentral.com/uploads/article-v2/2020/9/141408/Jim_Carrey_-_Getty.jpg?t=1600510778"
        , "Jim Carrey 131\nhttps://www.gannett-cdn.com/-mm-/615c23ee79d6417d42c8ea5f206fc801adf8b38d/c=0-196-2784-3908/local/-/media/2016/09/19/USATODAY/USATODAY/636098973898009175-AP-Ireland-Jim-Carrey.jpg"
        , "Jim Carrey 73\nhttps://static.independent.co.uk/s3fs-public/thumbnails/image/2020/07/17/07/jim-carrey-renee-zellweger.jpg"
    ];

    let msg = selectRandomFromArray(carreyArray);
    ctx.message.channel.send(msg);
}

async function gogoGadget(ctx) {
    await getGadget(ctx)
    if (ctx.message.member.voice.channel) {
        const connection = await ctx.message.member.voice.channel.join();
        connection.play(ytdl("https://www.youtube.com/watch?v=e-JHfXVlkik", { filter: 'audioonly' }));
    }
}

async function getGadget(ctx) {
    let gadgets = ["gun", "dilator", "brain", "knife", "pen", "ide", "bricks", "scissorhands", "mask", "plane", "apache", "subaru", "cable guy", "toothpaste cannon", "bowling ball"];
    let msg = "Go go gadget " + selectRandomFromArray(gadgets) + "!";

    ctx.message.channel.send(msg);
}

// Simple response commands
async function handleSimpleResponse(ctx, command) {
    let hasResponded = false;

    if (command === 'dysphoria') {
        ctx.message.channel.send("https://www.javascript.com/");
        hasResponded = true;
    }
    else if (command === 'help') {
        ctx.message.channel.send("You don't need help");
        hasResponded = true;
    }
    else if (command === 'sneed') {
        ctx.message.channel.send("Sneed's feed & seed, formally Chucks\nhttps://sneed.club/");
        hasResponded = true;
    }
    else if (command === 'tonight') {
        ctx.message.channel.send("The same thing we do every night, try to take over the world!");
        hasResponded = true;
    }
    else if (command === 'wise' || command === 'wisdom') {
        ctx.message.channel.send("I am feeling wise!" + "\nhttps://www.jamesonwhiskey.com/en-IE/");
        hasResponded = true;
    }
    else if (command === 'agar' || command === 'wisdom') {
        ctx.message.channel.send("BTC BTFO\nhttps://agarcoin.cash/");
        hasResponded = true;
    }
    else if (command === 'captainalex' || command === 'ca') {
        ctx.message.channel.reply(" killed Captain Alex!");
        hasResponded = true;
    }

    return hasResponded;
}

// Util Functions
function selectRandomFromArray(array) {
    return array[Math.floor(Math.random() * array.length)];
}