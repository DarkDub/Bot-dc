const { SlashCommandBuilder  } = require("discord.js");
const { EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("comando de ping!!"),
        execute(client, message, args) {
            message.reply("solo no te acerques a mi <@&1340186968033595433>!!");
          },
}
