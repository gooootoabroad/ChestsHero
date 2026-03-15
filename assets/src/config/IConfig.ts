export const HeroPropertyEnums = ['Hp', 'Damage', 'AtkSpeed', 'HpBonus', 'DamageBonus', 'AtkSpeedBonus', 'CrtChance', 'CrtDamageBonus', 'AddDamageBonus'] as const;
export type HeroPropertyEnum = typeof HeroPropertyEnums[number];

export const HeroPropertyDescEnums = ['生命值', '攻击力', '攻速值', '生命', '攻击', '攻速', '暴击率', '暴击伤害', '附加伤害'] as const;

export const MonsterPropertyEnums = ['Hp', 'Damage', 'AtkSpeed', 'MoveSpeed'] as const;
export type MonsterPropertyEnum = typeof MonsterPropertyEnums[number];

export type MoneyType =
    'Gold' | 'Diamond';

export const AchievementTypes =
    ['killMonster', 'passedLevel', 'upgradeEquipment', 'degradeEquipment',
        'buyChestInShop', 'buyCompositesInShop', 'buyInDailyShop', 'buyInDailyReward',
        'getOfflineReward', 'lookAdVideo'] as const;
export type AchievementType = typeof AchievementTypes[number];

