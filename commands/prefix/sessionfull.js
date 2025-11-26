const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'sessionfull',
    description: 'Announce a full session',
    aliases: ["full"],
    async execute(message) {
        const sessionschannelid = '1443335742318444654';
        const channel = message.guild.channels.cache.get(sessionschannelid);

        const requiredrole = '1443337222706434138';
        if (!message.member.roles.cache.has(requiredrole)) {
            return message.reply('❌ You do not have the required role.')
        }

        const serverFullEmbed = new EmbedBuilder()
            .setTitle('Full Server')
            .setDescription('The in-game server is full of players. Thank you for playing!')
            .setAuthor({ name: `Initiated by: ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
            .setFooter({ text: 'West Virginia Sessions' })
            .setTimestamp()
            .setColor('#000000');
        
        await channel.send({ embeds: [serverFullEmbed] });
    }
}