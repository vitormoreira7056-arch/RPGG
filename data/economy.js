module.exports = {
    // Configurações do Sistema de Nível e XP
    levelSystem: {
        maxLevel: 100,
        // Função matemática que calcula o XP necessário para o próximo nível
        // Exemplo: Nível 1 requer 100 XP, e escala progressivamente até o nível 100
        getXpForNextLevel(currentLevel) {
            if (currentLevel >= 100) return Infinity;
            return Math.floor(100 * Math.pow(currentLevel, 1.5));
        }
    },

    // Configurações do Sistema de Moedas
    currencySystem: {
        types: {
            cobre:    { name: 'Moeda de Cobre',    emoji: '🟤', value: 1 },
            bronze:   { name: 'Moeda de Bronze',   emoji: '🧱', value: 100 },      // 100 Cobres
            prata:    { name: 'Moeda de Prata',    emoji: '🥈', value: 10000 },    // 100 Bronzes
            ouro:     { name: 'Moeda de Ouro',     emoji: '🥇', value: 1000000 },  // 100 Pratas
            platina:  { name: 'Moeda de Platina',  emoji: '💎', value: 100000000 } // 100 Ouros
        },

        /**
         * Transforma um valor total bruto (em cobres) em um formato legível separado por moedas.
         * Exemplo: 10250 cobres -> 1 Prata, 2 Bronze e 50 Cobre
         */
        formatCurrency(totalCobre) {
            if (totalCobre === 0) return `0 ${this.types.cobre.emoji}`;

            let remaining = totalCobre;
            const result = [];

            // Array na ordem inversa do valor para converter do maior para o menor
            const order = ['platina', 'ouro', 'prata', 'bronze', 'cobre'];

            for (const key of order) {
                const coin = this.types[key];
                const amount = Math.floor(remaining / coin.value);
                
                if (amount > 0) {
                    result.push(`**${amount}** ${coin.emoji}`);
                    remaining %= coin.value;
                }
            }

            return result.join(' ');
        }
    }
};
