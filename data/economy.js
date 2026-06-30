module.exports = {
    // Configurações do Sistema de Nível e XP
    levelSystem: {
        maxLevel: 100,
        getXpForNextLevel(currentLevel) {
            if (currentLevel >= 100) return Infinity;
            return Math.floor(100 * Math.pow(currentLevel, 1.5));
        }
    },

    // Configurações do Sistema de Moedas balanceado pelo Usuário
    currencySystem: {
        types: {
            cobre:    { name: 'Moeda de Cobre',    emoji: '🟤', value: 1 },
            bronze:   { name: 'Moeda de Bronze',   emoji: '🧱', value: 20 },         // 20 Cobres
            prata:    { name: 'Moeda de Prata',    emoji: '🥈', value: 1000 },       // 50 Bronzes (20 * 50)
            ouro:     { name: 'Moeda de Ouro',     emoji: '🥇', value: 100000 },     // 100 Pratas (1000 * 100)
            platina:  { name: 'Moeda de Platina',  emoji: '💎', value: 100000000 }   // 1000 Ouros (100000 * 1000)
        },

        /**
         * Transforma um valor total bruto (em cobres) em uma string formatada exibindo todas as moedas.
         */
        formatCurrency(totalCobre) {
            let remaining = totalCobre;
            
            const order = ['platina', 'ouro', 'prata', 'bronze', 'cobre'];
            const result = [];

            for (const key of order) {
                const coin = this.types[key];
                const amount = Math.floor(remaining / coin.value);
                
                // Sempre exibe a moeda se o valor for maior que 0, ou se for Cobre (para nunca ficar totalmente vazio)
                if (amount > 0 || key === 'cobre') {
                    result.push(`**${amount}** ${coin.emoji}`);
                    remaining %= coin.value;
                }
            }

            return result.join('  ');
        }
    }
};
