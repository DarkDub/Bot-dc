const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unban")
    .setDescription("Desbanea a un usuario del servidor")
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .setDMPermission(false),

  async execute(client, interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
      return interaction.reply({ content: "No tienes permisos para desbanear a usuarios.", ephemeral: true });
    }

    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.BanMembers)) {
      return interaction.reply({ content: "No tengo permisos para desbanear a usuarios.", ephemeral: true });
    }

    const bans = await interaction.guild.bans.fetch();

    if (bans.size === 0) {
      return interaction.reply({ content: "No hay usuarios baneados.", ephemeral: true });
    }

    const banList = bans.map((ban) => `**${ban.user.tag}** (ID: ${ban.user.id})`).join("\n");

    // Crear los botones y dividirlos en filas de máximo 5
    const buttons = [];
    let row = new ActionRowBuilder();

    for (const [index, ban] of bans.entries()) {
      const button = new ButtonBuilder()
        .setCustomId(`unban_${ban.user.id}`)
        .setLabel(`Desbanear ${ban.user.tag}`)
        .setStyle(ButtonStyle.Danger);

      row.addComponents(button);

      // Si ya hay 5 botones en la fila, guardar la fila y crear una nueva
      if (row.components.length === 5) {
        buttons.push(row);
        row = new ActionRowBuilder();
      }
    }

    // Agregar la última fila si no está vacía
    if (row.components.length > 0) buttons.push(row);

    const banListEmbed = new EmbedBuilder()
      .setColor("#000000") // 🔲 Borde negro del embed
      .setTitle("Lista de usuarios baneados")
      .setDescription(banList)
      .setFooter({ text: "Selecciona un usuario para desbanear." });

    await interaction.reply({ embeds: [banListEmbed], components: buttons, ephemeral: true });

    // Crear colector para los botones
    const filter = (i) => i.customId.startsWith("unban_") && i.user.id === interaction.user.id;
    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

    collector.on("collect", async (i) => {
      const userId = i.customId.split("_")[1];
      const userToUnban = bans.find((ban) => ban.user.id === userId);

      if (!userToUnban) {
        return i.reply({ content: "No se encontró al usuario en la lista de baneos.", ephemeral: true });
      }

      try {
        await interaction.guild.members.unban(userToUnban.user);

        const unbanEmbed = new EmbedBuilder()
          .setColor("#00FF00")
          .setTitle("Usuario desbaneado")
          .setDescription(`**Usuario:** ${userToUnban.user.tag}`)
          .setFooter({ text: `Desbaneado por: ${interaction.user.tag}` });

        await i.reply({ embeds: [unbanEmbed] });
      } catch (error) {
        console.error("Error al desbanear:", error);
        await i.reply({ content: "Hubo un error al intentar desbanear al usuario.", ephemeral: true });
      }

      collector.stop();
    });

    collector.on("end", () => {
      interaction.editReply({ components: [] }).catch(() => {});
    });
  },
};
