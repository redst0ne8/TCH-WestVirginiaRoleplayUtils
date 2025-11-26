const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'logaction',
    description: 'Log a moderation action with required user, type, and reason, plus optional evidence.',
    aliases: ["log"],
    minArgs: 3, 
    usage: '{user} {type} {reason} [evidence]',
    
    async execute(message, args) {
        const client = message.client;

        const requiredrole = '1440146016392450179';
        if (!message.member.roles.cache.has(requiredrole)) {
            await message.reply('❌ You do not have the required role.')
            return message.delete();
        }

        if (args.length < 3) {
            return message.channel.send(
                `❌ **Missing arguments!** The correct usage is: \`${message.client.prefix}logaction {user} {type} {reason} [evidence]\``
            );
        }

        const user = args[0];
        const type = args[1];

        let evidence = null;
        let reasonWords = args.slice(2);

        if (args.length >= 4) {
            evidence = args[args.length - 1];
            reasonWords = args.slice(2, args.length - 1);
        }

        const reason = reasonWords.join(' ');

        const logEmbed = new EmbedBuilder()
            .setTitle('Moderation Log')
            .setDescription('A new moderation action has been logged.')
            .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
            .addFields(
                { name: '👤 User', value: user, inline: true },
                { name: '⚖️ Type', value: type.toUpperCase(), inline: true },
                { name: '👮 Moderator', value: message.author.tag, inline: true },
                { name: '📝 Reason', value: reason, inline: false },
                { name: '🔗 Evidence', value: evidence || 'None Provided', inline: false }
            )
            .setColor('#FF6B6B')
            .setTimestamp();

        const channel = message.guild.channels.cache.get('1440146020397744260');

        if (!channel) {
            return message.channel.send('❌ **Error:** Log channel not found!');
        }

        await channel.send({ embeds: [logEmbed] });
        return message.channel.send('✅ **Action logged successfully!**');
    }
}