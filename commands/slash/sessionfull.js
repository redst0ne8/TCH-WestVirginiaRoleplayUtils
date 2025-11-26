const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sessionfull')
        .setDescription('Announce a full session'),
    
    async execute(interaction) {
        const sessionschannelid = '1440146018200195229';
        const channel = interaction.guild.channels.cache.get(sessionschannelid);

        const requiredrole = '1443048237316702379';
        if (!interaction.member.roles.cache.has(requiredrole)) {
            return interaction.reply({ content: '❌ You do not have the required role.', ephemeral: true });
        }

        const serverFullEmbed = new EmbedBuilder()
            .setTitle('Full Server')
            .setDescription('The in-game server is full of players. Thank you for playing!')
            .setAuthor({ name: `Initiated by: ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
            .setFooter({ text: 'West Virginia Sessions' })
            .setTimestamp()
            .setColor('#C0B030')
            .setImage('https://cdn.discordapp.com/attachments/1443328384187895919/1443353169571872799/image.png?ex=6928c2e3&is=69277163&hm=f67224320d5796eee07c7b3e9c3d008e63e35b0356b187eef97e8f65226b5b7d&');

        await channel.send({ embeds: [serverFullEmbed] });
        return interaction.reply({ content: '✅ Full session announced!', ephemeral: true });
    }
};