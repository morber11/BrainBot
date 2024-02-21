const { SlashCommandBuilder } = require('discord.js');
const Member = require('../../dal/models/member.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('despair')
        .setDescription('aaaaaaaaaaaaaaaaaaaaaa'),
    async execute(interaction) {
        await interaction.deferReply();

        const { id, username } = interaction.user;

        var [member, created] = await Member.findOrCreate({
            where: {
                id: id,
            }
        });

        if (!created) {
            await Member.update({
                name: username,
            },
                { where: { id: id } }
            );
        }

        await interaction.editReply(`Your mental despair is: ${member.dataValues.despairCount}`);
    }
};