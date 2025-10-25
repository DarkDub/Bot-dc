// events/guildMemberAdd.js
const { EmbedBuilder } = require("discord.js"); 

module.exports = (client) => {
    client.on("guildMemberAdd", async (member) => {
        try {
            // 📩 Mensaje privado al usuario
            await member.send({
                embeds: [{
                    color: 0x000000,
                    title: `👋 ¡Bienvenido a ${member.guild.name}!`,
                    description: `Hola **${member.user.globalName}**, gracias por unirte.\n\n Esperamos que disfrutes en la comunidad.`,
                    thumbnail: { url: member.guild.iconURL({ dynamic: true }) },
                    footer: { text: "Bienvenido/a " }
                }]
            });
        } catch (error) {
            console.log(`❌ No se pudo enviar mensaje de bienvenida a ${member.user.tag}`);
        }

        // 🧾 Canal de logs
        const logChannel = member.guild.channels.cache.find(ch => ch.name === "moderator-only");

        if (logChannel) {
            logChannel.send({
                embeds: [{
                    color: 0x000000,
                    title: "🟢 Nuevo miembro en el servidor",
                    fields: [
                        { name: "Usuario", value: `${member.user.globalName}`, inline: true },
                        { name: "ID", value: `${member.user.id}`, inline: true },
                        { name: "Cuenta creada", value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>` }
                    ],
                    thumbnail: { url: member.user.displayAvatarURL({ dynamic: true }) },
                    footer: { text: `Se unió el ${new Date().toLocaleString()}` }
                }]
            });
        } else {
            console.log("⚠️ No se encontró el canal de logs. Crea uno llamado 'logs'.");
        }
    });
};
