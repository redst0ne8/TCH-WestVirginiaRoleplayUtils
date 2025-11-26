const { EmbedBuilder } = require('discord.js');
const { loadShifts, createShiftButtons } = require('../../utils/shiftUtils');

module.exports = {
    name: 'shiftadmin',
    description: 'Manage another user\'s shift.',
    aliases: ['sa', 'adminshift'],
    minArgs: 1,
    usage: '{user}',
    
    async execute(message, args) {
        const mentionedUser = message.mentions.users.first();
        if (!mentionedUser) {
            return message.reply('❌ Please mention a user to manage their shift.');
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
            .setFooter({ text: `Managed by: ${message.author.tag}` })
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