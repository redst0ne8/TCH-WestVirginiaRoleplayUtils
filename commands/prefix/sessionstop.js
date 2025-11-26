const { EmbedBuilder } = require('discord.js');
require('dotenv').config();

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = {
    // This is the command name that follows your prefix (e.g., !sessionstop)
    name: 'sessionstop',
    description: 'Stop a session by announcing and then kicking all players.',
    aliases: ['ssd'],
    
    // Prefix commands use the 'message' object instead of 'interaction'
    async execute(message) {
        const sessionschannelid = '1440146018200195229';
        const requiredrole = '1443048237316702379';
        const messageIdThreshold = '1443074738909089852';

        // Initial reply: message.reply() is used instead of interaction.reply()
        const statusMessage = await message.reply('⏳ Handling Shutdown...');

        // Role Check: Uses message.member instead of interaction.member
        if (!message.member.roles.cache.has(requiredrole)) {
            return statusMessage.edit('❌ You do not have the required role to stop a session.');
        }

        // Channel fetch: Uses message.guild.channels.cache
        const channel = message.guild.channels.cache.get(sessionschannelid);
        if (!channel) {
            return statusMessage.edit('❌ Sessions channel not found. Check the ID.');
        }

        // Message Deletion Logic
        try {
            const messages = await channel.messages.fetch({ limit: 100 });
            const messagesToDelete = messages.filter(msg => msg.id > messageIdThreshold);
            
            if (messagesToDelete.size > 0) {
                await channel.bulkDelete(messagesToDelete, true);
            }
        } catch (error) {
            console.error('Error deleting messages:', error);
        }

        // Send Shutdown Embed
        const ssdEmbed = new EmbedBuilder()
            .setTitle('Server Shutdown')
            .setDescription('The in-game server is now shutdown. Please do not join. Thank you for playing in the previous session!')
            .setAuthor({ name: `Initiated by: ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
            .setFooter({ text: 'West Virginia Sessions' })
            .setTimestamp()
            .setColor('#C0B030')
            .setImage('https://cdn.discordapp.com/attachments/1443328384187895919/1443353169571872799/image.png?ex=6928c2e3&is=69277163&hm=f67224320d5796eee07c7b3e9c3d008e63e35b0356b187eef97e8f65226b5b7d&');
        
        await channel.send({ embeds: [ssdEmbed] });

        // Phase 1: Announce Shutdown
        try {
            const announce_command = ":m Thank you for joining this session. Shutdown has been announced and you will be kicked in 10 seconds.";
            
            const responseAnnounce = await fetch('https://api.policeroleplay.community/v1/server/command', {
                method: 'POST',
                headers: {
                    "server-key": process.env.ERLC_API_KEY,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "command": announce_command
                })
            });

            if (!responseAnnounce.ok) {
                let errorDetails = `Announce Status: ${responseAnnounce.status} ${responseAnnounce.statusText}`;
                try {
                    const data = await responseAnnounce.json();
                    errorDetails += ` - Details: ${JSON.stringify(data)}`;
                } catch (e) {}

                console.error('API Error during announcement:', errorDetails);
            }
            
        } catch (error) {
            console.error('Network Error during announcement API call:', error);
        }

        // Delay for 10 seconds
        await delay(10000);

        // Phase 2: Kick All Players
        try {
            const kick_command = ":kick all";

            const responseKick = await fetch('https://api.policeroleplay.community/v1/server/command', {
                method: 'POST',
                headers: {
                    "server-key": process.env.ERLC_API_KEY,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "command": kick_command
                })
            });

            if (responseKick.ok) {
                // Update the original status message
                return statusMessage.edit('✅ Session stopped! Announcement sent and players kicked after 10 seconds.');
            } else {
                let errorDetails = `Kick Status: ${responseKick.status} ${responseKick.statusText}`;
                try {
                    const data = await responseKick.json();
                    errorDetails += ` - Details: ${JSON.stringify(data)}`;
                } catch (e) {}

                console.error('API Error during kick:', errorDetails);
                return statusMessage.edit(`⚠️ Kick command failed via API: **${errorDetails}**. Check your API key.`);
            }
        } catch (error) {
            console.error('Network Error during kick API call:', error);
            return statusMessage.edit('❌ A network error occurred while sending the kick command.');
        }
    }
};