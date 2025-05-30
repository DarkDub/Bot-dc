const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Banea a un usuario del servidor")
    .addUserOption((option) =>
      option
        .setName("usuario")
        .setDescription("El usuario que quieres banear")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("razón")
        .setDescription("La razón del baneo")
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers) // Solo usuarios con permiso para banear pueden usar este comando
    .setDMPermission(false), // No permitir el uso del comando en mensajes directos
  async execute(client, interaction) {
    const user = interaction.options.getUser("usuario"); // Obtener el usuario a banear
    const razón = interaction.options.getString("razón") || "No se proporcionó una razón"; // Obtener la razón o usar una por defecto

    // Verificar si el usuario tiene permisos para banear
    if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
      return interaction.reply({
        content: "No tienes permisos para banear a usuarios.",
        flags: 64,

      });
    }

    // Verificar si el bot tiene permisos para banear
    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.BanMembers)) {
      return interaction.reply({
        content: "No tengo permisos para banear a usuarios.",
        flags: 64,

      });
    }

    // Intentar banear al usuario
    try {
      await interaction.guild.members.ban(user, { reason: razón }); // Banear al usuario con la razón proporcionada

      // Crear un embed para la respuesta
      const banEmbed = new EmbedBuilder()
        .setColor("#3D3D3D") // Color rojo para el embed
        .setTitle("✅ Usuario baneado")
        .setThumbnail(user.displayAvatarURL())
        .setDescription(`**Usuario:** ${user.globalName}\n**Razón:** ${razón}`)
        .setFooter({ text: `Baneado por: ${interaction.user.globalName}` });

      // Responder con el embed
      await interaction.reply({ embeds: [banEmbed] });
    } catch (error) {
      console.error("Error al banear al usuario:", error);
      await interaction.reply({
        content: "Hubo un error al intentar banear al usuario.",
        flags: 64,
      });
    }
  },
};