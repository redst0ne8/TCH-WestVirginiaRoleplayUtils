const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sessionstart')
        .setDescription('Start a session'),
    
    async execute(interaction) {
        const sessionschannelid = '1440146018200195229';
        const channel = interaction.guild.channels.cache.get(sessionschannelid);
        const sessionping = '1442670471047938109';

        const requiredrole = '1443048237316702379';
        if (!interaction.member.roles.cache.has(requiredrole)) {
            return interaction.reply({ content: '❌ You do not have the required role.', ephemeral: true });
        }

        const ssuEmbed = new EmbedBuilder()
            .setTitle('Server Startup')
            .setDescription('The in-game server is now active. Lets make Virginia full!')
            .setAuthor({ name: `Initiated by: ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
            .addFields(
                { name: 'Join Code', value: 'wvsrpc', inline: false }
            )
            .setFooter({ text: 'West Virginia Sessions' })
            .setTimestamp()
            .setColor('#C0B030')
            .setImage('https://cdn.discordapp.com/attachments/1443328384187895919/1443353169571872799/image.png?ex=6928c2e3&is=69277163&hm=f67224320d5796eee07c7b3e9c3d008e63e35b0356b187eef97e8f65226b5b7d&');

        await channel.send({ embeds: [ssuEmbed], content: `<@&${sessionping}>` });
        return interaction.reply({ content: '✅ Session started!', ephemeral: true });
    }
};