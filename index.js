const { Client, Collection, ActivityType } = require("discord.js");
const { loadSlash } = require("./handlers/slashHandler.js");
const { afkUsers, calcularTiempoAFK } = require("./commands/all/Generales/Afk.js");
const fs = require("fs");
const dotenv = require("dotenv");
const express = require("express");

dotenv.config(); // Cargar variables del .env

// Crear cliente de Discord
const client = new Client({ intents: 53608447 });
// Cargar eventos
require("./events/guildMemberAdd")(client);

// Colecciones del bot
client.prefixCommands = new Collection();
client.slashCommands = new Collection();
client.embedMessages = new Map();

// Cargar prefijo desde .env
const prefix = process.env.PREFIX || "-";

// Cargar comandos con prefijo
const commandFiles = fs.readdirSync("./commands/").filter(file => file.endsWith(".js"));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.prefixCommands.set(command.name, command);
}

// Eventos de mensajes
client.on("messageCreate", async (message) => {
    if (message.author.bot) return;

    // Comandos con prefijo
    if (message.content.startsWith(prefix)) {
        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();
        const command = client.prefixCommands.get(commandName);

        if (command) {
            try {
                await command.execute(client, message, args);
            } catch (err) {
                console.error(err);
                message.reply("Hubo un error al ejecutar el comando.");
            }
        }
    }

    // Mensaje especial de alianzas
    if (message.channel.id === "1348371494870319134" && message.content.toLowerCase().includes("alianza")) {
        const rol = message.guild.roles.cache.get("1348029460200558753");
        message.channel.send(rol ? `¡${rol}! Se ha solicitado una alianza.` : "¡Se ha solicitado una alianza!");
    }

    // AFK: desactivar si el usuario habla
    if (afkUsers[message.author.id]) {
        const tiempoAFK = calcularTiempoAFK(afkUsers[message.author.id].timestamp);
        delete afkUsers[message.author.id];

        if (message.guild.ownerId !== message.author.id) {
            try {
                const member = message.member;
                const originalNickname = member.nickname || message.author.username;
                await member.setNickname(originalNickname.replace("[AFK] ", ""));
            } catch (error) {
                console.error("No se pudo restaurar el apodo:", error);
            }
        }

        message.reply(`Tu estado AFK ha sido desactivado. Estuviste AFK: **${tiempoAFK}**.`);
    }

    // Avisar si el usuario responde a alguien AFK
    if (message.reference) {
        const repliedMessage = await message.channel.messages.fetch(message.reference.messageId);
        if (afkUsers[repliedMessage.author.id]) {
            message.reply(`${repliedMessage.author.globalName} está AFK.\n**Motivo:** ${afkUsers[repliedMessage.author.id].mensaje}\n**Tiempo AFK:** ${calcularTiempoAFK(afkUsers[repliedMessage.author.id].timestamp)}`);
        }
    }

    // Avisar si se menciona a alguien AFK
    message.mentions.users.forEach((mentionedUser) => {
        if (afkUsers[mentionedUser.id]) {
            message.reply(`${mentionedUser.globalName} está AFK.\n**Motivo:** ${afkUsers[mentionedUser.id].mensaje}\n**Tiempo AFK:** ${calcularTiempoAFK(afkUsers[mentionedUser.id].timestamp)}`);
        }
    });
});

// Eventos de interacción (Slash Commands)
client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand()) return;

    const cmd = client.slashCommands.get(interaction.commandName);
    if (!cmd) return;

    try {
        await cmd.execute(client, interaction);
    } catch (error) {
        console.error(error);
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({ content: "Hubo un error al ejecutar este comando.", flags: 64 });
        }
    }
});

// Iniciar sesión con el token
(async () => {
    await client.login(process.env.TOKEN).catch((err) => console.error(`Error al iniciar => ${err}`));
})();

// Cuando el bot esté listo
client.on("ready", async () => {
    await loadSlash(client)
        .then(() => console.log("Comandos cargados con éxito"))
        .catch((err) => console.error(`Error al cargar comandos => ${err}`));

    console.log(`✅ Bot encendido como: ${client.user.tag}`);
    client.user.setActivity("Coding", { type: ActivityType.Playing });
});

// Servidor web (Render)
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => res.send("Bot online ✅"));
app.listen(PORT, () => console.log(`Servidor web activo en el puerto ${PORT}`));
