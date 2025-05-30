const { Collection } = require("discord.js");
const { readdirSync } = require("node:fs");

module.exports = {
    async loadSlash(client) {
        client.slashCommands = new Collection(); 

        let loadedCommands = 0; 
        for (const category of readdirSync("./commands")) {
            for (const otherCategory of readdirSync(`./commands/${category}`)) {
                for (const fileName of readdirSync(`./commands/${category}/${otherCategory}`)
                    .filter((file) => file.endsWith(".js"))) {
                    
                    const command = require(`../commands/${category}/${otherCategory}/${fileName}`);

                    if (!command.data || !command.data.name) {
                        console.error(`❌ Error en ${fileName}: Falta 'data.name' en el comando.`);
                        continue;
                    }

                    client.slashCommands.set(command.data.name, command);
                    loadedCommands++;
                }
            }
        }

        await client.application?.commands.set([...client.slashCommands.values()].map(cmd => cmd.data));

        console.log(`✅ Comandos cargados: ${loadedCommands}`); // Mostrar cuántos comandos fueron cargados correctamente
    }
};

