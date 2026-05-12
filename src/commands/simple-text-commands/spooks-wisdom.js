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
                { id: 13, phrase: 'Ten damn years... wasted', file: '13.jpg' },
                { id: 14, phrase: 'I\'m coming for you, Malkin!', file: '14.jpg' },
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
            while (updated.length > 3) {
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
