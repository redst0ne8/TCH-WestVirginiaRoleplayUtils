const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'sessionstart',
    description: 'Start a session',
    aliases: ["ssu"],
    async execute(message) {
        const sessionschannelid = '1443335742318444654';
        const channel = message.guild.channels.cache.get(sessionschannelid);
        const sessionping = 'YOUR_ROLE_ID';

        const requiredrole = '1443337222706434138';
        if (!message.member.roles.cache.has(requiredrole)) {
            return message.reply('❌ You do not have the required role.')
        }

        const ssuEmbed = new EmbedBuilder()
            .setTitle('Server Startup')
            .setDescription('The in-game server is now active. Lets make Virginia full!')
            .setAuthor({ name: `Initiated by: ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
            .addFields(
                { name: 'Join Code', value: 'Your ER:LC Join Code', inline: false }
            )
            .setFooter({ text: 'West Virginia Sessions' })
            .setTimestamp()
            .setColor('#000000');
        
        await channel.send({ embeds: [ssuEmbed], content: `<@&${sessionping}>` });
    }
}