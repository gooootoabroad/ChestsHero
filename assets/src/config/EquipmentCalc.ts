import { IEquipmentConfig, IEquipmentStatWeights } from "./EquipmentConfig";
import { IEquipmentGradeConfig } from "./EquipmentGradeConfig";
import { IEquipmentSetConfig } from "./EquipmentSetConfig";

export interface IEquipmentStats {
    hp: number;
    damage: number;
    defense: number;
    agility: number;
}

export interface IEquipmentCalcResult {
    level: number;
    stats: IEquipmentStats;
    battlePower: number;
}

function calcWeightedValue(weights: IEquipmentStatWeights, budget: number): IEquipmentStats {
    const totalWeight = weights.hp + weights.damage + weights.defense + weights.agility;
    if (totalWeight <= 0) {
        return {
            hp: 0,
            damage: 0,
            defense: 0,
            agility: 0,
        };
    }

    const rawValues = [
        { key: 'hp', value: budget * weights.hp / totalWeight },
        { key: 'damage', value: budget * weights.damage / totalWeight },
        { key: 'defense', value: budget * weights.defense / totalWeight },
        { key: 'agility', value: budget * weights.agility / totalWeight },
    ] as const;

    const result: IEquipmentStats = {
        hp: 0,
        damage: 0,
        defense: 0,
        agility: 0,
    };

    let remain = budget;
    const remainders = rawValues.map((item) => {
        const floorValue = Math.floor(item.value);
        result[item.key] = floorValue;
        remain -= floorValue;
        return {
            key: item.key,
            remainder: item.value - floorValue,
        };
    }).sort((a, b) => b.remainder - a.remainder);

    for (let i = 0; i < remain; i++) {
        const item = remainders[i % remainders.length];
        result[item.key] += 1;
    }

    return result;
}

export function calcEquipmentStats(config: IEquipmentConfig, gradeConfig: IEquipmentGradeConfig, level: number): IEquipmentCalcResult {
    const currentLevel = Math.max(1, Math.min(level, gradeConfig.maxLevel));
    const totalBudget = gradeConfig.baseStatBudget + gradeConfig.growthStatBudget * (currentLevel - 1);
    const battlePower = gradeConfig.basePower + gradeConfig.powerGrowth * (currentLevel - 1);

    return {
        level: currentLevel,
        stats: calcWeightedValue(config.statWeights, totalBudget),
        battlePower,
    };
}

export function calcEquipmentUpgradeDiamond(gradeConfig: IEquipmentGradeConfig, currentLevel: number): number {
    const level = Math.max(1, currentLevel);
    return gradeConfig.upgradeDiamondBase + gradeConfig.upgradeDiamondStep * (level - 1);
}

export function isEquipmentSetActive(setConfig: IEquipmentSetConfig, equippedCount: number): boolean {
    return equippedCount >= setConfig.needCount;
}

export function calcEquipmentSetPower(setConfig: IEquipmentSetConfig, equippedCount: number): number {
    return isEquipmentSetActive(setConfig, equippedCount) ? setConfig.setPower : 0;
}
