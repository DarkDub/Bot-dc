const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("purge")
    .setDescription("Elimina una cantidad específica de mensajes en el canal.")
    .addIntegerOption((option) =>
      option
        .setName("cantidad")
        .setDescription("Número de mensajes a eliminar (máximo 100)")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages), // Permiso necesario
  async execute(client, interaction) {
    const cantidad = interaction.options.getInteger("cantidad");

    if (cantidad < 1 || cantidad > 100) {
      return interaction.reply({
        content: "Debes ingresar un número entre **1 y 100**.",
        flags: 64,

      });
    }

    // Intentamos eliminar los mensajes
    try {
      const fetched = await interaction.channel.bulkDelete(cantidad, true);
      interaction.reply({
        content: `🗑️ Se eliminaron **${fetched.size}** mensajes.`,
        flags: 64,

      });
    } catch (error) {
      console.error("Error al eliminar mensajes:", error);
      interaction.reply({
        content: "❌ No pude eliminar los mensajes. Verifica mis permisos.",
        flags: 64,
      });
    }
  },
};
