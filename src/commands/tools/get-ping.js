const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('get_current_ping')
        .setDescription('Returns a ping and latency'),
    devOnly: true,
    async execute(interaction, client) {
        await interaction.deferReply();
        const { createdTimestamp } = await interaction.fetchReply();

        const { ping } = client.ws;

        const newMessage = `API Latency: ${ping}\nClient Ping: ${Date.now() - createdTimestamp}`;
        await interaction.editReply({
            content: newMessage
        });
    }
};