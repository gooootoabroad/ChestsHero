import { EquipmentType } from "./EquipmentConfig";
import { EquipmentGradeType } from "./EquipmentGradeConfig";

export type ChestStarLevel = 1 | 2 | 3 | 4 | 5;

export interface IWeightedGradeRate {
  grade: EquipmentGradeType;
  weight: number;
}

export interface IWeightedEquipmentTypeRate {
  type: EquipmentType;
  weight: number;
}

// 宝箱星级 -> 品级权重（总和 100）
export const ChestGradeRateByStar: Record<ChestStarLevel, IWeightedGradeRate[]> = {
  1: [
    { grade: EquipmentGradeType.C, weight: 95 },
    { grade: EquipmentGradeType.B, weight: 5 },
  ],
  2: [
    { grade: EquipmentGradeType.C, weight: 80 },
    { grade: EquipmentGradeType.B, weight: 18 },
    { grade: EquipmentGradeType.A, weight: 2 },
  ],
  3: [
    { grade: EquipmentGradeType.C, weight: 60 },
    { grade: EquipmentGradeType.B, weight: 30 },
    { grade: EquipmentGradeType.A, weight: 9 },
    { grade: EquipmentGradeType.S, weight: 1 },
  ],
  4: [
    { grade: EquipmentGradeType.C, weight: 35 },
    { grade: EquipmentGradeType.B, weight: 40 },
    { grade: EquipmentGradeType.A, weight: 20 },
    { grade: EquipmentGradeType.S, weight: 5 },
  ],
  5: [
    { grade: EquipmentGradeType.C, weight: 5 },
    { grade: EquipmentGradeType.B, weight: 40 },
    { grade: EquipmentGradeType.A, weight: 40 },
    { grade: EquipmentGradeType.S, weight: 15 },
  ],
};

// 装备类型权重（总和 100）
export const ChestEquipmentTypeRates: IWeightedEquipmentTypeRate[] = [
  { type: EquipmentType.Weapon, weight: 38 },
  { type: EquipmentType.Armor, weight: 34 },
  { type: EquipmentType.Shoes, weight: 18 },
  { type: EquipmentType.Jewelry, weight: 10 },
];

