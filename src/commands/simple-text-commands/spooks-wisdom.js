const { SlashCommandBuilder } = require('discord.js');
const stringUtility = require('../../utils/string-util.js');
const logger = require('../../utils/logger.js');
const pathUtility = require('../../utils/path-util.js');
const CONSTANTS = require('../../utils/constants.js');
const userStatService = require('../../services/user-stat-service.js');
const statService = require('../../services/system-stat-service.js');

const lastSpooksByGuild = new Map();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('spookswisdom')
        .setDescription('share a spooks wisdom'),
    async execute(interaction) {
        try {

            // it isn't really needed to add to the database
            // since this will always be static content
            const items = [
                { id: 1, phrase: 'There is a ringing in my ear', file: '1.jpg' },
                { id: 2, phrase: 'You may note I am presently not dealing with the otherworldly', file: '2.jpg' },
                { id: 3, phrase: 'My only oath is to this stool, and it is an oath I intend not to break', file: '3.jpg' },
                { id: 4, phrase: 'On the contrary, I\'m doing my best to ignore him', file: '4.jpg' },
                { id: 5, phrase: 'Fill it', file: '5.jpg' },
                { id: 6, phrase: 'The trick is not defeating him with the cup. The trick is not to spill', file: '6.jpg' },
                { id: 7, phrase: 'Why did you not tell me the bells are ringing', file: '7.jpg' },
                { id: 8, phrase: 'Come to me', file: '8.jpg' },
                { id: 9, phrase: 'Shut your eyes', file: '9.jpg' },
                { id: 10, phrase: 'We will work together', file: '10.jpg' },
                { id: 11, phrase: 'Let the silver do its work', file: '11.jpg' },
                { id: 12, phrase: 'Fine work, William!', file: '12.jpg' },
                { id: 13, phrase: 'Let him go! Let him go! I will burn you!', file: '13.jpg' },
                { id: 14, phrase: 'Ten damn years... wasted', file: '14.jpg' },
                { id: 15, phrase: 'I\'m coming for you, Malkin!', file: '15.jpg' },
                { id: 16, phrase: 'The Ward residence?', file: '16.jpg' },
                { id: 17, phrase: 'I understand there\'s a seventh son of a seventh son that lives here', file: '17.jpg' },
                { id: 18, phrase: 'Do not say there is not, for I know that there is. I\'m in a hurry.', file: '18.jpg' },
                { id: 19, phrase: 'Bit hungry as well', file: '19.jpg' },
                { id: 20, phrase: 'My compliments to the cook', file: '20.jpg' },
                { id: 21, phrase: 'So... which one is the seventh?', file: '21.jpg' },
                { id: 22, phrase: 'What is your name, boy?', file: '22.jpg' },
                { id: 23, phrase: 'So, the dealing has begun', file: '23.jpg' },
                { id: 24, phrase: 'Tis a noble profession', file: '24.jpg' },
                { id: 25, phrase: 'He is a bit scrawny for a seventh son', file: '25.jpg' },
                { id: 26, phrase: 'Alas, good lady, that is a vow I cannot make', file: '26.jpg' },
                { id: 27, phrase: 'It is near impossible to battle demons with wet feet. Here. This is to get your boots fixed', file: '27.jpg' },
                { id: 28, phrase: 'Provisions. Liquids... needed to ward off evil spirits', file: '28.jpg' },
                { id: 29, phrase: 'Lest I forget, pick up grease, salt, flour and bacon', file: '29.jpg' },
                { id: 30, phrase: 'Do not dally, Mr. Ward', file: '30.jpg' },
                { id: 31, phrase: 'When you address me, address me as Master Gregory', file: '31.jpg' },
                { id: 32, phrase: 'Wrong question. Wrong questions get wrong answers', file: '32.jpg' },
                { id: 33, phrase: 'It is just a ghast.Level-six creature. These woods are filled with them', file: '33.jpg' },
                { id: 34, phrase: 'Try not to upset it. It should leave you alone', file: '34.jpg' },
                { id: 35, phrase: 'What do you know of what a Spook actually does?', file: '35.jpg' },
                { id: 36, phrase: 'Your answer... it fills me with confidence', file: '36.jpg' },
                { id: 37, phrase: 'We tend the creatures of the dark.Some are less harmful, such as ghasts. The most dangerous,such as witches we trap or kill', file: '37.jpg' },
                { id: 38, phrase: 'My last apprentice wrote this all down', file: '38.jpg' },
                { id: 39, phrase: 'William Bradley was the finest apprentice I\'ve ever had', file: '39.jpg' },
                { id: 40, phrase: 'He died at the hands of Mother Malkin', file: '40.jpg' },
                { id: 41, phrase: 'You live in a world now where legend and nightmare are real', file: '41.jpg' },
                { id: 42, phrase: 'Malkin is alive. We journey to her fortress in Pendle Mountain, where she no doubt hides', file: '42.jpg' },
                { id: 43, phrase: 'Mr. Ward. Mr. Ward. Mr. Ward!', file: '43.jpg' },
                { id: 44, phrase: 'You passed out', file: '44.jpg' },
                { id: 45, phrase: 'You have spells, boy. What kind?', file: '45.jpg' },
                { id: 46, phrase: 'Could be useful. Not the passing out part, of course, but the visions perhaps.', file: '46.jpg' },
                { id: 47, phrase: 'You mean who? This is Tusk. Loyal as he is ugly.', file: '47.jpg' },
                { id: 48, phrase: 'These things that you see in your visions. Can you alter them or are they fixed?', file: '48.jpg' },
                { id: 49, phrase: 'With a little help, most of life\'s curses can be a gift', file: '49.jpg' },
                { id: 50, phrase: 'There are my beauties. Returned as I knew they would. Tender them, Tusk', file: '50.jpg' },
                { id: 51, phrase: 'Home sweet home', file: '51.jpg' },
                { id: 52, phrase: 'We must arm ourselves for the journey to Pendle Mountain. Come, Mr. Ward', file: '52.jpg' },
                { id: 53, phrase: 'That is a very old tapestry', file: '53.jpg' },
                { id: 54, phrase: 'They all died or were turned to darkness', file: '54.jpg' },
                { id: 55, phrase: 'When you deal with dark, dark gets in you', file: '55.jpg' },
                { id: 56, phrase: 'Thank you for reminding me', file: '56.jpg' },
                { id: 57, phrase: 'Ten years... for my last apprentice. But with you, I have less than one week', file: '57.jpg' },
                { id: 58, phrase: 'That is when the blood moon will be full', file: '58.jpg' },
                { id: 59, phrase: 'Happens once a century. The last time, it was followed by years of war', file: '59.jpg' },
                { id: 60, phrase: 'Witches laid waste to cities.The world is still recovering', file: '60.jpg' },
                { id: 61, phrase: 'If we do not stop Mother Malkin... before the next red moon sets...', file: '61.jpg' },
                { id: 62, phrase: 'Enough. No more questions. We leave at dawn. Stay in your chamber', file: '62.jpg' },
                { id: 63, phrase: 'No time. We must get to Pendle Mountain before Malkin assembles her minions', file: '63.jpg' },
                { id: 64, phrase: 'There are witches that need killing. Fucking witches', file: '64.jpg' }, // i still struggle to believe this is a real line in the movie
            ];

            const guildKey = interaction.guildId || 'dm';
            const lastForGuild = lastSpooksByGuild.get(guildKey) || [];

            let choices = items.filter(item => !lastForGuild.includes(item.id));
            if (choices.length === 0) {
                choices = items.slice();
                lastSpooksByGuild.set(guildKey, []);
            }

            const selected = stringUtility.selectRandomFromArray(choices);
            const imgPath = pathUtility.getMediaFilePath(__dirname, 'images', `spookswisdom/${selected.file}`);

            const updated = lastSpooksByGuild.get(guildKey) || [];
            updated.push(selected.id);
            while (updated.length > 10) {
                updated.shift();
            }

            lastSpooksByGuild.set(guildKey, updated);

            // defer here to avoid race condition
            await interaction.deferReply();

            try {
                await interaction.editReply({ content: `*${selected.phrase}*`, files: [imgPath] });
            } catch (err) {
                logger.warn(err, { handler: 'spooks-wisdom', stage: 'attach-image' });
                await interaction.editReply(`*${selected.phrase}*`);
            }

            const userId = interaction.user && interaction.user.id;
            await userStatService.incrementUserStat(userId, CONSTANTS.STATS.SPOOKS_WISDOM, CONSTANTS.STATS.SPOOKS_WISDOM_FRIENDLY);
            await statService.incrementSystemStat(CONSTANTS.STATS.SPOOKS_WISDOM, CONSTANTS.STATS.SPOOKS_WISDOM_FRIENDLY);
        } catch (error) {
            logger.error(error);
            await interaction.editReply('An error occurred.');
        }
    }
};
