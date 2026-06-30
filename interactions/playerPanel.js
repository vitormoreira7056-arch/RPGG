const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { currencySystem } = require('../data/economy.js');

// Banco de dados temporário em memória para salvar os dados estáveis dos jogadores ativos
// Estrutura: userId -> { nickname, class, level, xp, hp, mana, coins, inventory: [] }
const playerData = new Map();

/**
 * Função utilitária para gerar barras visuais
 */
function createProgressBar(current, max, size = 10, filledEmoji = '▰', emptyEmoji = '▱') {
    const percentage = Math.min(Math.max(current / max, 0), 1);
    const filledLength = Math.round(percentage * size);
    const emptyLength = size - filledLength;
    return filledEmoji.repeat(filledLength) + emptyEmoji.repeat(emptyLength);
}

/**
 * Gera o painel principal do jogador
 */
function getMainPanel(userId) {
    const player = playerData.get(userId);
    if (!player) return { content: '❌ Você não possui um personagem criado. Clique em "Começar Jornada".', ephemeral: true };

    const maxXp = 100; 
    const xpBar = createProgressBar(player.xp, maxXp, 10, '🟩', '⬛');
    const hpBar = createProgressBar(player.hp, player.hp, 10, '🟥', '⬛');
    const manaBar = createProgressBar(player.mana, player.mana, 10, '🟦', '⬛');

    const embed = new EmbedBuilder()
        .setTitle('⚔️ Além do Destino — Painel de Controle')
        .setDescription(`Seja bem-vindo de volta ao seu painel estratégico, aventureiro. Gerencie suas ações e status abaixo.`)
        .addFields(
            { name: '👤 Nome do Jogador', value: `\`${player.nickname}\` (Classe: **${player.class}**)`, inline: false },
            { name: `📈 Nível: ${player.level}`, value: `${xpBar} \`[${player.xp}/${maxXp} XP]\``, inline: false },
            { name: `❤️ Vida (HP): ${player.hp}/${player.hp}`, value: `${hpBar}`, inline: true },
            { name: `🔮 Mana: ${player.mana}/${player.mana}`, value: `${manaBar}`, inline: true },
            { name: '💰 Minhas Finanças (Conversão Automática)', value: currencySystem.formatCurrency(player.coins), inline: false }
        )
        .setColor('#34495e')
        .setThumbnail('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200');

    const menuRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('main_inventory').setLabel('Mochila').setEmoji('🎒').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('main_stats').setLabel('Atributos').setEmoji('📊').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('main_equipment').setLabel('Equipamentos').setEmoji('🛡️').setStyle(ButtonStyle.Primary)
    );

    return { embeds: [embed], components: [menuRow], ephemeral: true };
}

module.exports = {
    playerData,
    getMainPanel,

    // Executa ao clicar no botão "Mochila"
    async handleInventory(interaction) {
        const player = playerData.get(interaction.user.id);
        if (!player) {
            return interaction.reply({ content: '❌ Personagem não encontrado!', ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setTitle(`🎒 Mochila de ${player.nickname}`)
            .setDescription('Aqui estão todos os itens que você está carregando atualmente em sua jornada.')
            .setColor('#e67e22');

        if (player.inventory.length === 0) {
            embed.addFields({ name: 'Inventário Vazio', value: 'Sua mochila está completamente vazia.' });
        } else {
            // Lista os itens guardados
            const itemsList = player.inventory.map((item, index) => {
                return `\`${index + 1}.\` ⚪ **${item.name}** [Tier: \`F-\`] (Tipo: *${item.type}*)`;
            }).join('\n');
            
            embed.setDescription(`Aqui estão todos os itens que você está carregando atualmente em sua jornada:\n\n${itemsList}`);
        }

        const backRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('main_back_to_panel')
                .setLabel('Voltar ao Painel')
                .setEmoji('↩️')
                .setStyle(ButtonStyle.Secondary)
        );

        await interaction.update({ embeds: [embed], components: [backRow], ephemeral: true });
    },

    // Executa ao clicar no botão "Atributos"
    async handleStats(interaction) {
        const player = playerData.get(interaction.user.id);
        const embed = new EmbedBuilder()
            .setTitle(`📊 Atributos de ${player.nickname}`)
            .setDescription(`Atributos detalhados do seu personagem:\n\n❤️ Vida Max: \`${player.hp}\`\n🔮 Mana Max: \`${player.mana}\``)
            .setColor('#9b5de5');

        const backRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('main_back_to_panel').setLabel('Voltar ao Painel').setEmoji('↩️').setStyle(ButtonStyle.Secondary)
        );
        await interaction.update({ embeds: [embed], components: [backRow], ephemeral: true });
    },

    // Executa ao clicar no botão "Equipamentos"
    async handleEquipment(interaction) {
        const player = playerData.get(interaction.user.id);
        const embed = new EmbedBuilder()
            .setTitle(`🛡️ Equipamentos de ${player.nickname}`)
            .setDescription('*Sistema de slots de equipamentos em desenvolvimento...*')
            .setColor('#3498db');

        const backRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('main_back_to_panel').setLabel('Voltar ao Panel').setEmoji('↩️').setStyle(ButtonStyle.Secondary)
        );
        await interaction.update({ embeds: [embed], components: [backRow], ephemeral: true });
    },

    // Executa ao clicar em "Voltar ao Painel"
    async handleBack(interaction) {
        const panel = getMainPanel(interaction.user.id);
        await interaction.update(panel);
    }
};
