const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('infract')
        .setDescription('Issue an infraction to a user.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to infract')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('type')
                .setDescription('The type of infraction')
                .setRequired(true)
                .addChoices(
                    { name: 'Warning', value: 'warning' },
                    { name: 'Strike', value: 'strike' },
                    { name: 'Demotion', value: 'demotion' },
                    { name: 'Termination', value: 'termination' }
                ))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('The reason for the infraction')
                .setRequired(true)),
    
    async execute(interaction) {
        const infractchannel = '1440146019571466300';
        const channel = interaction.guild.channels.cache.get(infractchannel);

        const requiredrole = '1443356747346739331';
        if (!interaction.member.roles.cache.has(requiredrole)) {
            return interaction.reply({ content: '❌ You do not have the required role.', ephemeral: true });
        }

        const user = interaction.options.getMember('user');
        const type = interaction.options.getString('type');
        const reason = interaction.options.getString('reason');

        if (!user) {
            return interaction.reply({ content: '❌ Could not find that user.', ephemeral: true });
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
                    { name: '👮 Moderator', value: interaction.user.tag, inline: true }
                )
                .setTimestamp()
                .setFooter({ text: 'Infraction System' })
                .setImage('https://cdn.discordapp.com/attachments/1443357296997699698/1443359269507567719/image.png?ex=6928c892&is=69277712&hm=3ef1b2e7eefd719788f85a8754736fadc4fecb0d58591755ad949ffd46a83684&');

            await channel.send({ embeds: [embed] });
            await interaction.reply({ content: '✅ Infraction issued successfully!', ephemeral: true });

            // Try to DM the user
            if (type !== 'ban' && type !== 'kick') {
                try {
                    const dmEmbed = new EmbedBuilder()
                        .setColor(action.color)
                        .setTitle(`${action.emoji} Infraction Received`)
                        .setDescription(`You've received an infraction in **${interaction.guild.name}**`)
                        .addFields(
                            { name: '📋 Type', value: type.toUpperCase() },
                            { name: '📝 Reason', value: reason }
                        )
                        .setTimestamp();

                    await user.send({ embeds: [dmEmbed] });
                } catch (err) {
                    await interaction.followUp({ content: '⚠️ Could not send a DM to the user.', ephemeral: true });
                }
            }

        } catch (error) {
            console.error(error);
            return interaction.reply({ content: `❌ Failed to ${type} user. Check my permissions and role hierarchy.`, ephemeral: true });
        }
    }
};