const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName("embed")
    .setDescription("Crea un embed personalizado")
    .addStringOption(option =>
      option.setName("titulo").setDescription("El título del embed").setRequired(true)
    )
    .addStringOption(option =>
      option.setName("descripcion").setDescription("La descripción del embed").setRequired(false)
    )
    .addStringOption(option =>
      option.setName("color").setDescription("El color del embed en formato hexadecimal (ejemplo: #FF5733)").setRequired(false)
    )
    .addStringOption(option =>
      option.setName("autor").setDescription("El autor del embed").setRequired(false)
    )
    .addStringOption(option =>
      option.setName("pie").setDescription("El pie de página (footer) del embed").setRequired(false)
    ),

  async execute(client, interaction) {
    await interaction.deferReply({ flags: 64 });

    const titulo = interaction.options.getString("titulo");
    const descripcion = interaction.options.getString("descripcion") || "No se ha proporcionado una descripción.";
    const color = interaction.options.getString("color") || "#3D3D3D";
    const autor = interaction.options.getString("autor");
    const pie = interaction.options.getString("pie");

    const regexHex = /^#([A-Fa-f0-9]{6})$/;
    const colorValido = regexHex.test(color) ? color : "#3D3D3D";

    const embed = new EmbedBuilder()
      .setTitle(titulo)
      .setDescription(descripcion)
      .setColor(colorValido)
      .setFooter({ text: pie || "Sin pie de página" })
      .setTimestamp();

    if (autor) {
      embed.setAuthor({ name: autor });
    }

    const message = await interaction.channel.send({ embeds: [embed] });

    client.embedMessages.set(interaction.user.id, message.id);
    await interaction.editReply({ content: "✅ Embed enviado correctamente.", flags: 64 });

  }
};
