const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { loadShifts, createShiftButtons } = require('../../utils/shiftUtils');

module.exports = {
    name: 'shiftmanage',
    description: 'Manage your own shift with start, break, and stop buttons.',
    aliases: ['shift'],
    minArgs: 0,
    usage: '',
    
    async execute(message, args) {
        const shifts = loadShifts();
        const userId = message.author.id;
        const userData = shifts[userId] || { totalTime: 0, currentShift: null, currentBreak: null };
        
        const embed = new EmbedBuilder()
            .setTitle('🕐 Shift Management')
            .setDescription(`Total Shift Time: **${formatTime(userData.totalTime)}**`)
            .setColor(userData.currentShift ? (userData.currentBreak ? 0xFFA500 : 0x00FF00) : 0xFF0000)
            .addFields(
                { name: 'Status', value: userData.currentShift ? (userData.currentBreak ? '☕ On Break' : '✅ On Shift') : '❌ Off Shift', inline: true }
            )
            .setFooter({ text: `User: ${message.author.tag}` })
            .setTimestamp();
        
        const row = createShiftButtons(userId, shifts);
        
        await message.reply({ embeds: [embed], components: [row] });
    }
};

function formatTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
}