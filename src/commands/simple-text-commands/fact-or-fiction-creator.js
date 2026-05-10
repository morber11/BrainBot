const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const factOrFictionService = require('../../services/fact-or-fiction-service.js');
const cryptUtil = require('../../utils/crypt-util.js');
const pathUtility = require('../../utils/path-util.js');
const CONSTANTS = require('../../utils/constants.js');
const stringUtility = require('../../utils/string-util.js');
const mathUtil = require('../../utils/math-util.js');
const logger = require('../../utils/logger.js');
const userStatService = require('../../services/user-stat-service.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('fact-or-fictionator')
        .setDescription('will you discover the truth? or get lost in the lies?')
        .addStringOption(option =>
            option.setName('url')
                .setDescription(`we'll find out if this url is fact or fiction at the end of the episode`)
                .setMaxLength(300)
                .setRequired(true),
        ),
    async execute(interaction) {
        try {
            await interaction.deferReply();

            const url = interaction.options.getString('url');
            const hash = await cryptUtil.getHash(url);

            const [factOrFictionEntry, created] = await factOrFictionService.findOrCreate(hash);

            let value = factOrFictionEntry.dataValues.value;

            if (created) {
                const rand = mathUtil.getRandomInt(999);
                const result = rand % 2 === 0
                    ? CONSTANTS.FACT_OR_FICTION.VALUES.FACT
                    : CONSTANTS.FACT_OR_FICTION.VALUES.FICTION;

                await factOrFictionService.update(factOrFictionEntry.id, result);

                value = result;
            }
            const dir = pathUtility.getMediaFilePath(__dirname, 'images',
                value === CONSTANTS.FACT_OR_FICTION.VALUES.FACT ? 'fact/fact.gif' : 'fiction/fiction.gif');

            const attachment = new AttachmentBuilder(dir);

            const response = stringUtility.selectRandomFromArray(
                CONSTANTS.FACT_OR_FICTION.RESPONSES.filter(x => x.category === value)
            );

            // ideas
            // add a based on x events by y etc, column in db.
            // similar events took place in x location
            await interaction.editReply({
                content: `Did you manage to work it out? \nThe story in question: \`${url}\`\n${response.response}\n`,
                files: [attachment]
            });

            const userId = interaction.user && interaction.user.id;
            await userStatService.incrementUserStat(userId, CONSTANTS.STATS.FACT_OR_FICTION, CONSTANTS.STATS.FACT_OR_FICTION_FRIENDLY);
        }
        catch (error) {
            logger.error('An error occurred.:', error);
            await interaction.reply({
                content: 'An error occurred.',
                ephemeral: true,
            });
        }
    }
};