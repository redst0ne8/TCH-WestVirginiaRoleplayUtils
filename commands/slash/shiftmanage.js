const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { loadShifts, createShiftButtons } = require('../../utils/shiftUtils');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shiftmanage')
        .setDescription('Manage your own shift with start, break, and stop buttons.'),
    
    async execute(interaction) {
        const requiredrole = '1440146016392450179';
        if (!interaction.member.roles.cache.has(requiredrole)) {
            return interaction.reply({ content: '❌ You do not have the required role.', ephemeral: true });
        }

        const shifts = loadShifts();
        const userId = interaction.user.id;
        const userData = shifts[userId] || { totalTime: 0, currentShift: null, currentBreak: null };
        
        const embed = new EmbedBuilder()
            .setTitle('🕐 Shift Management')
            .setDescription(`Total Shift Time: **${formatTime(userData.totalTime)}**`)
            .setColor(userData.currentShift ? (userData.currentBreak ? 0xFFA500 : 0x00FF00) : 0xFF0000)
            .addFields(
                { name: 'Status', value: userData.currentShift ? (userData.currentBreak ? '☕ On Break' : '✅ On Shift') : '❌ Off Shift', inline: true }
            )
            .setFooter({ text: `User: ${interaction.user.tag}` })
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