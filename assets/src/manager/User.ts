import { calcEquipmentStats } from "../config/EquipmentCalc"
import { Core } from "../global/Core"
import { EquipmentCatalogMgr } from "./EquipmentCatalogMgr"
import { EquipmentGradeMgr } from "./EquipmentGradeMgr"

// 获取用户属性，战斗力信息
export interface UserProp {
    attack: number,
    hp: number,
    def: number,
    speed: number,
    combat: number,
}

type HeroAttr = {
    attack: number
    hp: number
    def: number
    speed: number
}

export function calcFightPower(attr: HeroAttr): number {
    const weight = {
        attack: 1,
        hp: 0.2,
        def: 0.5,
        speed: 0.8
    }

    const power =
        attr.attack * weight.attack +
        attr.hp * weight.hp +
        attr.def * weight.def +
        attr.speed * weight.speed

    return Math.floor(power)
}

export function getUserProp(): UserProp {
    // 获取用户装备
    let userBasicAttr: HeroAttr = {
        attack: 100,
        hp: 200,
        def: 50,
        speed: 30,
    }

    let equipped = Core.userInfo.equipped;
    equipped.forEach((uid) => {
        if (!uid) return;
        let dbInfo = Core.userInfo.equipments.find(e => e.uid == uid);
        if (!dbInfo) return;
        let equipmentBasicData = EquipmentCatalogMgr.getEquipmentBasicInfo(dbInfo.id, dbInfo.type);
        let gradeData = EquipmentGradeMgr.getGradeBasicInfo(dbInfo.grade);
        let attrInfo = calcEquipmentStats(equipmentBasicData, gradeData, dbInfo.level);
        userBasicAttr.attack += attrInfo.stats.damage;
        userBasicAttr.hp += attrInfo.stats.hp;
        userBasicAttr.def += attrInfo.stats.defense;
        userBasicAttr.speed += attrInfo.stats.agility;
    });

    return {
        attack: userBasicAttr.attack,
        hp: userBasicAttr.hp,
        def: userBasicAttr.def,
        speed: userBasicAttr.speed,
        combat: calcFightPower(userBasicAttr),
    }
}

export function getEquipmentCombat(uid: string): number {
    let dbInfo = Core.userInfo.equipments.find(e => e.uid == uid);
    if (!dbInfo) return;
    let equipmentBasicData = EquipmentCatalogMgr.getEquipmentBasicInfo(dbInfo.id, dbInfo.type);
    let gradeData = EquipmentGradeMgr.getGradeBasicInfo(dbInfo.grade);
    let attrInfo = calcEquipmentStats(equipmentBasicData, gradeData, dbInfo.level);
    return calcFightPower({
        attack: attrInfo.stats.damage,
        hp: attrInfo.stats.hp,
        def: attrInfo.stats.defense,
        speed: attrInfo.stats.agility,
    });
}