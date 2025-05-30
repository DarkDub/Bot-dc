const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName("editembed")
    .setDescription("Edita un embed enviado previamente")
    .addStringOption(option =>
      option.setName("titulo").setDescription("Nuevo título del embed").setRequired(false)
    )
    .addStringOption(option =>
      option.setName("descripcion").setDescription("Nueva descripción del embed").setRequired(false)
    )
    .addStringOption(option =>
      option.setName("color").setDescription("Nuevo color del embed en hexadecimal (#FF5733)").setRequired(false)
    ),

  async execute(client, interaction) {
    const messageId = client.embedMessages.get(interaction.user.id);
    if (!messageId) {
      return interaction.reply({ content: "No tienes un embed para editar.", ephemeral: true });
    }

    try {
      const message = await interaction.channel.messages.fetch(messageId);
      if (!message) {
        return interaction.reply({ content: "No se encontró el embed.", ephemeral: true });
      }

      const embed = EmbedBuilder.from(message.embeds[0]); 

      const nuevoTitulo = interaction.options.getString("titulo");
      const nuevaDescripcion = interaction.options.getString("descripcion");
      const nuevoColor = interaction.options.getString("color");

      if (nuevoTitulo) embed.setTitle(nuevoTitulo);
      if (nuevaDescripcion) embed.setDescription(nuevaDescripcion);
      if (nuevoColor && /^#([A-Fa-f0-9]{6})$/.test(nuevoColor)) embed.setColor(nuevoColor);

      await message.edit({ embeds: [embed] });
      await interaction.reply({ content: "Embed actualizado correctamente.", ephemeral: true });

    } catch (error) {
      console.error(error);
      return interaction.reply({ content: "Error al editar el embed.", ephemeral: true });
    }
  }
};
