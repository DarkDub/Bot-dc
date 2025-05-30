const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unban")
    .setDescription("Desbanea a un usuario del servidor")
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers) // Solo usuarios con permiso para banear pueden usar este comando
    .setDMPermission(false), // No permitir el uso del comando en mensajes directos
  async execute(client, interaction) {
    // Verificar si el usuario tiene permisos para desbanear
    if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
      return interaction.reply({
        content: "No tienes permisos para desbanear a usuarios.",
        flags: 64, // Mensaje efímero
      });
    }

    // Verificar si el bot tiene permisos para desbanear
    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.BanMembers)) {
      return interaction.reply({
        content: "No tengo permisos para desbanear a usuarios.",
        flags: 64, // Mensaje efímero
      });
    }

    const bans = await interaction.guild.bans.fetch();

    if (bans.size === 0) {
      return interaction.reply({
        content: "No hay usuarios baneados.",
        flags: 64, 
      });
    }

    const banList = bans.map((ban) => `**${ban.user.tag}** (ID: ${ban.user.id})`).join("\n");

    const row = new ActionRowBuilder().addComponents(
      bans.map((ban, index) =>
        new ButtonBuilder()
          .setCustomId(`unban_${ban.user.id}`) // ID único para cada botón
          .setLabel(`Desbanear ${ban.user.tag}`)
          .setStyle(ButtonStyle.Danger)
      )
    );

    // Crear un embed para mostrar la lista de baneados
    const banListEmbed = new EmbedBuilder()
      .setColor("#131010") // Color naranja para el embed
      .setTitle("📜 Lista de usuarios baneados")
      .setDescription(banList)
      .setFooter({ text: "Selecciona un usuario para desbanear." });

    // Responder con el embed y los botones
    await interaction.reply({ embeds: [banListEmbed], components: [row], flags: 64 });

    // Crear un colector de interacciones para manejar los botones
    const filter = (i) => i.customId.startsWith("unban_") && i.user.id === interaction.user.id;
    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 }); // 60 segundos

    collector.on("collect", async (i) => {
      const userId = i.customId.split("_")[1]; // Obtener el ID del usuario a desbanear
      const userToUnban = bans.find((ban) => ban.user.id === userId);

      if (!userToUnban) {
        return i.reply({
          content: "No se encontró al usuario en la lista de baneos.",
          flags: 64, // Mensaje efímero
        });
      }

      // Desbanear al usuario
      try {
        await interaction.guild.members.unban(userToUnban.user);

        // Crear un embed para la respuesta
        const unbanEmbed = new EmbedBuilder()
          .setColor("#00FF00") // Color verde para el embed
          .setTitle("✅ Usuario desbaneado")
          .setDescription(`**Usuario:** ${userToUnban.user.tag}`)
          .setFooter({ text: `Desbaneado por: ${interaction.user.tag}` });

        // Responder con el embed
        await i.reply({ embeds: [unbanEmbed] });
      } catch (error) {
        console.error("Error al desbanear al usuario:", error);
        await i.reply({
          content: "Hubo un error al intentar desbanear al usuario.",
          flags: 64, // Mensaje efímero
        });
      }

      // Detener el colector
      collector.stop();
    });

    collector.on("end", () => {
      // Eliminar los botones después de que el colector termine
      interaction.editReply({ components: [] }).catch(console.error);
    });
  },
};