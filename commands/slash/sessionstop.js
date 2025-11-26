const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sessionstop')
        .setDescription('Stop a session'),
    
    async execute(interaction) {
        const sessionschannelid = '1440146018200195229';
        const channel = interaction.guild.channels.cache.get(sessionschannelid);
        const messageIdThreshold = '1443074738909089852';

        const requiredrole = '1443048237316702379';
        if (!interaction.member.roles.cache.has(requiredrole)) {
            return interaction.reply({ content: '❌ You do not have the required role.', ephemeral: true });
        }

        // Fetch and delete messages newer than the threshold
        try {
            const messages = await channel.messages.fetch({ limit: 100 });
            const messagesToDelete = messages.filter(msg => msg.id > messageIdThreshold);
            
            if (messagesToDelete.size > 0) {
                await channel.bulkDelete(messagesToDelete, true);
            }
        } catch (error) {
            console.error('Error deleting messages:', error);
        }

        const ssdEmbed = new EmbedBuilder()
            .setTitle('Server Shutdown')
            .setDescription('The in-game server is now shutdown. Please do not join. Thank you for playing in the previous session!')
            .setAuthor({ name: `Initiated by: ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
            .setFooter({ text: 'West Virginia Sessions' })
            .setTimestamp()
            .setColor('#C0B030')
            .setImage('https://cdn.discordapp.com/attachments/1443328384187895919/1443353169571872799/image.png?ex=6928c2e3&is=69277163&hm=f67224320d5796eee07c7b3e9c3d008e63e35b0356b187eef97e8f65226b5b7d&');
        
        await channel.send({ embeds: [ssdEmbed] });
        return interaction.reply({ content: '✅ Session stopped!', ephemeral: true });
    }
};