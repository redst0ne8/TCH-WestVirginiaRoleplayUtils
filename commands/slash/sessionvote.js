const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sessionvote')
        .setDescription('Vote to start a session'),
    
    async execute(interaction) {
        const sessionschannelid = '1440146018200195229';
        const channel = interaction.guild.channels.cache.get(sessionschannelid);
        const sessionping = '1442670471047938109';

        const requiredrole = '1443048237316702379';
        if (!interaction.member.roles.cache.has(requiredrole)) {
            return interaction.reply({ content: '❌ You do not have the required role.', ephemeral: true });
        }

        const svoteEmbed = new EmbedBuilder()
            .setTitle('Server Startup Vote')
            .setDescription(`${interaction.user.tag} would like to get a session going. Please vote below by reacting to the message with the ✅!`)
            .setAuthor({ name: `Initiated by: ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
            .setFooter({ text: 'West Virginia Sessions' })
            .addFields(
                { name: 'Votes Required', value: 'We need 6 Votes to start a session! Vote up!'}
            )
            .setTimestamp()
            .setColor('#C0B030')
            .setImage('https://cdn.discordapp.com/attachments/1443328384187895919/1443353169571872799/image.png?ex=6928c2e3&is=69277163&hm=f67224320d5796eee07c7b3e9c3d008e63e35b0356b187eef97e8f65226b5b7d&');

        const sentmessage = await channel.send({ embeds: [svoteEmbed], content: `<@&${sessionping}>` });
        await sentmessage.react('✅');
        
        return interaction.reply({ content: '✅ Session vote started!', ephemeral: true });
    }
};