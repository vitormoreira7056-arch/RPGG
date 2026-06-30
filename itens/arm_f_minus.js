module.exports = {
    // Restrições de Equipamentos baseadas nas Classes do Tier F-
    tierFMinus: {
        'Guerreiro': [
            'Espada curta', 'Espada longa', 'Espada de duas mãos de madeira', 
            'Espada dupla', 'Escudo de madeira', 'Escudo de madeira de duas mãos',
            'Lança de madeira', 'Lança de duas mãos de madeira',
            'Martelo de madeira', 'Martelo de madeira de duas mãos', 
            'Manopla de madeira'
        ],
        'Arqueiro': [
            'Arco curto de madeira', 'Arco longo de madeira', 'Besta leve de madeira',
            'Faca de madeira', 'Faca dupla de madeira'
        ],
        'Mago': [
            'Orb de madeira', 'Tomo de madeira', 
            'Cajado de madeira', 'Cajado de duas mãos de madeira',
            'Cetro de madeira'
        ],
        'Tank': [
            'Escudo de madeira', 'Escudo de madeira de duas mãos',
            'Martelo de madeira', 'Martelo de madeira de duas mãos', 
            'Espada curta', 'Manopla de madeira'
        ],
        'Assassino': [
            'Faca de madeira', 'Faca dupla de madeira', 'Adaga de madeira', 
            'Espada curta', 'Luva de madeira'
        ],
        'Invocador': [
            'Cajado de madeira', 'Cajado de duas mãos de madeira',
            'Tomo de madeira', 'Orb de madeira', 'Foice de madeira'
        ],
        'Curandeiro': [
            'Cajado de madeira', 'Cajado de duas mãos de madeira',
            'Tomo de madeira', 'Orb de madeira', 'Luva de madeira', 'Flauta de madeira'
        ]
    },

    // Banco de Dados detalhado com todas os itens de armas do Tier F-
    items: {
        // --- Armas de Uma Mão (Arma Principal) ---
        'Espada curta': { name: 'Espada Curta de Madeira', type: 'Arma Principal' },
        'Espada longa': { name: 'Espada Longa de Madeira', type: 'Arma Principal' },
        'Espada dupla': { name: 'Espada Dupla de Madeira', type: 'Arma Principal' },
        'Faca': { name: 'Faca de Madeira', type: 'Arma Principal' },
        'Faca dupla': { name: 'Faca Dupla de Madeira', type: 'Arma Principal' },
        'Adaga de madeira': { name: 'Adaga de Madeira', type: 'Arma Principal' },
        'Lança de madeira': { name: 'Lança de Madeira', type: 'Arma Principal' },
        'Martelo de madeira': { name: 'Martelo de Madeira', type: 'Arma Principal' },
        'Manopla de madeira': { name: 'Manopla de Madeira', type: 'Arma Principal' },
        'Cajado de madeira': { name: 'Cajado de Madeira', type: 'Arma Principal' },
        'Cetro de madeira': { name: 'Cetro de Madeira', type: 'Arma Principal' },

        // --- Armas e Equipamentos de Duas Mãos (Ocupam Principal e Secundária) ---
        'Espada de duas mãos de madeira': { name: 'Espada de Duas Mãos de Madeira', type: 'Duas Mãos' },
        'Escudo de madeira de duas mãos': { name: 'Escudo de Madeira de Duas Mãos', type: 'Duas Mãos' },
        'Lança de duas mãos de madeira': { name: 'Lança de Duas Mãos de Madeira', type: 'Duas Mãos' },
        'Martelo de madeira de duas mãos': { name: 'Martelo de Madeira de Duas Mãos', type: 'Duas Mãos' },
        'Cajado de duas mãos de madeira': { name: 'Cajado de Duas Mãos de Madeira', type: 'Duas Mãos' },
        'Arco curto de madeira': { name: 'Arco Curto de Madeira', type: 'Duas Mãos' },
        'Arco longo de madeira': { name: 'Arco Longo de Madeira', type: 'Duas Mãos' },
        'Besta leve de madeira': { name: 'Besta Leve de Madeira', type: 'Duas Mãos' },
        'Foice de madeira': { name: 'Foice de Madeira', type: 'Duas Mãos' },

        // --- Equipamentos de Mão Secundária ---
        'Escudo de madeira': { name: 'Escudo de Madeira', type: 'Arma Secundária' },
        'Orb de madeira': { name: 'Orb de Madeira', type: 'Arma Secundária' },
        'Tomo de madeira': { name: 'Tomo de Madeira', type: 'Arma Secundária' },

        // --- Outros / Acessórios de Mão ---
        'Luva de madeira': { name: 'Luva de Madeira', type: 'Luvas' },
        'Flauta de madeira': { name: 'Flauta de Madeira', type: 'Arma Principal' }
    }
};
