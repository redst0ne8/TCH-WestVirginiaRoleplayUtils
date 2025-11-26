const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { loadShifts } = require('../../utils/shiftUtils');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shiftleaderboard')
        .setDescription('View the shift leaderboard with pagination.')
        .addIntegerOption(option =>
            option.setName('page')
                .setDescription('The page number to view')
                .setRequired(false)
                .setMinValue(1)),
    
    async execute(interaction) {
        const requiredrole = '1440146016392450179';
        if (!interaction.member.roles.cache.has(requiredrole)) {
            return interaction.reply({ content: '❌ You do not have the required role.', ephemeral: true });
        }

        const page = interaction.options.getInteger('page') || 1;
        const shifts = loadShifts();
        
        const sorted = Object.entries(shifts)
            .sort(([, a], [, b]) => b.totalTime - a.totalTime);
        
        const totalPages = Math.ceil(sorted.length / 10);
        const startIdx = (page - 1) * 10;
        const endIdx = startIdx + 10;
        const pageData = sorted.slice(startIdx, endIdx);
        
        const embed = new EmbedBuilder()
            .setTitle('🏆 Shift Leaderboard')
            .setColor(0xFFD700)
            .setFooter({ text: `Page ${page}/${totalPages || 1}` })
            .setTimestamp();
        
        if (pageData.length === 0) {
            embed.setDescription('No shift data available.');
        } else {
            let description = '';
            
            for (let i = 0; i < pageData.length; i++) {
                const [userId, data] = pageData[i];
                const globalRank = startIdx + i + 1;
                let medal = '';
                
                if (globalRank === 1) medal = '🥇';
                else if (globalRank === 2) medal = '🥈';
                else if (globalRank === 3) medal = '🥉';
                else medal = `${globalRank}.`;
                
                try {
                    const user = await interaction.client.users.fetch(userId);
                    description += `${medal} **${user.tag}** - ${formatTime(data.totalTime)}\n`;
                } catch {
                    description += `${medal} **Unknown User** - ${formatTime(data.totalTime)}\n`;
                }
            }
            
            embed.setDescription(description);
        }
        
        await interaction.reply({ embeds: [embed] });
    }
};

function formatTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
}