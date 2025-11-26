const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { loadShifts, createShiftButtons } = require('../../utils/shiftUtils');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shiftadmin')
        .setDescription('Manage another user\'s shift.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user whose shift to manage')
                .setRequired(true)),
    
    async execute(interaction) {
        const requiredrole = '1443355818153218200';
        if (!interaction.member.roles.cache.has(requiredrole)) {
            return interaction.reply({ content: '❌ You do not have the required role.', ephemeral: true });
        }

        const mentionedUser = interaction.options.getUser('user');
        if (!mentionedUser) {
            return interaction.reply({ content: '❌ Could not find that user.', ephemeral: true });
        }
        
        const shifts = loadShifts();
        const userId = mentionedUser.id;
        const userData = shifts[userId] || { totalTime: 0, currentShift: null, currentBreak: null };
        
        const embed = new EmbedBuilder()
            .setTitle('🕐 Shift Management (Admin)')
            .setDescription(`Managing shift for: **${mentionedUser.tag}**\nTotal Shift Time: **${formatTime(userData.totalTime)}**`)
            .setColor(userData.currentShift ? (userData.currentBreak ? 0xFFA500 : 0x00FF00) : 0xFF0000)
            .addFields(
                { name: 'Status', value: userData.currentShift ? (userData.currentBreak ? '☕ On Break' : '✅ On Shift') : '❌ Off Shift', inline: true }
            )
            .setFooter({ text: `Managed by: ${interaction.user.tag}` })
            .setTimestamp();
        
        const row = createShiftButtons(userId, shifts);
        
        await interaction.reply({ embeds: [embed], components: [row] });
    }
};

function formatTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
}