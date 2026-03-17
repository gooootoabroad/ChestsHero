import { EquipmentGradeType } from "../config/EquipmentGradeConfig";
import { EquipmentGradeMgr } from "./EquipmentGradeMgr";

/**
 * 获取分解都能得到什么奖励
 * @param grade 
 * @param star 
 * @param level 
 * @returns 
 */
export function getResolveEquipmentReward(grade: EquipmentGradeType, level: number) {
    let gradeConfig = EquipmentGradeMgr.getGradeBasicInfo(grade);
    let diamond = 0;
    let i = 1;
    while (i < level) {
        diamond += diamond + gradeConfig.upgradeDiamondStep;
        i++;
    }

    // 只返回0.6升级比例
    diamond = Math.floor(diamond * 0.6);
    // 加上装备价值
    diamond += EquipmentGradeMgr.getGradeEquipmentBaseCost(grade);
    return diamond;
}

export function getUpgradeNeedDiamond(basic: number, step: number, level: number): number {
    return basic + (level - 1) * step;
}
