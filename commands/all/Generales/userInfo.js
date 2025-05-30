const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Muestra información sobre un usuario del servidor')
        .addUserOption(option => 
            option.setName('usuario')
                .setDescription('El usuario del que quieres ver la información')
                .setRequired(false)
        ),
    async execute(client, interaction) {
        const user = interaction.options.getUser('usuario') || interaction.user;
        const member = interaction.guild.members.cache.get(user.id);

        const embed = new EmbedBuilder()
            .setColor('#3D3D3D')
            .setTitle(`Información de ${user.username}`)
            .setThumbnail(user.displayAvatarURL())
            .addFields(
                { name: 'ID del usuario', value: user.id, inline: true },
                { name: 'Fecha de creación', value: user.createdAt.toDateString(), inline: true },
                { name: 'Fecha de ingreso al servidor', value: member.joinedAt.toDateString(), inline: true },
                { name: 'Roles', value: member.roles.cache.map(role => role.name).join(', ') || 'Sin roles', inline: true }
            )
            .setFooter({ text: 'Bot The Zone', iconURL: interaction.guild.iconURL({ dynamic: true }) });

        await interaction.reply({ embeds: [embed] });
    }
};
