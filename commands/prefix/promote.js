const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'promote',
    description: 'Promote a user by assigning them a new role.',
    aliases: ['p'],
    minArgs: 2,
    usage: '{user} {newrole} {reason}',
    
    async execute(message, args) {
        const user = message.mentions.members.first();
        const newRole = message.mentions.roles.first();
        const reason = args.slice(2).join(' ') || 'No reason provided';

        const promochannel = '1440146019571466299'
        const channel = message.guild.channels.cache.get(promochannel)

        const requiredrole = '1443356737678737500';
        if (!message.member.roles.cache.has(requiredrole)) {
            await message.reply('❌ You do not have the required role.')
            return message.delete();
        }

        if (!user) {
            await message.reply('❌ Please mention a user to promote.');
            return message.delete();
        }

        if (!newRole) {
            await message.reply('❌ Please mention a role to assign.');
            return message.delete();
        }

        try {
            await user.roles.add(newRole);

            const embed = new EmbedBuilder()
                .setColor(0xC0B030)
                .setTitle('🎉 Staff Promotion!')
                .setThumbnail(user.user.displayAvatarURL())
                .addFields(
                    { name: '👤 User', value: `${user.user.tag} (${user.id})`, inline: true },
                    { name: '🎭 New Role', value: newRole.name, inline: true },
                    { name: '📝 Reason', value: reason, inline: false },
                    { name: '👮 Promoted By', value: message.author.tag, inline: true }
                )
                .setTimestamp()
                .setFooter({ text: 'Promotion System' })
                .setTimestamp()
                .setImage('https://cdn.discordapp.com/attachments/1443357296997699698/1443359334334464041/image.png?ex=6928c8a1&is=69277721&hm=c214d7647313ed5ef98cf80ad7f653f1efe8c60c0f69137bb8af9541c924d501&'); 
            await channel.send({ embeds: [embed] });
            message.delete()

            // Try to DM the user
            try {
                const dmEmbed = new EmbedBuilder()
                    .setColor(0xC0B030)
                    .setTitle('🎉 You\'ve Been Promoted!')
                    .setDescription(`You've been promoted in **${message.guild.name}**`)
                    .addFields(
                        { name: '🎭 New Role', value: newRole.name },
                        { name: '📝 Reason', value: reason }
                    )
                    .setTimestamp();

                await user.send({ embeds: [dmEmbed] });
            } catch (err) {
                await message.channel.send('⚠️ Could not send a DM to the user.');
            }

        } catch (error) {
            await message.reply('❌ Failed to promote user. Check my role hierarchy and permissions.');
            console.error(error);
            return message.delete();
        }
    }
};