  const { SlashCommandBuilder } = require("@discordjs/builders");
  const { EmbedBuilder } = require("discord.js"); 

  let afkUsers = new Map(); 
  module.exports = {
    data: new SlashCommandBuilder()
      .setName("afk")
      .setDescription("Pon un mensaje de AFK (Ausente) en tu perfil")
      .addStringOption((option) =>
        option
          .setName("mensaje")
          .setDescription(
            "Mensaje personalizado que otros verán cuando te mencionen"
          )
          .setRequired(false)
      ),
    async execute(client, interaction) {
      
      const user = interaction.user;
      const member = interaction.member;
      const mensaje = interaction.options.getString("mensaje") || "No hay motivo";

      afkUsers[user.id] = {
        mensaje: mensaje, 
        timestamp: Date.now(), 
      };

      const isOwner = interaction.guild.ownerId === user.id;
      if (!isOwner) {
          const nickname = user.globalName || user.username; 
          const newNickname = `[AFK] ${nickname}`; 
    
          try {
            await member.setNickname(newNickname); 
        

          } catch (error) {
            console.error("No se pudo cambiar el apodo:", error);
          }

        }
        const afkEmbed = new EmbedBuilder()
        .setColor("#3D3D3D") // Color del borde del embed
        .setTitle(`${user.globalName} \n**estado AFK**`)
        .setThumbnail(user.displayAvatarURL())
        .setDescription(`**Motivo:** ${mensaje}`)
        .setFooter({ text: "Avisaré cuando te mencionen" });

        await interaction.reply( {embeds: [afkEmbed] })
        
     
    },
  };

  function calcularTiempoAFK(timestamp) {
    const ahora = Date.now();
    const diferencia = ahora - timestamp; // Diferencia en milisegundos

    const segundos = Math.floor(diferencia / 1000);
    const minutos = Math.floor(segundos / 60);
    const horas = Math.floor(minutos / 60);

    if (horas > 0) {
      return `Hace ${horas} hora(s)`;
    } else if (minutos > 0) {
      return `Hace ${minutos} minuto(s)`;
    } else {
      return `Hace ${segundos} segundo(s)`;
    }
  }

  module.exports.afkUsers = afkUsers;
  module.exports.calcularTiempoAFK = calcularTiempoAFK;