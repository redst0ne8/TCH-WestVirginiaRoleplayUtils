const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'sessionboost',
    description: 'Announce a session boost',
    aliases: ["boost"],
    async execute(message) {
        const sessionschannelid = '1440146018200195229';
        const channel = message.guild.channels.cache.get(sessionschannelid);
        const sessionping = 'YOUR_ROLE_ID';

        const requiredrole = '1443048237316702379';
        if (!message.member.roles.cache.has(requiredrole)) {
            await message.reply('❌ You do not have the required role.')
            return message.delete();
        }

        const serverBoostEmbed = new EmbedBuilder()
            .setTitle('Low Server Count')
            .setDescription('The in-game server is low on players! Lets boost our player count!')
            .setAuthor({ name: `Initiated by: ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
            .addFields(
                { name: 'Join Code', value: 'wvsrpc', inline: false }
            )
            .setFooter({ text: 'West Virginia Sessions' })
            .setTimestamp()
            .setColor('#C0B030')
            .setImage('https://cdn.discordapp.com/attachments/1443328384187895919/1443353169571872799/image.png?ex=6928c2e3&is=69277163&hm=f67224320d5796eee07c7b3e9c3d008e63e35b0356b187eef97e8f65226b5b7d&');

        
        await channel.send({ embeds: [serverBoostEmbed], content: `<@&${sessionping}>` });
        message.delete()
    }
}