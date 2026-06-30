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
const armFMinus = require('../itens/arm_f_minus.js');
const { playerData, getMainPanel } = require('./playerPanel.js');

const creationCache = new Map();

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
            .setDisabled(!data.class)
    );

    return { embeds: [embed], components: [selectRow, buttonRow], ephemeral: true };
}

module.exports = {
    creationCache,
    getCreationPanel,

    async handleStart(interaction) {
        const panel = getCreationPanel(interaction.user.id, interaction.user.username);
        await interaction.reply(panel);
    },

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

    async handleConfirm(interaction) {
        const userId = interaction.user.id;
        const data = creationCache.get(userId);

        if (!data || !data.class) {
            return interaction.reply({ content: '❌ Selecione uma classe antes de confirmar!', ephemeral: true });
        }

        const classDetails = classes[data.class];

        // LOGICA DE RECOMPENSA ALEATORIA DO TIER F-
        const armasPermitidas = armFMinus.tierFMinus[data.class];
        const chaveArmaAleatoria = armasPermitidas[Math.floor(Math.random() * armasPermitidas.length)];
        const dadosArma = armFMinus.items[chaveArmaAleatoria];

        // Monta o objeto completo do item para colocar na mochila
        const itemGanhado = {
            id: chaveArmaAleatoria,
            name: dadosArma.name,
            type: dadosArma.type
        };

        // Salva de forma estável o jogador ativo com a sua arma inicial na mochila
        playerData.set(userId, {
            nickname: data.nickname,
            class: classDetails.name,
            level: 1,
            xp: 0,
            hp: classDetails.baseStats.hp,
            mana: classDetails.baseStats.mana,
            coins: 0,
            inventory: [itemGanhado] // Arma inicial inclusa aqui!
        });

        // Limpa o cache de criação temporário
        creationCache.delete(userId);

        // Gera e responde diretamente com o Painel de Controle Principal atualizado
        const mainPanel = getMainPanel(userId);
        await interaction.update(mainPanel);

        // Envia um aviso complementar avisando qual item ele ganhou
        await interaction.followUp({
            content: `🎁 **Recompensa de Classe:** Você recebeu uma **${itemGanhado.name}** (Tier F-) baseada na sua classe inicial! Verifique sua **Mochila**.`,
            ephemeral: true
        });
    }
};
