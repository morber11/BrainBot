const { SlashCommandBuilder } = require('discord.js');
const ytdl = require('ytdl-core');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ponder')
		.setDescription('when you want to brain'),
	async execute(interaction) {
        const { joinVoiceChannel, createAudioPlayer, createAudioResource, generateDependencyReport } = require('@discordjs/voice');
        
        const url = 'https://www.youtube.com/watch?v=AXqMnPyx73E'
        const stream = ytdl(url, {filter: 'audioonly'});
        const player = createAudioPlayer();
        const resource = createAudioResource(stream);

        const guildMember = await interaction.member.guild.members.fetch(interaction.user.id);
        
        const connection = joinVoiceChannel({
        	channelId: guildMember.voice.channelId,
        	guildId: interaction.guildId,
        	adapterCreator: interaction.channel.guild.voiceAdapterCreator,
        });

        connection.subscribe(player);
        player.play(resource);

        await interaction.reply("brain brain brain brain");
        //console.log(generateDependencyReport());
	},
};