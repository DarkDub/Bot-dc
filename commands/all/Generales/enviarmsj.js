const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('enviarmsj')
    .setDescription('Envía un embed por DM a un usuario con un mensaje personalizado')
    .addUserOption(option =>
      option.setName('usuario')
        .setDescription('El usuario al que quieres enviarle el mensaje')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('mensaje')
        .setDescription('El mensaje personalizado que quieres enviar')
        .setRequired(true)
    ),
  async execute(client, interaction) {
    const usuario = interaction.options.getUser('usuario');
    const mensajePersonalizado = interaction.options.getString('mensaje');

    const embed = new EmbedBuilder()
      .setTitle('📨 ¡Tienes un mensaje!')
      .setDescription(mensajePersonalizado) // Aquí se usa el mensaje personalizado
      .setColor(0x00bfff);

    const button = new ButtonBuilder()
      .setCustomId('enlace_personal')
      .setLabel('adjunto un gif')
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(button);

    try {
      const mensaje = await usuario.send({ embeds: [embed], components: [row] });
      await interaction.reply({ content: `✅ El mensaje fue enviado a ${usuario.tag} por DM.`, flags: 64 });

      // Recolectamos la interacción del botón
      const collector = mensaje.createMessageComponentCollector({ time: 60000 });

      collector.on('collect', async (btnInteraction) => {
        if (btnInteraction.customId === 'enlace_personal') {
          try {
            await btnInteraction.reply({
              content: '🔗 gif: https://screenshot.best/YKRYQO.gif',
              flags: 64
            });
          } catch (err) {
            console.error("Error al enviar el enlace:", err);
          }
        }
      });

    } catch (error) {
      console.error('❌ Error al enviar el DM:', error);
      await interaction.reply({ content: '❌ No pude enviarle un DM al usuario. Puede que tenga los DMs cerrados.', flags: 64 });
    }
  }
};
