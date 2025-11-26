const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('promote')
        .setDescription('Promote a user by assigning them a new role.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to promote')
                .setRequired(true))
        .addRoleOption(option =>
            option.setName('newrole')
                .setDescription('The role to assign')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('The reason for promotion')
                .setRequired(true)),
    
    async execute(interaction) {
        const promochannel = '1440146019571466299';
        const channel = interaction.guild.channels.cache.get(promochannel);

        const requiredrole = '1443356737678737500';
        if (!interaction.member.roles.cache.has(requiredrole)) {
            return interaction.reply({ content: '❌ You do not have the required role.', ephemeral: true });
        }

        const user = interaction.options.getMember('user');
        const newRole = interaction.options.getRole('newrole');
        const reason = interaction.options.getString('reason');

        if (!user) {
            return interaction.reply({ content: '❌ Could not find that user.', ephemeral: true });
        }

        if (!newRole) {
            return interaction.reply({ content: '❌ Could not find that role.', ephemeral: true });
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
                    { name: '👮 Promoted By', value: interaction.user.tag, inline: true }
                )
                .setTimestamp()
                .setFooter({ text: 'Promotion System' })
                .setImage('https://cdn.discordapp.com/attachments/1443357296997699698/1443359334334464041/image.png?ex=6928c8a1&is=69277721&hm=c214d7647313ed5ef98cf80ad7f653f1efe8c60c0f69137bb8af9541c924d501&'); 
            
            await channel.send({ embeds: [embed] });
            await interaction.reply({ content: '✅ User promoted successfully!', ephemeral: true });

            // Try to DM the user
            try {
                const dmEmbed = new EmbedBuilder()
                    .setColor(0xC0B030)
                    .setTitle('🎉 You\'ve Been Promoted!')
                    .setDescription(`You've been promoted in **${interaction.guild.name}**`)
                    .addFields(
                        { name: '🎭 New Role', value: newRole.name },
                        { name: '📝 Reason', value: reason }
                    )
                    .setTimestamp();

                await user.send({ embeds: [dmEmbed] });
            } catch (err) {
                await interaction.followUp({ content: '⚠️ Could not send a DM to the user.', ephemeral: true });
            }

        } catch (error) {
            console.error(error);
            return interaction.reply({ content: '❌ Failed to promote user. Check my role hierarchy and permissions.', ephemeral: true });
        }
    }
};