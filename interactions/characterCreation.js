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
const classes = require('../data/classes.js');

// Cache temporário em memória para salvar as seleções antes de salvar no banco de dados.
// Estrutura: userId -> { class: string|null, nickname: string }
const creationCache = new Map();

/**
 * Retorna os componentes e o embed do painel de criação baseados no estado atual do cache.
 */
function getCreationPanel(userId, username) {
    if (!creationCache.has(userId)) {
        creationCache.set(userId, { class: null, nickname: username });
    }

    const data = creationCache.get(userId);
    const classDetails = data.class ? classes[data.class] : null;

    const embed = new EmbedBuilder()
        .setTitle('🛡️ Criação de Personagem — Além do Destino')
        .setDescription(
            `Bem-vindo ao criador de personagens! Personalize a sua identidade antes de adentrar as terras esquecidas.\n\n` +
            `**👤 Nome/Apelido:** \`${data.nickname}\`\n` +
            `**⚔️ Classe Selecionada:** ${data.class ? `**${classDetails.name}**` : '`Nenhuma (Selecione abaixo)`'}\n\n` +
            (classDetails ? `*Descrição da Classe:* ${classDetails.description}\n` +
            `*Atributos Iniciais:* ❤️ HP: \`${classDetails.baseStats.hp}\` | 🔮 Mana: \`${classDetails.baseStats.mana}\` | ⚡ Stamina: \`${classDetails.baseStats.stamina}\`` : '*Selecione uma classe no menu abaixo para ver os seus detalhes.*')
        )
        .setColor(data.class ? '#2ecc71' : '#f1c40f')
        .setThumbnail('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200');

    // Menu de Seleção de Classes - Respeitando o limite de caracteres do Discord
    const selectOptions = Object.keys(classes).map(key => ({
        label: classes[key].name,
        value: key,
        description: classes[key].description.length > 95 ? classes[key].description.slice(0, 95) + '...' : classes[key].description,
        emoji: '🛡️'
    }));

    const selectRow = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId('char_select_class')
            .setPlaceholder('Escolha a sua Classe Inicial...')
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
            .setDisabled(!data.class) // Desabilitado até escolher uma classe
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

    // Executa quando o jogador seleciona uma classe no menu
    async handleClassSelect(interaction) {
        const userId = interaction.user.id;
        const selectedClass = interaction.values[0];

        if (!creationCache.has(userId)) {
            creationCache.set(userId, { class: null, nickname: interaction.user.username });
        }

        const data = creationCache.get(userId);
        data.class = selectedClass;
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
            creationCache.set(userId, { class: null, nickname: interaction.user.username });
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

        if (!data || !data.class) {
            return interaction.reply({ content: '❌ Selecione uma classe antes de confirmar!', ephemeral: true });
        }

        const classDetails = classes[data.class];

        const successEmbed = new EmbedBuilder()
            .setTitle('🎉 Jornada Iniciada!')
            .setDescription(
                `O destino ouviu o seu chamado, **${data.nickname}**!\n\n` +
                `Você escolheu trilhar o caminho como um destemido **${classDetails.name}**.\n` +
                `Seus atributos iniciais foram aplicados com sucesso.\n\n` +
                `*Prepare-se, pois o mundo de Além do Destino acaba de ganhar um novo herói!*`
            )
            .setColor('#2ecc71')
            .setThumbnail('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200');

        creationCache.delete(userId); // Limpa o rascunho de criação

        await interaction.update({ embeds: [successEmbed], components: [], ephemeral: true });
    }
};
