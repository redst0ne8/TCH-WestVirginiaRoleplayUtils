const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'sessionstop',
    description: 'Stop a session',
    aliases: ["ssd"],
    async execute(message) {
        const sessionschannelid = '1443335742318444654';
        const channel = message.guild.channels.cache.get(sessionschannelid);

        const requiredrole = '1443337222706434138';
        if (!message.member.roles.cache.has(requiredrole)) {
            return message.reply('❌ You do not have the required role.')
        }

        const ssdEmbed = new EmbedBuilder()
            .setTitle('Server Shutdown')
            .setDescription('The in-game server is now shutdown. Please do not join. Thank you for playing in the previous session!')
            .setAuthor({ name: `Initiated by: ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
            .setFooter({ text: 'West Virginia Sessions' })
            .setTimestamp()
            .setColor('#000000');
        
        await channel.send({ embeds: [ssdEmbed] });
    }
}