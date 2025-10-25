const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");

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
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .setDMPermission(false),

  async execute(client, interaction) {
    const user = interaction.options.getUser("usuario");
    const razón = interaction.options.getString("razón") || "No se proporcionó una razón";

    // DeferReply le dice a Discord que espere
    await interaction.deferReply({ flags: 64 }); // respuesta efímera, el usuario la verá pero no los demás

    try {
      // Verificar permisos del usuario
      if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
        return await interaction.editReply({
          content: "No tienes permisos para banear a usuarios.",
        });
      }

      // Verificar permisos del bot
      if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.BanMembers)) {
        return await interaction.editReply({
          content: "No tengo permisos para banear a usuarios.",
        });
      }

      // Intentar banear
      await interaction.guild.members.ban(user, { reason: razón });

      // Crear el embed
      const banEmbed = new EmbedBuilder()
        .setColor("#000000") // negro como pediste
        .setTitle("Usuario baneado")
        .setThumbnail(user.displayAvatarURL())
        .setDescription(`**Usuario:** ${user.globalName || user.username}\n**Razón:** ${razón}`)
        .setFooter({ text: `Baneado por: ${interaction.user.globalName || interaction.user.username}` });

      // Enviar el resultado
      await interaction.editReply({ embeds: [banEmbed] });
    } catch (error) {
      console.error("Error al banear al usuario:", error);

      // Si ocurre un error
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply({
          content: "Hubo un error al intentar banear al usuario.",
        });
      } else {
        await interaction.reply({
          content: " Hubo un error al intentar banear al usuario.",
          flags: 64,
        });
      }
    }
  },
};
