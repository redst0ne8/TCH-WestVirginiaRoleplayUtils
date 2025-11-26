const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'sessionvote',
    description: 'Vote to start a session',
    aliases: ["vote"],
    async execute(message) {
        const sessionschannelid = '1443335742318444654';
        const channel = message.guild.channels.cache.get(sessionschannelid);
        const sessionping = 'YOUR_ROLE_ID';

        const requiredrole = '1443337222706434138';
        if (!message.member.roles.cache.has(requiredrole)) {
            return message.reply('❌ You do not have the required role.')
        }

        const svoteEmbed = new EmbedBuilder()
            .setTitle('Server Startup Vote')
            .setDescription(`${message.author.tag} would like to get a session going. Please vote below by reacting to the message with the ✅!`)
            .setAuthor({ name: `Initiated by: ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
            .setFooter({ text: 'West Virginia Sessions' })
            .addFields(
                { name: 'Votes Required', value: 'We need # Votes to start a session! Vote up!'}
            )
            .setTimestamp()
            .setColor('#000000');
        
        const sentmessage = await channel.send({ embeds: [svoteEmbed], content: `<@&${sessionping}>` });
        await sentmessage.react('✅')
    }
}