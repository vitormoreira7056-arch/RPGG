const { 
    EmbedBuilder, 
    ActionRowBuilder, 
    StringSelectMenuBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    ModalBuilder, 
    TextInputBuilder, 
    TextInputStyle 
} = require('discord.js');
const races = require('../data/races.js');

// Cache temporário em memória para salvar as seleções antes de salvar no banco de dados.
// Estrutura: userId -> { race: string|null, nickname: string }
const creationCache = new Map();

/**
 * Retorna os componentes e o embed do painel de criação baseados no estado atual do cache.
 */
function getCreationPanel(userId, username) {
    if (!creationCache.has(userId)) {
        creationCache.set(userId, { race: null, nickname: username });
    }

    const data = creationCache.get(userId);
    const raceDetails = data.race ? races[data.race] : null;

    const embed = new EmbedBuilder()
        .setTitle('🛡️ Criação de Personagem — Além do Destino')
        .setDescription(
            `Bem-vindo ao criador de personagens! Personalize a sua identidade antes de adentrar as terras esquecidas.\n\n` +
            `**👤 Nome/Apelido:** \`${data.nickname}\`\n` +
            `**🧬 Raça Selecionada:** ${data.race ? `**${raceDetails.name}**` : '`Nenhuma (Selecione abaixo)`'}\n\n` +
            (raceDetails ? `*Descrição da Raça:* ${raceDetails.description}\n` +
            `*Atributos Iniciais:* ❤️ HP: \`${raceDetails.baseStats.hp}\` | 🔮 Mana: \`${raceDetails.baseStats.mana}\` | ⚡ Stamina: \`${raceDetails.baseStats.stamina}\`` : '*Selecione uma raça no menu abaixo para ver os seus detalhes.*')
        )
        .setColor(data.race ? '#2ecc71' : '#f1c40f')
        .setThumbnail(raceDetails ? 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200' : null);

    // Menu de Seleção de Raças
    const selectOptions = Object.keys(races).map(key => ({
        label: races[key].name,
        value: key,
        description: races[key].description.slice(0, 100) + '...',
        emoji: '🧬'
    }));

    const selectRow = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId('char_select_race')
            .setPlaceholder('Escolha a sua Raça...')
            .addOptions(selectOptions)
    );

    // Botões de Ação
    const buttonRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('char_open_modal_nick')
            .setLabel('Alterar Apelido')
            .setEmoji('✏️')
            .setStyle(ButtonStyle.Primary),

        new ButtonBuilder()
            .setCustomId('char_confirm_creation')
            .setLabel('Confirmar Personagem')
            .setEmoji('✅')
            .setStyle(ButtonStyle.Success)
            .setDisabled(!data.race) // Desabilitado até escolher uma raça
    );

    return { embeds: [embed], components: [selectRow, buttonRow], ephemeral: true };
}

module.exports = {
    creationCache,
    getCreationPanel,

    // Executa quando o jogador clica em "Começar Jornada"
    async handleStart(interaction) {
        const panel = getCreationPanel(interaction.user.id, interaction.user.username);
        await interaction.reply(panel);
    },

    // Executa quando o jogador seleciona uma raça no menu
    async handleRaceSelect(interaction) {
        const userId = interaction.user.id;
        const selectedRace = interaction.values[0];

        if (!creationCache.has(userId)) {
            creationCache.set(userId, { race: null, nickname: interaction.user.username });
        }

        const data = creationCache.get(userId);
        data.race = selectedRace;
        creationCache.set(userId, data);

        const panel = getCreationPanel(userId, interaction.user.username);
        await interaction.update(panel);
    },

    // Executa quando o jogador clica em "Alterar Apelido" (Abre o Modal)
    async handleOpenNickModal(interaction) {
        const userId = interaction.user.id;
        const currentData = creationCache.get(userId) || { nickname: interaction.user.username };

        const modal = new ModalBuilder()
            .setCustomId('char_nick_modal')
            .setTitle('Defina seu Apelido');

        const nickInput = new TextInputBuilder()
            .setCustomId('char_nick_input')
            .setLabel('Qual será o nome do seu guerreiro?')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMinLength(3)
            .setMaxLength(16)
            .setValue(currentData.nickname);

        const firstActionRow = new ActionRowBuilder().addComponents(nickInput);
        modal.addComponents(firstActionRow);

        await interaction.showModal(modal);
    },

    // Executa quando o jogador envia o Modal de Apelido
    async handleModalSubmit(interaction) {
        const userId = interaction.user.id;
        const newNickname = interaction.fields.getTextInputValue('char_nick_input');

        if (!creationCache.has(userId)) {
            creationCache.set(userId, { race: null, nickname: interaction.user.username });
        }

        const data = creationCache.get(userId);
        data.nickname = newNickname;
        creationCache.set(userId, data);

        const panel = getCreationPanel(userId, interaction.user.username);
        await interaction.update(panel);
    },

    // Executa ao clicar em "Confirmar Personagem"
    async handleConfirm(interaction) {
        const userId = interaction.user.id;
        const data = creationCache.get(userId);

        if (!data || !data.race) {
            return interaction.reply({ content: '❌ Selecione uma raça antes de confirmar!', ephemeral: true });
        }

        // Aqui futuramente salvaremos os dados no banco de dados (ex: MongoDB/Quick.db)
        // Por enquanto, apenas enviamos a confirmação e limpamos o cache de criação.
        const raceDetails = races[data.race];

        const successEmbed = new EmbedBuilder()
            .setTitle('🎉 Jornada Iniciada!')
            .setDescription(
                `O destino ouviu o seu chamado, **${data.nickname}**!\n\n` +
                `Você escolheu trilhar o caminho como um valoroso **${raceDetails.name}**.\n` +
                `Seus atributos foram definidos e o seu inventário inicial foi preparado.\n\n` +
                `*Prepare suas armas, o mundo de Além do Destino te espera!*`
            )
            .setColor('#2ecc71')
            .setThumbnail('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200');

        creationCache.delete(userId); // Limpa o rascunho de criação

        await interaction.update({ embeds: [successEmbed], components: [], ephemeral: true });
    }
};
