const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

const token = process.env.DISCORD_TOKEN;
if (!token) {
    console.error('ERRO: A variável de ambiente DISCORD_TOKEN não está definida.');
    process.exit(1);
}

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages
    ] 
});

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');

if (!fs.existsSync(commandsPath)) {
    fs.mkdirSync(commandsPath);
}

const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
const commands = [];

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
        commands.push(command.data.toJSON());
    }
}

client.once('ready', async () => {
    console.log(`Bot logado como ${client.user.tag}`);
    try {
        const rest = new REST({ version: '10' }).setToken(token);
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands },
        );
        console.log('Comandos slash registrados com sucesso.');
    } catch (error) {
        console.error('Erro ao registrar comandos:', error);
    }
});

client.on('interactionCreate', async interaction => {
    if (interaction.isChatInputCommand()) {
        const command = interaction.client.commands.get(interaction.commandName);
        if (!command) return;

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(`Erro no comando /${interaction.commandName}:`, error);
            const reply = { content: 'Houve um erro ao executar este comando!', ephemeral: true };
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(reply);
            } else {
                await interaction.reply(reply);
            }
        }
        return;
    }

    if (interaction.isButton()) {
        const { customId } = interaction;
        console.log(`Botão clicado: ${customId} por ${interaction.user.tag}`);

        try {
            if (customId === 'game_start') {
                await interaction.reply({
                    content: '🛡️ **Bem-vindo, aventureiro!**\nUse `/criar-personagem` para começar sua jornada.',
                    ephemeral: true
                });

            } else if (customId === 'game_profile') {
                await interaction.reply({
                    content: '🎒 **Perfil / Inventário**\nFuncionalidade em desenvolvimento.',
                    ephemeral: true
                });

            } else if (customId === 'game_market') {
                await interaction.reply({
                    content: '⚖️ **Mercado Geral**\nFuncionalidade em desenvolvimento.',
                    ephemeral: true
                });

            } else {
                console.warn(`Botão não reconhecido: ${customId}`);
                await interaction.reply({
                    content: '❓ Ação não reconhecida.',
                    ephemeral: true
                });
            }
        } catch (error) {
            console.error(`Erro ao processar botão ${customId}:`, error);
        }
        return;
    }
});

client.login(token);
