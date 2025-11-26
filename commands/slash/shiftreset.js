const { SlashCommandBuilder } = require('discord.js');
const { loadShifts, saveShifts } = require('../../utils/shiftUtils');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shiftreset')
        .setDescription('Reset all shift times to 0 and DM the previous data.'),
    
    async execute(interaction) {
        const requiredrole = '1443355818153218200';
        if (!interaction.member.roles.cache.has(requiredrole)) {
            return interaction.reply({ content: '❌ You do not have the required role.', ephemeral: true });
        }

        const shifts = loadShifts();
        
        let dmMessage = '📊 **Shift Data Before Reset**\n\n';
        
        for (const [userId, data] of Object.entries(shifts)) {
            try {
                const user = await interaction.client.users.fetch(userId);
                dmMessage += `${user.tag}: ${formatTime(data.totalTime)}\n`;
            } catch {
                dmMessage += `Unknown User (${userId}): ${formatTime(data.totalTime)}\n`;
            }
        }
        
        saveShifts({});
        
        try {
            await interaction.user.send(dmMessage);
            await interaction.reply({ content: '✅ All shift times have been reset to 0. Check your DMs for the previous data.', ephemeral: true });
        } catch {
            await interaction.reply({ content: '✅ All shift times have been reset to 0. (Could not DM you the data)', ephemeral: true });
        }
    }
};

function formatTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
}