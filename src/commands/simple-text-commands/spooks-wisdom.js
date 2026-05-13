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
        .setDescription('My last apprentice wrote this all down'),
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
                { id: 65, phrase: 'You were told to stay in your chamber!', file: '65.jpg' },
                { id: 66, phrase: 'That was your first test, Mr. Ward. And not surprisingly, you failed!', file: '66.jpg' },
                { id: 67, phrase: 'Test number two, the Rowan staff. Carved by the very first Falcon Knight', file: '67.jpg' },
                { id: 68, phrase: 'The finest fighting staff there is. Master it, and you can master any weapon', file: '68.jpg' },
                { id: 69, phrase: 'Show me what you are!', file: '69.jpg' },
                { id: 70, phrase: 'I paid good money for you. I think your father deceived me of your worth', file: '70.jpg' },
                { id: 71, phrase: 'Are you not the seventh son of a seventh son?', file: '71.jpg' },
                { id: 72, phrase: 'You ought to be seven times as strong as a normal man', file: '72.jpg' },
                { id: 73, phrase: 'Your mam, she did not put up much of a fight to keep you, did she?', file: '73.jpg' },
                { id: 74, phrase: 'You are worthless. There is not enough time. You\'ll be dead in a week', file: '74.jpg' },
                { id: 75, phrase: 'Good aim!', file: '75.jpg' },
                { id: 76, phrase: 'Missed', file: '76.jpg' },
                { id: 77, phrase: 'With the blood moon\'s rise and Malkin\'s arrival, the creatures of the dark will be more frequent... and more powerful', file: '77.jpg' },
                { id: 78, phrase: 'These are her lieutenants', file: '78.jpg' },
                { id: 79, phrase: 'This is Radu. He has an army of assassins', file: '79.jpg' },
                { id: 80, phrase: 'Throw the knife', file: '80.jpg' },
                { id: 81, phrase: 'Go!', file: '81.jpg' },
                { id: 82, phrase: 'Salt and iron... they are crucial', file: '82.jpg' },
                { id: 83, phrase: 'Salt burns. Iron bleeds away the strength of any creature of the dark', file: '83.jpg' },
                { id: 84, phrase: 'Tincture of copper, for flesh wounds', file: '84.jpg' },
                { id: 85, phrase: 'Silverbane... repels witches', file: '85.jpg' },
                { id: 86, phrase: 'Ogre scrotum... for your own enjoyment. Follow', file: '86.jpg' },
                { id: 87, phrase: 'Stone Chuckers... they\'re not to be confused with Cattle Rippers', file: '87.jpg' },
                { id: 88, phrase: 'Stone Chuckers chuck stones. Cattle Rippers rip cattle. The names are fairly self-evident', file: '88.jpg' },
                { id: 89, phrase: 'Verbanum... guards against spells', file: '89.jpg' },
                { id: 90, phrase: 'Cowardice', file: '90.jpg' },
                { id: 91, phrase: 'Sarikin takes the form of a leopard', file: '91.jpg' },
                { id: 92, phrase: 'Virahadra is the king of swords', file: '92.jpg' },
                { id: 93, phrase: 'Your consistency is admirable, Mr. Ward', file: '93.jpg' },
                { id: 94, phrase: 'Of all of them, Malkin is the strongest. She is the queen', file: '94.jpg' },
                { id: 95, phrase: 'You leave Malkin to me', file: '95.jpg' },
                { id: 96, phrase: 'Continue your studies', file: '96.jpg' },
                { id: 97, phrase: 'Have you been writing down what you have learned in your journal as I\'ve instructed?', file: '97.jpg' },
                { id: 98, phrase: 'Do you now? Do you remember the difference between a ghost and a ghast?', file: '98.jpg' },
                { id: 99, phrase: 'Correct. ', file: '99.jpg' },
                { id: 100, phrase: 'Oh. Pardon. Aim, Tusk, for God\'s sake', file: '100.jpg' },
                { id: 101, phrase: 'The bell. I\'m being summoned', file: '101.jpg' },
                { id: 102, phrase: 'Tusk. Best make yourself scarce', file: '102.jpg' },
                { id: 103, phrase: 'That depends on who is inquiring', file: '103.jpg' },
                { id: 104, phrase: 'This will cost us two days\' journey. If it is anything less than a Boggart, we are on our way', file: '104.jpg' },
                { id: 105, phrase: 'You do not want to know', file: '105.jpg' },
                { id: 106, phrase: 'Flattery is fine. Gold is finer', file: '106.jpg' },
                { id: 107, phrase: 'Feels a bit light', file: '107.jpg' },
                { id: 108, phrase: 'Ah. Of course. Malkin\'s most bloodthirsty lieutenant', file: '108.jpg' },
                { id: 109, phrase: 'He has killed more of my kind than all of the rest put together. His name is Urag', file: '109.jpg' },
                { id: 110, phrase: 'Leave us', file: '110.jpg' },
                { id: 111, phrase: 'I fight him alone. Ancient code of honor', file: '111.jpg' },
                { id: 112, phrase: 'More importantly, I prefer not to split the reward', file: '112.jpg' },
                { id: 113, phrase: 'The cage! Grab on to the cage!', file: '113.jpg' },
                { id: 114, phrase: 'Jump!', file: '114.jpg' },
                { id: 115, phrase: 'Silverbane!', file: '115.jpg' },
                { id: 116, phrase: 'We are not finished. Oil!', file: '116.jpg' },
                { id: 117, phrase: 'We must kill him for good', file: '117.jpg' },
                { id: 118, phrase: 'Do it. Unless you prefer to eat his heart', file: '118.jpg' },
                { id: 119, phrase: 'Not yet. But you will be!', file: '119.jpg' },
                { id: 120, phrase: 'I am training you to kill witches! If you cannot do that, you are useless to me!', file: '120.jpg' },
                { id: 121, phrase: 'Yes, that\'s right. Go sulk, boy.', file: '121.jpg' },
                { id: 122, phrase: 'I too, was once young', file: '122.jpg' },
                { id: 123, phrase: 'Did not listen. Was arrogant like you', file: '123.jpg' },
                { id: 124, phrase: 'I once loved a witch. Yes. Malkin', file: '124.jpg' },
                { id: 125, phrase: 'She was not always evil. Fear and hatred created her', file: '125.jpg' },
                { id: 126, phrase: 'She grew into what she was perceived to be... deadly', file: '126.jpg' },
                { id: 127, phrase: 'When she... discovered I had married, she could not endure my happiness', file: '127.jpg' },
                { id: 128, phrase: 'She murdered my wife in cold blood', file: '128.jpg' },
                { id: 129, phrase: 'I captured her. I was clever. Lied to her... told her I still loved her', file: '129.jpg' },
                { id: 130, phrase: 'I had my chance to kill her, but I showed her mercy instead', file: '130.jpg' },
                { id: 131, phrase: 'Tricked her. Locked her away in a cage buried in the ground. I thought that prison would hold her for eternity', file: '131.jpg' },
                { id: 132, phrase: 'But I was wrong. Now everyone she kills in her wake is my burden.', file: '132.jpg' },
                { id: 133, phrase: 'I want you to meet my wife, Mr. Ward', file: '133.jpg' },
                { id: 134, phrase: 'This is Rebecca', file: '134.jpg' },
                { id: 135, phrase: 'This... is why I\'ve been so hard on you, Tom', file: '135.jpg' },
                { id: 136, phrase: 'Do not make the same mistake. If you see a witch, kill it', file: '136.jpg' },
                { id: 137, phrase: 'Beyond the forest... Pendle Mountain. We have three days', file: '137.jpg' },
                { id: 138, phrase: 'Tusk! Dependable as death you are', file: '138.jpg' },
                { id: 139, phrase: 'A Boggart. Subterraneal beast. Nasty temperament. Blind as a bat', file: '139.jpg' },
                { id: 140, phrase: 'You don\'t. You run!', file: '140.jpg' },
                { id: 141, phrase: 'Their sense of smell... extraordinary. Jump!', file: '141.jpg' },
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
