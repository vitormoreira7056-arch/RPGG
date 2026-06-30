
```javascript:index.js
const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
const characterCreation = require('./interactions/characterCreation.js');

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
        const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands },
        );
        console.log('Comandos (/ slash commands) registrados com sucesso no Discord.');
    } catch (error) {
        console.error('Erro ao registrar comandos:', error);
    }
});

// Centralizador de Interações Modernas (Botões, Menus e Modais)
client.on('interactionCreate', async interaction => {
    // 1. Slash Commands (/instalar)
    if (interaction.isChatInputCommand()) {
        const command = interaction.client.commands.get(interaction.commandName);
        if (!command) return;
        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            const errMsg = { content: 'Houve um erro ao executar este comando!', ephemeral: true };
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(errMsg);
            } else {
                await interaction.reply(errMsg);
            }
        }
        return;
    }

    // 2. Interações de Botões (Button)
    if (interaction.isButton()) {
        switch (interaction.customId) {
            case 'game_start':
                await characterCreation.handleStart(interaction);
                break;
            case 'char_open_modal_nick':
                await characterCreation.handleOpenNickModal(interaction);
                break;
            case 'char_confirm_creation':
                await characterCreation.handleConfirm(interaction);
                break;
            default:
                break;
        }
        return;
    }

    // 3. Interações de Menus de Seleção (StringSelectMenu)
    if (interaction.isStringSelectMenu()) {
        if (interaction.customId === 'char_select_race') {
            await characterCreation.handleRaceSelect(interaction);
        }
        return;
    }

    // 4. Envio de Formulários (ModalSubmit)
    if (interaction.isModalSubmit()) {
        if (interaction.customId === 'char_nick_modal') {
            await characterCreation.handleModalSubmit(interaction);
        }
        return;
    }
});

client.login(process.env.DISCORD_TOKEN);
