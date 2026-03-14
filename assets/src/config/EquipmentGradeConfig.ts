export enum EquipmentGradeType {
  C = 1,
  B = 2,
  A = 3,
  S = 4,
}

/* 品阶表 */
export interface IEquipmentGradeConfig {
  /* 品阶 */
  grade: EquipmentGradeType;

  /* 品阶名称 */
  name: string;

  /* 最高星级*/
  maxStar: number;

  /* 最高Lv */
  maxLevel: number;

  /* 多少level升一次星 */
  gradeLevel: number;

  /* 初始属性总预算 */
  baseStatBudget: number;

  /* 每级成长总预算 */
  growthStatBudget: number;

  /* 初始战斗力 */
  basePower: number;

  /* 每级战斗力成长 */
  powerGrowth: number;

  /* 升级消耗钻石基础值 */
  upgradeDiamondBase: number;

  /* 每级升级消耗钻石增量 */
  upgradeDiamondStep: number;
}


