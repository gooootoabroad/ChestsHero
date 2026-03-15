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
    { grade: EquipmentGradeType.C, weight: 10 },
    { grade: EquipmentGradeType.B, weight: 80 },
    { grade: EquipmentGradeType.A, weight: 10 },
  ],
  3: [
    { grade: EquipmentGradeType.B, weight: 50 },
    { grade: EquipmentGradeType.A, weight: 45 },
    { grade: EquipmentGradeType.S, weight: 5 },
  ],
  4: [
    { grade: EquipmentGradeType.B, weight: 10 },
    { grade: EquipmentGradeType.A, weight: 70 },
    { grade: EquipmentGradeType.S, weight: 20 },
  ],
  5: [
    { grade: EquipmentGradeType.A, weight: 50 },
    { grade: EquipmentGradeType.S, weight: 50 },
  ],
};

// 装备类型权重（总和 100）
export const ChestEquipmentTypeRates: IWeightedEquipmentTypeRate[] = [
  { type: EquipmentType.Weapon, weight: 38 },
  { type: EquipmentType.Armor, weight: 34 },
  { type: EquipmentType.Shoes, weight: 18 },
  { type: EquipmentType.Jewelry, weight: 10 },
];

