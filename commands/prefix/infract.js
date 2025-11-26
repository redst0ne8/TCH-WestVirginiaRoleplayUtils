const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'infract',
    description: 'Issue an infraction to a user.',
    aliases: ['i'],
    minArgs: 2,
    usage: '{user} {type} {reason} [strikeid] [demoteRole]',
    
    async execute(message, args) {
        const infractchannel = '1440146019571466300'
        const channel = message.guild.channels.cache.get(infractchannel)

        const requiredrole = '1443356747346739331';
        if (!message.member.roles.cache.has(requiredrole)) {
            await message.reply('❌ You do not have the required role.')
            return message.delete();
        }

        const user = message.mentions.members.first();
        const type = args[1]?.toLowerCase();
        const reason = args.slice(2).join(' ') || 'No reason provided';

        if (!user) {
            await message.reply('❌ Please mention a user to infract.');
            return message.delete();
        }

        const validTypes = ['warning', 'strike', 'demotion', 'termination'];
        if (!type || !validTypes.includes(type)) {
            await message.reply(`❌ Please specify a valid type: ${validTypes.join(', ')}`);
            return message.delete();
        }

        // Action mapping
        const actions = {
            'warning': { color: 0xC0B030, emoji: '‼️', title: 'Warning Issued' }, 
            'strike': { color: 0xC0B030, emoji: '⚡', title: 'Strike Issued' },
            'demotion': { color: 0xC0B030, emoji: '📉', title: 'User Demoted' },
            'termination': { color: 0xC0B030, emoji: '🔨', title: 'User Terminated' }
        };

        const action = actions[type];

        try {
            const embed = new EmbedBuilder()
                .setColor(action.color)
                .setTitle(`${action.emoji} ${action.title}`)
                .setThumbnail(user.user.displayAvatarURL())
                .addFields(
                    { name: '👤 User', value: `${user.user.tag} (${user.id})`, inline: true },
                    { name: '📋 Type', value: type.toUpperCase(), inline: true },
                    { name: '📝 Reason', value: reason, inline: false },
                    { name: '👮 Moderator', value: message.author.tag, inline: true }
                )
                .setTimestamp()
                .setFooter({ text: 'Infraction System' })
                .setImage('https://cdn.discordapp.com/attachments/1443357296997699698/1443359269507567719/image.png?ex=6928c892&is=69277712&hm=3ef1b2e7eefd719788f85a8754736fadc4fecb0d58591755ad949ffd46a83684&');

            await channel.send({ embeds: [embed] });
            message.delete()

            // Try to DM the user (unless banned/kicked)
            if (type !== 'ban' && type !== 'kick') {
                try {
                    const dmEmbed = new EmbedBuilder()
                        .setColor(action.color)
                        .setTitle(`${action.emoji} Infraction Received`)
                        .setDescription(`You've received an infraction in **${message.guild.name}**`)
                        .addFields(
                            { name: '📋 Type', value: type.toUpperCase() },
                            { name: '📝 Reason', value: reason }
                        )
                        .setTimestamp();

                    await user.send({ embeds: [dmEmbed] });
                } catch (err) {
                    await message.channel.send('⚠️ Could not send a DM to the user.');
                }
            }

        } catch (error) {
            await message.reply(`❌ Failed to ${type} user. Check my permissions and role hierarchy.`);
            console.error(error);
            return message.delete();
        }
    }
};