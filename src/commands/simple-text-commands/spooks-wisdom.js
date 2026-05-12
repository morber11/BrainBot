const { SlashCommandBuilder } = require('discord.js');
const stringUtility = require('../../utils/string-util.js');
const logger = require('../../utils/logger.js');
const pathUtility = require('../../utils/path-util.js');

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
        } catch (error) {
            logger.error(error);
            await interaction.editReply('An error occurred.');
        }
    }
};
