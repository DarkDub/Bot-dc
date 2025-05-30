const { Events } = require("discord.js");
const { afkUsers } = require("../commands/all/Generales/Afk");
const { config } = require("../config.json")

module.exports = {
    name: Events.MessageCreate, 
    async execute(message) {
        if (message.author.bot) return;

        if (afkUsers.has(message.author.id)) {
            afkUsers.delete(message.author.id);
            message.reply("✅ Ya no estás AFK.");
        }

        message.mentions.users.forEach(user => {
            if (afkUsers.has(user.id)) {
                const afkInfo = afkUsers.get(user.id);
                message.reply(`🚀 ${user.username} está AFK: **${afkInfo.razon}\nPara que lo quieres?** `);
            }
        });

    }

    
};

