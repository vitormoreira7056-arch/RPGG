module.exports = {
    'Guerreiro': {
        name: 'Guerreiro',
        description: 'Mestres do combate corpo a corpo, combinando força física equilibrada com uma excelente capacidade de sobrevivência.',
        baseStats: { hp: 120, mana: 30, stamina: 60 }
    },
    'Arqueiro': {
        name: 'Arqueiro',
        description: 'Especialistas em combate à distância, utilizam agilidade e precisão para abater inimigos antes mesmo de serem vistos.',
        baseStats: { hp: 90, mana: 40, stamina: 80 }
    },
    'Mago': {
        name: 'Mago',
        description: 'Estudiosos das artes arcanas, capazes de conjurar feitiços devastadores em área sacrificando sua resistência física.',
        baseStats: { hp: 80, mana: 120, stamina: 30 }
    },
    'Tank': {
        name: 'Tank',
        description: 'A força inabalável da linha de frente. Possuem a maior quantidade de vida e foco total em mitigar o dano recebido.',
        baseStats: { hp: 160, mana: 20, stamina: 50 }
    },
    'Assassino': {
        name: 'Assassino',
        description: 'Ágeis e letais, atacam as sombras focando em acertos críticos massivos e esquiva acelerada.',
        baseStats: { hp: 85, mana: 30, stamina: 95 }
    },
    'Invocador': {
        name: 'Invocador',
        description: 'Manipuladores de entidades e espíritos que lutam em seu lugar, balanceando mana e controle de campo.',
        baseStats: { hp: 95, mana: 90, stamina: 45 }
    },
    'Curandeiro': {
        name: 'Curandeiro',
        description: 'Suportes vitais abençoados com magias de restauração, purificação e fortificação para aguentar longas batalhas.',
        baseStats: { hp: 100, mana: 100, stamina: 40 }
    }
};
