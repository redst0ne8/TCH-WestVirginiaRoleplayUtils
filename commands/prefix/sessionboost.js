const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'sessionboost',
    description: 'Announce a session boost',
    aliases: ["boost"],
    async execute(message) {
        const sessionschannelid = '1443335742318444654';
        const channel = message.guild.channels.cache.get(sessionschannelid);
        const sessionping = 'YOUR_ROLE_ID';

        const requiredrole = '1443337222706434138';
        if (!message.member.roles.cache.has(requiredrole)) {
            return message.reply('❌ You do not have the required role.')
        }

        const serverBoostEmbed = new EmbedBuilder()
            .setTitle('Low Server Count')
            .setDescription('The in-game server is low on players! Lets boost our player count!')
            .setAuthor({ name: `Initiated by: ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
            .addFields(
                { name: 'Join Code', value: 'Your ER:LC Join Code', inline: false }
            )
            .setFooter({ text: 'West Virginia Sessions' })
            .setTimestamp()
            .setColor('#000000');
        
        await channel.send({ embeds: [serverBoostEmbed], content: `<@&${sessionping}>` });
    }
}