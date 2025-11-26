const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('logaction')
        .setDescription('Log a moderation action with required user, type, and reason, plus optional evidence.')
        .addStringOption(option =>
            option.setName('user')
                .setDescription('The user identifier (username, ID, etc.)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('type')
                .setDescription('The type of moderation action')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('The reason for the action')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('evidence')
                .setDescription('Evidence link (optional)')
                .setRequired(false)),
    
    async execute(interaction) {
        const requiredrole = '1440146016392450179';
        if (!interaction.member.roles.cache.has(requiredrole)) {
            return interaction.reply({ content: '❌ You do not have the required role.', ephemeral: true });
        }

        const user = interaction.options.getString('user');
        const type = interaction.options.getString('type');
        const reason = interaction.options.getString('reason');
        const evidence = interaction.options.getString('evidence');

        const logEmbed = new EmbedBuilder()
            .setTitle('Moderation Log')
            .setDescription('A new moderation action has been logged.')
            .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
            .addFields(
                { name: '👤 User', value: user, inline: true },
                { name: '⚖️ Type', value: type.toUpperCase(), inline: true },
                { name: '👮 Moderator', value: interaction.user.tag, inline: true },
                { name: '📝 Reason', value: reason, inline: false },
                { name: '🔗 Evidence', value: evidence || 'None Provided', inline: false }
            )
            .setColor('#FF6B6B')
            .setTimestamp();

        const channel = interaction.guild.channels.cache.get('1440146020397744260');

        if (!channel) {
            return interaction.reply({ content: '❌ **Error:** Log channel not found!', ephemeral: true });
        }

        await channel.send({ embeds: [logEmbed] });
        return interaction.reply({ content: '✅ **Action logged successfully!**', ephemeral: true });
    }
};