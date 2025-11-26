const { EmbedBuilder } = require('discord.js');
const { loadShifts, saveShifts, createShiftButtons } = require('../utils/shiftUtils');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        if (!interaction.isButton()) return;
        
        const shifts = loadShifts();
        const userId = interaction.customId.startsWith('shift_') ? 
            (interaction.message.embeds[0].footer.text.includes('Managed by') ? 
                interaction.message.embeds[0].description.match(/<@(\d+)>/)?.[1] || 
                Object.keys(shifts).find(id => {
                    const user = interaction.client.users.cache.get(id);
                    return user && interaction.message.embeds[0].description.includes(user.tag);
                }) : 
                interaction.user.id) : 
            interaction.user.id;
        
        if (!shifts[userId]) {
            shifts[userId] = { totalTime: 0, currentShift: null, currentBreak: null };
        }
        
        const userData = shifts[userId];
        const now = Date.now();
        
        if (interaction.customId === 'shift_start') {
            userData.currentShift = now;
            userData.currentBreak = null;
            saveShifts(shifts);
            await interaction.reply({ content: '✅ Shift started!', ephemeral: true });
        }
        
        if (interaction.customId === 'shift_break') {
            if (userData.currentShift && !userData.currentBreak) {
                userData.currentBreak = now;
                saveShifts(shifts);
                await interaction.reply({ content: '☕ Break started!', ephemeral: true });
            }
        }
        
        if (interaction.customId === 'shift_stop') {
            if (userData.currentShift) {
                let shiftTime = now - userData.currentShift;
                
                if (userData.currentBreak) {
                    shiftTime -= (now - userData.currentBreak);
                }
                
                userData.totalTime += shiftTime;
                userData.currentShift = null;
                userData.currentBreak = null;
                saveShifts(shifts);
                await interaction.reply({ content: `✅ Shift stopped! Session time: ${formatTime(shiftTime)}`, ephemeral: true });
            }
        }
        
        // Update the embed and buttons
        const user = await interaction.client.users.fetch(userId);
        const isAdmin = interaction.message.embeds[0].title.includes('Admin');
        
        const embed = new EmbedBuilder()
            .setTitle(isAdmin ? '🕐 Shift Management (Admin)' : '🕐 Shift Management')
            .setDescription(isAdmin ? `Managing shift for: **${user.tag}**\nTotal Shift Time: **${formatTime(userData.totalTime)}**` : `Total Shift Time: **${formatTime(userData.totalTime)}**`)
            .setColor(userData.currentShift ? (userData.currentBreak ? 0xFFA500 : 0x00FF00) : 0xFF0000)
            .addFields(
                { name: 'Status', value: userData.currentShift ? (userData.currentBreak ? '☕ On Break' : '✅ On Shift') : '❌ Off Shift', inline: true }
            )
            .setFooter({ text: isAdmin ? `Managed by: ${interaction.message.embeds[0].footer.text.split(': ')[1]}` : `User: ${user.tag}` })
            .setTimestamp();
        
        const row = createShiftButtons(userId, shifts);
        
        await interaction.message.edit({ embeds: [embed], components: [row] });
    }
};

function formatTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
}