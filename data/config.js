// إعدادات اللعبة
const CONFIG = {
    GAME_DURATION: 180, // 3 دقائق بالثواني
    ELIXIR_MAX: 10,
    ELIXIR_REGEN_RATE: 0.5, // إكسير كل نصف ثانية
    GRID_SIZE: 20,
    GRID_WIDTH: 15,
    GRID_HEIGHT: 20,
    LANES: 3,
    TOWER_RANGE: 7,
    TOWER_DAMAGE: 50,
    TOWER_HP: 1000,
    MAIN_TOWER_HP: 2000,
    BOT_DIFFICULTY: 1, // 1-سهل، 2-متوسط، 3-صعب
};

// مسارات المجسمات
const ASSET_PATHS = {
    UNITS: {
        SHADOW_KNIGHT: 'assets/models/units/shadow_knight.glb',
        FOREST_SNIPER: 'assets/models/units/forest_sniper.glb',
        FIRE_SPIRIT: 'assets/models/units/fire_spirit.glb',
        CANNON: 'assets/models/units/cannon.glb',
        FLYING_LIZARD: 'assets/models/units/flying_lizard.glb',
        THREE_GOBLINS: 'assets/models/units/three_goblins.glb'
    },
    TOWERS: {
        MAIN: 'assets/models/towers/main_tower.glb',
        SIDE: 'assets/models/towers/side_tower.glb'
    },
    TEXTURES: {
        GROUND: 'assets/textures/ground.jpg',
        CARDS: {
            SHADOW_KNIGHT: 'assets/textures/cards/shadow_knight.png',
            FOREST_SNIPER: 'assets/textures/cards/forest_sniper.png',
            FIRE_SPIRIT: 'assets/textures/cards/fire_spirit.png',
            CANNON: 'assets/textures/cards/cannon.png',
            FLYING_LIZARD: 'assets/textures/cards/flying_lizard.png',
            THREE_GOBLINS: 'assets/textures/cards/three_goblins.png',
            FIREBALL: 'assets/textures/cards/fireball.png',
            FREEZE: 'assets/textures/cards/freeze.png',
            BOOST: 'assets/textures/cards/boost.png',
            SHADOW_STORM: 'assets/textures/cards/shadow_storm.png'
        }
    }
};
