const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('instalar')
        .setDescription('Configura o canal oficial e o painel inicial do Além do Destino.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const guild = interaction.guild;

        try {
            const category = await guild.channels.create({
                name: '⚔️ Além do Destino RPG',
                type: ChannelType.GuildCategory
            });

            const gameChannel = await guild.channels.create({
                name: '🎮-jogar',
                type: ChannelType.GuildText,
                parent: category.id,
                permissionOverwrites: [
                    {
                        id: guild.roles.everyone.id,
                        deny: [PermissionFlagsBits.SendMessages],
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory]
                    }
                ]
            });

            const introEmbed = new EmbedBuilder()
                .setTitle('⚔️ Além do Destino — RPG')
                .setDescription(
                    `Seja bem-vindo a um mundo onde suas escolhas moldam a realidade e o perigo espreita em cada sombra.\n\n` +
                    `Explore áreas misteriosas, enfrente criaturas únicas, colete equipamentos lendários e negocie no mercado global.\n\n` +
                    `**Como Jogar:**\n` +
                    `Utilize os botões abaixo para criar seu personagem, gerenciar seus slots de equipamentos ou abrir o menu de exploração. Tudo é controlado diretamente pelos painéis.`
                )
                .setColor('#2f3136')
                .setImage('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000')
                .setFooter({ text: 'Desenvolvido no sistema moderno de componentes do Discord.' });

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('game_start')
                    .setLabel('Começar Jornada')
                    .setEmoji('🛡️')
                    .setStyle(ButtonStyle.Success)
            );

            await gameChannel.send({ embeds: [introEmbed], components: [row] });

            return interaction.editReply({ content: `✅ Jogo instalado com sucesso! Canal criado: ${gameChannel}.` });

        } catch (error) {
            console.error(error);
            return interaction.editReply({ content: '❌ Ocorreu um erro ao tentar criar a estrutura de canais do jogo.' });
        }
    }
};
