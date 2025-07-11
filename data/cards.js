// تعريف البطاقات
const CARDS = {
    UNITS: [
        {
            id: 0,
            name: "فارس الظل",
            type: "unit",
            cost: 4,
            hp: 500,
            damage: 100,
            range: 1.5,
            attackSpeed: 1.5,
            movementSpeed: 2,
            modelPath: ASSET_PATHS.UNITS.SHADOW_KNIGHT,
            size: 1.5,
            description: "فارس قوي في القتال القريب"
        },
        {
            id: 1,
            name: "قناص الغابة",
            type: "unit",
            cost: 4,
            hp: 300,
            damage: 150,
            range: 8,
            attackSpeed: 2,
            movementSpeed: 1.5,
            modelPath: ASSET_PATHS.UNITS.FOREST_SNIPER,
            size: 1,
            description: "وحدة بعيدة المدى بضرر عالي"
        },
        {
            id: 2,
            name: "روح النار",
            type: "unit",
            cost: 3,
            hp: 200,
            damage: 200,
            range: 2,
            attackSpeed: 0,
            movementSpeed: 2.5,
            modelPath: ASSET_PATHS.UNITS.FIRE_SPIRIT,
            size: 1,
            description: "ينفجر عند الوصول إلى العدو"
        },
        {
            id: 3,
            name: "المدفع",
            type: "unit",
            cost: 4,
            hp: 400,
            damage: 120,
            range: 6,
            attackSpeed: 3,
            movementSpeed: 0,
            modelPath: ASSET_PATHS.UNITS.CANNON,
            size: 1.5,
            description: "يطلق قذائف بطيئة ولكن قوية"
        },
        {
            id: 4,
            name: "سحلية طائرة",
            type: "unit",
            cost: 3,
            hp: 350,
            damage: 80,
            range: 3,
            attackSpeed: 1,
            movementSpeed: 3,
            modelPath: ASSET_PATHS.UNITS.FLYING_LIZARD,
            size: 1,
            description: "تطير فوق الوحدات الأرضية"
        },
        {
            id: 5,
            name: "العفاريت الثلاثة",
            type: "unit",
            cost: 2,
            hp: 150, // لكل عفريت
            damage: 50, // لكل عفريت
            range: 1,
            attackSpeed: 1,
            movementSpeed: 2.5,
            modelPath: ASSET_PATHS.UNITS.THREE_GOBLINS,
            size: 1,
            count: 3,
            description: "ثلاثة عفاريت سريعة الانتشار"
        }
    ],
    SPELLS: [
        {
            id: 6,
            name: "كرة النار",
            type: "spell",
            cost: 3,
            damage: 300,
            radius: 3,
            modelPath: ASSET_PATHS.TEXTURES.CARDS.FIREBALL,
            description: "ضرر جماعي في منطقة محددة"
        },
        {
            id: 7,
            name: "تجميد",
            type: "spell",
            cost: 3,
            duration: 4,
            radius: 3.5,
            modelPath: ASSET_PATHS.TEXTURES.CARDS.FREEZE,
            description: "تجميد الوحدات في المنطقة"
        },
        {
            id: 8,
            name: "تعزيز",
            type: "spell",
            cost: 3,
            damageBoost: 1.5,
            speedBoost: 1.3,
            duration: 5,
            radius: 4,
            modelPath: ASSET_PATHS.TEXTURES.CARDS.BOOST,
            description: "زيادة سرعة وضرر الوحدات"
        },
        {
            id: 9,
            name: "عاصفة الظل",
            type: "spell",
            cost: 4,
            duration: 6,
            elixirDrain: 0.5,
            radius: 4,
            modelPath: ASSET_PATHS.TEXTURES.CARDS.SHADOW_STORM,
            description: "تقلل طاقة العدو تدريجياً"
        }
    ]
};

// دالة للحصول على بطاقة عشوائية
function getRandomCards(count = 4) {
    const allCards = [...CARDS.UNITS, ...CARDS.SPELLS];
    const shuffled = allCards.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}
