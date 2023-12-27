const { SlashCommandBuilder } = require('discord.js');
const ytdl = require('ytdl-core');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('for when the other bots are broken')
        .addStringOption(option =>
            option.setName('url')
                .setDescription('url')
                .setRequired(true),
        ),
	async execute(interaction) {
        const { joinVoiceChannel, createAudioPlayer, createAudioResource, generateDependencyReport } = require('@discordjs/voice');
        
        const url = interaction.options.getString('url');
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

        await interaction.reply("Now playing: " + url);
        //console.log(generateDependencyReport());
	},
};