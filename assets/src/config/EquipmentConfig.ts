// 装备类型
export enum EquipmentType {
  Weapon = 1,   // 武器
  Armor = 2,    // 上衣
  Jewelry = 3,  // 首饰
  Shoes = 4     // 鞋子
}

export interface IEquipmentStatWeights {
  hp: number;
  damage: number;
  defense: number;
  agility: number;
}

/* 装备表 */
export interface IEquipmentConfig {
  /* 装备ID */
  id: number;

  /* 名称 */
  name: string;

  /* 类型 */
  type: EquipmentType;

  /* 图标 */
  ico: string;

  /* 套装ID */
  setId: number;

  /* 套装名称 */
  setName: string;

  /* 套装技能 */
  setSkill: string;

  /* 属性权重 */
  statWeights: IEquipmentStatWeights;

  /* 星级技能 */
  starSkills: string[];
}
