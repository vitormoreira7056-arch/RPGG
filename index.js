const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
const characterCreation = require('./interactions/characterCreation.js');
const playerPanel = require('./interactions/playerPanel.js');

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

client.on('interactionCreate', async interaction => {
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

    if (interaction.isButton()) {
        switch (interaction.customId) {
            // Cliques da Criação de Personagem
            case 'game_start':
                await characterCreation.handleStart(interaction);
                break;
            case 'char_open_modal_nick':
                await characterCreation.handleOpenNickModal(interaction);
                break;
            case 'char_confirm_creation':
                await characterCreation.handleConfirm(interaction);
                break;
            
            // Cliques do Painel Principal e Mochila
            case 'main_inventory':
                await playerPanel.handleInventory(interaction);
                break;
            case 'main_stats':
                await playerPanel.handleStats(interaction);
                break;
            case 'main_equipment':
                await playerPanel.handleEquipment(interaction);
                break;
            case 'main_back_to_panel':
                await playerPanel.handleBack(interaction);
                break;
            default:
                break;
        }
        return;
    }

    if (interaction.isStringSelectMenu()) {
        if (interaction.customId === 'char_select_class') {
            await characterCreation.handleClassSelect(interaction);
        }
        return;
    }

    if (interaction.isModalSubmit()) {
        if (interaction.customId === 'char_nick_modal') {
            await characterCreation.handleModalSubmit(interaction);
        }
        return;
    }
});

client.login(process.env.DISCORD_TOKEN);
