const { loadShifts, saveShifts } = require('../../utils/shiftUtils');

module.exports = {
    name: 'shiftreset',
    description: 'Reset all shift times to 0 and DM the previous data.',
    aliases: ["sr", "resetshifts"],
    minArgs: 0,
    usage: '',
    
    async execute(message, args) {
        const shifts = loadShifts();
        
        let dmMessage = '📊 **Shift Data Before Reset**\n\n';
        
        for (const [userId, data] of Object.entries(shifts)) {
            try {
                const user = await message.client.users.fetch(userId);
                dmMessage += `${user.tag}: ${formatTime(data.totalTime)}\n`;
            } catch {
                dmMessage += `Unknown User (${userId}): ${formatTime(data.totalTime)}\n`;
            }
        }
        
        saveShifts({});
        
        try {
            await message.author.send(dmMessage);
            await message.reply('✅ All shift times have been reset to 0. Check your DMs for the previous data.');
        } catch {
            await message.reply('✅ All shift times have been reset to 0. (Could not DM you the data)');
        }
    }
};

function formatTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
}