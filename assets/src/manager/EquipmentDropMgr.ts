import { IEquipmentConfig, EquipmentType } from "../config/EquipmentConfig";
import { ChestEquipmentTypeRates, ChestGradeRateByStar, ChestStarLevel, IWeightedEquipmentTypeRate, IWeightedGradeRate } from "../config/EquipmentDropConfig";
import { EquipmentGradeType } from "../config/EquipmentGradeConfig";

export interface IEquipmentDropRollInput {
  // 宝箱当前星级（支持 number，内部会收敛到 1~5）
  star: number;
  // 由外层传入候选池，避免本模块耦合 JSON 读取和资源加载
  candidatesByType: Partial<Record<EquipmentType, IEquipmentConfig[]>>;
  // 可选随机函数，方便测试或回放
  randomFn?: () => number;
}

export interface IEquipmentDropRollResult {
  equipmentId: number;
  equipmentType: EquipmentType;
  grade: EquipmentGradeType;
  star: ChestStarLevel;
}

export class EquipmentDropMgr {
  static roll(input: IEquipmentDropRollInput): IEquipmentDropRollResult | null {
    const randomFn = input.randomFn ?? Math.random;
    const star = this.normalizeStar(input.star);
    const grade = this.rollGrade(star, randomFn);

    const availableTypeRates = this.getAvailableTypeRates(input.candidatesByType);
    if (availableTypeRates.length <= 0) {
      return null;
    }

    const equipmentType = this.rollByWeights(availableTypeRates, randomFn).type;
    const candidates = input.candidatesByType[equipmentType] ?? [];
    if (candidates.length <= 0) {
      return null;
    }

    const pickedEquipment = candidates[Math.floor(randomFn() * candidates.length)];
    return {
      equipmentId: pickedEquipment.id,
      equipmentType,
      grade,
      star,
    };
  }

  static getGradeRates(star: number): IWeightedGradeRate[] {
    return [...ChestGradeRateByStar[this.normalizeStar(star)]];
  }

  static getTypeRates(): IWeightedEquipmentTypeRate[] {
    return [...ChestEquipmentTypeRates];
  }

  private static rollGrade(star: ChestStarLevel, randomFn: () => number): EquipmentGradeType {
    const rates = ChestGradeRateByStar[star];
    return this.rollByWeights(rates, randomFn).grade;
  }

  private static getAvailableTypeRates(
    candidatesByType: Partial<Record<EquipmentType, IEquipmentConfig[]>>
  ): IWeightedEquipmentTypeRate[] {
    return ChestEquipmentTypeRates.filter((v) => {
      const candidates = candidatesByType[v.type];
      return !!candidates && candidates.length > 0;
    });
  }

  private static normalizeStar(star: number): ChestStarLevel {
    const normalized = Math.max(1, Math.min(5, Math.floor(star)));
    return normalized as ChestStarLevel;
  }

  private static rollByWeights<T extends { weight: number }>(items: T[], randomFn: () => number): T {
    if (items.length <= 0) {
      throw new Error("[EquipmentDropMgr] rollByWeights called with empty items.");
    }

    const totalWeight = items.reduce((sum, item) => sum + Math.max(0, item.weight), 0);
    if (totalWeight <= 0) {
      return items[0];
    }

    let value = randomFn() * totalWeight;
    for (let i = 0; i < items.length; i++) {
      value -= Math.max(0, items[i].weight);
      if (value <= 0) {
        return items[i];
      }
    }

    return items[items.length - 1];
  }
}

