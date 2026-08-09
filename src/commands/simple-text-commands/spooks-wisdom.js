const { SlashCommandBuilder } = require('discord.js');
const stringUtility = require('../../utils/string-util.js');
const logger = require('../../utils/logger.js');
const pathUtility = require('../../utils/path-util.js');
const CONSTANTS = require('../../utils/constants.js');
const userStatCommandService = require('../../services/user-stat-command-service.js');
const statService = require('../../services/system-stat-command-service.js');

const lastSpooksByGuild = new Map();

// spoilers for a terrible adaption of a great book - Seventh Son (2014)
module.exports = {
    data: new SlashCommandBuilder()
        .setName('spookswisdom')
        .setDescription('My last apprentice wrote this all down'),
    async execute(interaction) {
        try {

            // it isn't really needed to add to the database
            // since this will always be static content
            // most of these were generated with an ffmpeg wrapper - subscreen
            // https://github.com/morber11/subscreen
            // when not appropriate, manual screenshots were taken
            const items = [
                { id: 1, phrase: 'There is a ringing in my ear', file: 'spookswisdom-1.jpg' },
                { id: 2, phrase: 'You may note I am presently not dealing with the otherworldly', file: 'spookswisdom-2.jpg' },
                { id: 3, phrase: 'My only oath is to this stool, and it is an oath I intend not to break', file: 'spookswisdom-3.jpg' },
                { id: 4, phrase: 'On the contrary, I\'m doing my best to ignore him', file: 'spookswisdom-4.jpg' },
                { id: 5, phrase: 'Fill it', file: 'spookswisdom-5.jpg' },
                { id: 6, phrase: 'The trick is not defeating him with the cup. The trick is not to spill', file: 'spookswisdom-6.jpg' },
                { id: 7, phrase: 'Why did you not tell me the bells are ringing', file: 'spookswisdom-7.jpg' },
                { id: 8, phrase: 'Come to me', file: 'spookswisdom-8.jpg' },
                { id: 9, phrase: 'Shut your eyes. Do not be in awe of her. It will only empower her', file: 'spookswisdom-9.jpg' },
                { id: 10, phrase: 'We will work together', file: 'spookswisdom-10.jpg' },
                { id: 11, phrase: 'Let the silver do its work', file: 'spookswisdom-11.jpg' },
                { id: 12, phrase: 'Fine work, William!', file: 'spookswisdom-12.jpg' },
                { id: 13, phrase: 'Let him go! Let him go! I will burn you!', file: 'spookswisdom-13.jpg' },
                { id: 14, phrase: 'Ten damn years... wasted', file: 'spookswisdom-14.jpg' },
                { id: 15, phrase: 'I\'m coming for you, Malkin!', file: 'spookswisdom-15.jpg' },
                { id: 16, phrase: 'The Ward residence?', file: 'spookswisdom-16.jpg' },
                { id: 17, phrase: 'I understand there\'s a seventh son of a seventh son that lives here', file: 'spookswisdom-17.jpg' },
                { id: 18, phrase: 'Do not say there is not, for I know that there is. I\'m in a hurry.', file: 'spookswisdom-18.jpg' },
                { id: 19, phrase: 'Bit hungry as well', file: 'spookswisdom-19.jpg' },
                { id: 20, phrase: 'My compliments to the cook', file: 'spookswisdom-20.jpg' },
                { id: 21, phrase: 'So... which one is the seventh?', file: 'spookswisdom-21.jpg' },
                { id: 22, phrase: 'What is your name, boy?', file: 'spookswisdom-22.jpg' },
                { id: 23, phrase: 'So, the dealing has begun', file: 'spookswisdom-23.jpg' },
                { id: 24, phrase: 'Tis a noble profession', file: 'spookswisdom-24.jpg' },
                { id: 25, phrase: 'He is a bit scrawny for a seventh son', file: 'spookswisdom-25.jpg' },
                { id: 26, phrase: 'Alas, good lady, that is a vow I cannot make', file: 'spookswisdom-26.jpg' },
                { id: 27, phrase: 'It is near impossible to battle demons with wet feet. Here. This is to get your boots fixed', file: 'spookswisdom-27.jpg' },
                { id: 28, phrase: 'Provisions. Liquids... needed to ward off evil spirits', file: 'spookswisdom-28.jpg' },
                { id: 29, phrase: 'Lest I forget, pick up grease, salt, flour and bacon', file: 'spookswisdom-29.jpg' },
                { id: 30, phrase: 'Do not dally, Mr. Ward', file: 'spookswisdom-30.jpg' },
                { id: 31, phrase: 'When you address me, address me as Master Gregory', file: 'spookswisdom-31.jpg' },
                { id: 32, phrase: 'Wrong question. Wrong questions get wrong answers', file: 'spookswisdom-32.jpg' },
                { id: 33, phrase: 'It is just a ghast.Level-six creature. These woods are filled with them', file: 'spookswisdom-33.jpg' },
                { id: 34, phrase: 'Try not to upset it. It should leave you alone', file: 'spookswisdom-34.jpg' },
                { id: 35, phrase: 'What do you know of what a Spook actually does?', file: 'spookswisdom-35.jpg' },
                { id: 36, phrase: 'Your answer... it fills me with confidence', file: 'spookswisdom-36.jpg' },
                { id: 37, phrase: 'We tend the creatures of the dark.Some are less harmful, such as ghasts. The most dangerous,such as witches we trap or kill', file: 'spookswisdom-37.jpg' },
                { id: 38, phrase: 'My last apprentice wrote this all down', file: 'spookswisdom-38.jpg' },
                { id: 39, phrase: 'William Bradley was the finest apprentice I\'ve ever had', file: 'spookswisdom-39.jpg' },
                { id: 40, phrase: 'He died at the hands of Mother Malkin', file: 'spookswisdom-40.jpg' },
                { id: 41, phrase: 'You live in a world now where legend and nightmare are real', file: 'spookswisdom-41.jpg' },
                { id: 42, phrase: 'Malkin is alive. We journey to her fortress in Pendle Mountain, where she no doubt hides', file: 'spookswisdom-42.jpg' },
                { id: 43, phrase: 'Mr. Ward. Mr. Ward. Mr. Ward!', file: 'spookswisdom-43.jpg' },
                { id: 44, phrase: 'You passed out', file: 'spookswisdom-44.jpg' },
                { id: 45, phrase: 'You have spells, boy. What kind?', file: 'spookswisdom-45.jpg' },
                { id: 46, phrase: 'Could be useful. Not the passing out part, of course, but the visions perhaps.', file: 'spookswisdom-46.jpg' },
                { id: 47, phrase: 'You mean who? This is Tusk. Loyal as he is ugly.', file: 'spookswisdom-47.jpg' },
                { id: 48, phrase: 'These things that you see in your visions. Can you alter them or are they fixed?', file: 'spookswisdom-48.jpg' },
                { id: 49, phrase: 'With a little help, most of life\'s curses can be a gift', file: 'spookswisdom-49.jpg' },
                { id: 50, phrase: 'There are my beauties. Returned as I knew they would. Tender them, Tusk', file: 'spookswisdom-50.jpg' },
                { id: 51, phrase: 'Home sweet home', file: 'spookswisdom-51.jpg' },
                { id: 52, phrase: 'We must arm ourselves for the journey to Pendle Mountain. Come, Mr. Ward', file: 'spookswisdom-52.jpg' },
                { id: 53, phrase: 'That is a very old tapestry', file: 'spookswisdom-53.jpg' },
                { id: 54, phrase: 'They all died or were turned to darkness', file: 'spookswisdom-54.jpg' },
                { id: 55, phrase: 'When you deal with dark, dark gets in you', file: 'spookswisdom-55.jpg' },
                { id: 56, phrase: 'Thank you for reminding me', file: 'spookswisdom-56.jpg' },
                { id: 57, phrase: 'Ten years... for my last apprentice. But with you, I have less than one week', file: 'spookswisdom-57.jpg' },
                { id: 58, phrase: 'That is when the blood moon will be full', file: 'spookswisdom-58.jpg' },
                { id: 59, phrase: 'Happens once a century. The last time, it was followed by years of war', file: 'spookswisdom-59.jpg' },
                { id: 60, phrase: 'Witches laid waste to cities.The world is still recovering', file: 'spookswisdom-60.jpg' },
                { id: 61, phrase: 'If we do not stop Mother Malkin... before the next red moon sets...', file: 'spookswisdom-61.jpg' },
                { id: 62, phrase: 'Enough. No more questions. We leave at dawn. Stay in your chamber', file: 'spookswisdom-62.jpg' },
                { id: 63, phrase: 'No time. We must get to Pendle Mountain before Malkin assembles her minions', file: 'spookswisdom-63.jpg' },
                { id: 64, phrase: 'There are witches that need killing. Fucking witches', file: 'spookswisdom-64.jpg' }, // i still struggle to believe this is a real line in the movie
                { id: 65, phrase: 'You were told to stay in your chamber!', file: 'spookswisdom-65.jpg' },
                { id: 66, phrase: 'That was your first test, Mr. Ward. And not surprisingly, you failed!', file: 'spookswisdom-66.jpg' },
                { id: 67, phrase: 'Test number two, the Rowan staff. Carved by the very first Falcon Knight', file: 'spookswisdom-67.jpg' },
                { id: 68, phrase: 'The finest fighting staff there is. Master it, and you can master any weapon', file: 'spookswisdom-68.jpg' },
                { id: 69, phrase: 'Show me what you are!', file: 'spookswisdom-69.jpg' },
                { id: 70, phrase: 'I paid good money for you. I think your father deceived me of your worth', file: 'spookswisdom-70.jpg' },
                { id: 71, phrase: 'Are you not the seventh son of a seventh son?', file: 'spookswisdom-71.jpg' },
                { id: 72, phrase: 'You ought to be seven times as strong as a normal man', file: 'spookswisdom-72.jpg' },
                { id: 73, phrase: 'Your mam, she did not put up much of a fight to keep you, did she?', file: 'spookswisdom-73.jpg' },
                { id: 74, phrase: 'You are worthless. There is not enough time. You\'ll be dead in a week', file: 'spookswisdom-74.jpg' },
                { id: 75, phrase: 'Good aim!', file: 'spookswisdom-75.jpg' },
                { id: 76, phrase: 'Missed', file: 'spookswisdom-76.jpg' },
                { id: 77, phrase: 'With the blood moon\'s rise and Malkin\'s arrival, the creatures of the dark will be more frequent... and more powerful', file: 'spookswisdom-77.jpg' },
                { id: 78, phrase: 'These are her lieutenants', file: 'spookswisdom-78.jpg' },
                { id: 79, phrase: 'This is Radu. He has an army of assassins', file: 'spookswisdom-79.jpg' },
                { id: 80, phrase: 'Throw the knife', file: 'spookswisdom-80.jpg' },
                { id: 81, phrase: 'Go!', file: 'spookswisdom-81.jpg' },
                { id: 82, phrase: 'Salt and iron... they are crucial', file: 'spookswisdom-82.jpg' },
                { id: 83, phrase: 'Salt burns. Iron bleeds away the strength of any creature of the dark', file: 'spookswisdom-83.jpg' },
                { id: 84, phrase: 'Tincture of copper, for flesh wounds', file: 'spookswisdom-84.jpg' },
                { id: 85, phrase: 'Silverbane... repels witches', file: 'spookswisdom-85.jpg' },
                { id: 86, phrase: 'Ogre scrotum... for your own enjoyment. Follow', file: 'spookswisdom-86.jpg' },
                { id: 87, phrase: 'Stone Chuckers... they\'re not to be confused with Cattle Rippers', file: 'spookswisdom-87.jpg' },
                { id: 88, phrase: 'Stone Chuckers chuck stones. Cattle Rippers rip cattle. The names are fairly self-evident', file: 'spookswisdom-88.jpg' },
                { id: 89, phrase: 'Verbanum... guards against spells', file: 'spookswisdom-89.jpg' },
                { id: 90, phrase: 'Cowardice', file: 'spookswisdom-90.jpg' },
                { id: 91, phrase: 'Sarikin takes the form of a leopard', file: 'spookswisdom-91.jpg' },
                { id: 92, phrase: 'Virahadra is the king of swords', file: 'spookswisdom-92.jpg' },
                { id: 93, phrase: 'Your consistency is admirable, Mr. Ward', file: 'spookswisdom-93.jpg' },
                { id: 94, phrase: 'Of all of them, Malkin is the strongest. She is the queen', file: 'spookswisdom-94.jpg' },
                { id: 95, phrase: 'You leave Malkin to me', file: 'spookswisdom-95.jpg' },
                { id: 96, phrase: 'Continue your studies', file: 'spookswisdom-96.jpg' },
                { id: 97, phrase: 'Have you been writing down what you have learned in your journal as I\'ve instructed?', file: 'spookswisdom-97.jpg' },
                { id: 98, phrase: 'Do you now? Do you remember the difference between a ghost and a ghast?', file: 'spookswisdom-98.jpg' },
                { id: 99, phrase: 'Correct. ', file: 'spookswisdom-99.jpg' },
                { id: 100, phrase: 'Oh. Pardon. Aim, Tusk, for God\'s sake', file: 'spookswisdom-100.jpg' },
                { id: 101, phrase: 'The bell. I\'m being summoned', file: 'spookswisdom-101.jpg' },
                { id: 102, phrase: 'Tusk. Best make yourself scarce', file: 'spookswisdom-102.jpg' },
                { id: 103, phrase: 'That depends on who is inquiring', file: 'spookswisdom-103.jpg' },
                { id: 104, phrase: 'This will cost us two days\' journey. If it is anything less than a Boggart, we are on our way', file: 'spookswisdom-104.jpg' },
                { id: 105, phrase: 'You do not want to know', file: 'spookswisdom-105.jpg' },
                { id: 106, phrase: 'Flattery is fine. Gold is finer', file: 'spookswisdom-106.jpg' },
                { id: 107, phrase: 'Feels a bit light', file: 'spookswisdom-107.jpg' },
                { id: 108, phrase: 'Ah. Of course. Malkin\'s most bloodthirsty lieutenant', file: 'spookswisdom-108.jpg' },
                { id: 109, phrase: 'He has killed more of my kind than all of the rest put together. His name is Urag', file: 'spookswisdom-109.jpg' },
                { id: 110, phrase: 'Leave us', file: 'spookswisdom-110.jpg' },
                { id: 111, phrase: 'I fight him alone. Ancient code of honor', file: 'spookswisdom-111.jpg' },
                { id: 112, phrase: 'More importantly, I prefer not to split the reward', file: 'spookswisdom-112.jpg' },
                { id: 113, phrase: 'The cage! Grab on to the cage!', file: 'spookswisdom-113.jpg' },
                { id: 114, phrase: 'Jump!', file: 'spookswisdom-114.jpg' },
                { id: 115, phrase: 'Silverbane!', file: 'spookswisdom-115.jpg' },
                { id: 116, phrase: 'We are not finished. Oil!', file: 'spookswisdom-116.jpg' },
                { id: 117, phrase: 'We must kill him for good', file: 'spookswisdom-117.jpg' },
                { id: 118, phrase: 'Do it. Unless you prefer to eat his heart', file: 'spookswisdom-118.jpg' },
                { id: 119, phrase: 'Not yet. But you will be!', file: 'spookswisdom-119.jpg' },
                { id: 120, phrase: 'I am training you to kill witches! If you cannot do that, you are useless to me!', file: 'spookswisdom-120.jpg' },
                { id: 121, phrase: 'Yes, that\'s right. Go sulk, boy.', file: 'spookswisdom-121.jpg' },
                { id: 122, phrase: 'I too, was once young', file: 'spookswisdom-122.jpg' },
                { id: 123, phrase: 'Did not listen. Was arrogant like you', file: 'spookswisdom-123.jpg' },
                { id: 124, phrase: 'I once loved a witch. Yes. Malkin', file: 'spookswisdom-124.jpg' },
                { id: 125, phrase: 'She was not always evil. Fear and hatred created her', file: 'spookswisdom-125.jpg' },
                { id: 126, phrase: 'She grew into what she was perceived to be... deadly', file: 'spookswisdom-126.jpg' },
                { id: 127, phrase: 'When she... discovered I had married, she could not endure my happiness', file: 'spookswisdom-127.jpg' },
                { id: 128, phrase: 'She murdered my wife in cold blood', file: 'spookswisdom-128.jpg' },
                { id: 129, phrase: 'I captured her. I was clever. Lied to her... told her I still loved her', file: 'spookswisdom-129.jpg' },
                { id: 130, phrase: 'I had my chance to kill her, but I showed her mercy instead', file: 'spookswisdom-130.jpg' },
                { id: 131, phrase: 'Tricked her. Locked her away in a cage buried in the ground. I thought that prison would hold her for eternity', file: 'spookswisdom-131.jpg' },
                { id: 132, phrase: 'But I was wrong. Now everyone she kills in her wake is my burden.', file: 'spookswisdom-132.jpg' },
                { id: 133, phrase: 'I want you to meet my wife, Mr. Ward', file: 'spookswisdom-133.jpg' },
                { id: 134, phrase: 'This is Rebecca', file: 'spookswisdom-134.jpg' },
                { id: 135, phrase: 'This... is why I\'ve been so hard on you, Tom', file: 'spookswisdom-135.jpg' },
                { id: 136, phrase: 'Do not make the same mistake. If you see a witch, kill it', file: 'spookswisdom-136.jpg' },
                { id: 137, phrase: 'Beyond the forest... Pendle Mountain. We have three days', file: 'spookswisdom-137.jpg' },
                { id: 138, phrase: 'Tusk! Dependable as death you are', file: 'spookswisdom-138.jpg' },
                { id: 139, phrase: 'A Boggart. Subterraneal beast. Nasty temperament. Blind as a bat', file: 'spookswisdom-139.jpg' },
                { id: 140, phrase: 'You don\'t. You run!', file: 'spookswisdom-140.jpg' },
                { id: 141, phrase: 'Their sense of smell... extraordinary. Jump!', file: 'spookswisdom-141.jpg' },
                { id: 142, phrase: 'We seem to be having a Boggart problem. Much thanks', file: 'spookswisdom-142.jpg' },
                { id: 143, phrase: 'Don\'t worry. We\'re all safe now. Boggarts... they hate water', file: 'spookswisdom-143.jpg' },
                { id: 144, phrase: 'Mr. Ward! Mr. Ward!', file: 'spookswisdom-144.jpg' },
                { id: 145, phrase: 'Tom!', file: 'spookswisdom-145.jpg' },
                { id: 146, phrase: 'You do not die easy, do you, Mr. Ward?', file: 'spookswisdom-146.jpg' },
                { id: 147, phrase: 'And you slayed the unslayable', file: 'spookswisdom-147.jpg' },
                { id: 148, phrase: 'Where did you get that?', file: 'spookswisdom-148.jpg' },
                { id: 149, phrase: 'You, Mr. Ward', file: 'spookswisdom-149.jpg' },
                { id: 150, phrase: 'The Umbran stone. The witches\' most sacred talisman. It strengthens their powers. Makes their illusions seem more real', file: 'spookswisdom-150.jpg' },
                { id: 151, phrase: 'Mother Malkin... she had the stone once. In her hands it has tremendous power', file: 'spookswisdom-151.jpg' },
                { id: 152, phrase: 'But it was stolen from her by another witch. Only then was I able to defeat her, to trap her', file: 'spookswisdom-152.jpg' },
                { id: 153, phrase: 'So that is what you are... a witch\'s son who is a Spook\'s apprentice', file: 'spookswisdom-153.jpg' },
                { id: 154, phrase: 'Oh that\'s funny', file: 'spookswisdom-154.jpg' },
                { id: 155, phrase: 'Hmm. Must account for your visions', file: 'spookswisdom-155.jpg' },
                { id: 156, phrase: 'A little something for the pain. make you more human', file: 'spookswisdom-156.jpg' },
                { id: 157, phrase: 'Just good luck, I guess', file: 'spookswisdom-157.jpg' },
                { id: 158, phrase: 'You must never have more than one sip of this a day', file: 'spookswisdom-158.jpg' },
                { id: 159, phrase: 'Because it is mine!', file: 'spookswisdom-159.jpg' },
                { id: 160, phrase: 'Resilient as you are ugly, old friend', file: 'spookswisdom-160.jpg' },
                { id: 161, phrase: 'What? What is it?', file: 'spookswisdom-161.jpg' },
                { id: 162, phrase: 'Something\'s wrong. Stay here. We will look ahead', file: 'spookswisdom-162.jpg' },
                { id: 163, phrase: 'Mr. Ward, go gather wood. We\'re going to have a fire', file: 'spookswisdom-163.jpg' },
                { id: 164, phrase: 'I said gather wood', file: 'spookswisdom-164.jpg' },
                { id: 165, phrase: 'She\'s a spy. We have a mission Mr. Ward', file: 'spookswisdom-165.jpg' },
                { id: 166, phrase: 'This is your most important test... right now', file: 'spookswisdom-166.jpg' },
                { id: 167, phrase: 'Damn it, boy! The stone. She\'s stolen it', file: 'spookswisdom-167.jpg' },
                { id: 168, phrase: 'Now tell me she\'s innocent', file: 'spookswisdom-168.jpg' },
                { id: 169, phrase: 'I cannot lose this one', file: 'spookswisdom-169.jpg' },
                { id: 170, phrase: 'Tom! Tom, the staff!', file: 'spookswisdom-170.jpg' },
                { id: 171, phrase: 'No...', file: 'spookswisdom-171.jpg' },
                { id: 172, phrase: 'You fight me as a dragon, not as a man. Have you no honor?', file: 'spookswisdom-172.jpg' },
                { id: 173, phrase: 'Should have stayed a dragon', file: 'spookswisdom-173.jpg' },
                { id: 174, phrase: 'Alone. I do this alone', file: 'spookswisdom-174.jpg' },
                { id: 175, phrase: 'I did love you once', file: 'spookswisdom-175.jpg' },
                { id: 176, phrase: 'Gone. As my hatred is', file: 'spookswisdom-176.jpg' },
                { id: 177, phrase: 'In the old days there was a ceremony. Flags. Magnificent horns. Could be a bit silly with just the two of us', file: 'spookswisdom-177.jpg' },
                { id: 178, phrase: 'Mysterium tremendum et fascinans', file: 'spookswisdom-178.jpg' },
                { id: 179, phrase: 'The time has come, Master Ward', file: 'spookswisdom-179.jpg' },
                { id: 180, phrase: 'Forgive me. Perhaps I was not clear. \'Tis I who ride.', file: 'spookswisdom-180.jpg' },
                { id: 181, phrase: 'This is your home now. I trust you will take care of it', file: 'spookswisdom-181.jpg' },
                { id: 182, phrase: 'And Tusk. Yes, old friend', file: 'spookswisdom-182.jpg' },
                { id: 183, phrase: 'Wrong question. Wrong questions get wrong answers', file: 'spookswisdom-183.jpg' },
                { id: 184, phrase: 'Tusk, give us a hand', file: 'spookswisdom-184.jpg' },
                { id: 185, phrase: 'Do you remember all I taught you? Ignore it', file: 'spookswisdom-185.jpg' },
                { id: 186, phrase: 'The rules, Tom... do not be bound by them. Use them in your own way. Live your own life', file: 'spookswisdom-186.jpg' },
                { id: 187, phrase: 'Your destiny', file: 'spookswisdom-187.jpg' },
                // backfill missing lines from the opening scene
                { id: 188, phrase: 'Hatchet. Silverbane. Longbow', file: 'spookswisdom-188.jpg' },
                { id: 189, phrase: 'We\'ll need the silver net', file: 'spookswisdom-189.jpg' },
                { id: 190, phrase: 'How long has she been like this?', file: 'spookswisdom-190.jpg' },
                { id: 191, phrase: 'If it is really you, then show yourself. Leave this innocent child', file: 'spookswisdom-191.jpg' },
            ];

            // TODO: consider adding a once per day limit
            // to reference the best line
            // "You must never have more than one sip of this a day"
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
            await userStatCommandService.incrementUserStat(userId, CONSTANTS.STATS.SPOOKS_WISDOM, CONSTANTS.STATS.SPOOKS_WISDOM_FRIENDLY);
            await statService.incrementSystemStat(CONSTANTS.STATS.SPOOKS_WISDOM, CONSTANTS.STATS.SPOOKS_WISDOM_FRIENDLY);
        } catch (error) {
            logger.error(error);
            await interaction.editReply('An error occurred.');
        }
    }
};
