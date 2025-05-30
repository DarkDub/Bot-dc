const { SlashCommandBuilder } = require("@discordjs/builders");
const fs = require("fs").promises;
const path = require("path");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setprefix")
    .setDescription("Cambia el prefijo del bot")
    .addStringOption((option) =>
      option
        .setName("prefijo")
        .setDescription("El nuevo prefijo")
        .setRequired(true)
    ),
  async execute(client, interaction) {
    // Verificar si el comando se ejecutó en un servidor
    if (!interaction.guild) {
      return interaction.reply({
        content: "❌ Este comando solo puede usarse en un servidor.",
        ephemeral: true,
      });
    }

    // Obtener el miembro (si interaction.member es undefined)
    const member = interaction.member || await interaction.guild.members.fetch(interaction.user.id);

    // Verificar permisos de administrador
    if (!member.permissions.has("ADMINISTRATOR")) {
      return interaction.reply({
        content: "❌ No tienes permisos para cambiar el prefijo.",
        ephemeral: true,
      });
    }

    const newPrefix = interaction.options.getString("prefijo");

    // Ruta al archivo config.json
    const configPath = path.join(__dirname, "..", "..", "..", "config.json");
    try {
      // Leer el archivo config.json
      const config = require(configPath);

      // Actualizar el prefijo
      config.prefix = newPrefix;

      // Guardar el archivo config.json
      await fs.writeFile(configPath, JSON.stringify(config, null, 2)); // Guardar con formato

      // Responder con el nuevo prefijo
      await interaction.reply(`✅ Prefijo actualizado a: \`${newPrefix}\``);
    } catch (error) {
      console.error("Error al cambiar el prefijo:", error);
      await interaction.reply({
        content: "❌ Hubo un error al cambiar el prefijo.",
        ephemeral: true,
      });
    }
  },
};