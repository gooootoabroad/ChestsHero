import equipmentGradeJson from "../config/json/equipment-grade.json";
import { EquipmentGradeType, IEquipmentGradeConfig } from "../config/EquipmentGradeConfig";

type TCandidatesByType = Readonly<Partial<Record<EquipmentGradeType, IEquipmentGradeConfig>>>;

export class EquipmentGradeMgr {
  private static _initPromise: Promise<void> | null = null;
  private static _inited = false;

  private static _allGrades: IEquipmentGradeConfig[] = [];
  private static _candidatesByType: Partial<Record<EquipmentGradeType, IEquipmentGradeConfig>> = {};

  static async init(): Promise<void> {
    if (this._inited) {
      return;
    }
    if (this._initPromise) {
      return this._initPromise;
    }

    this._initPromise = this._doInit();
    return this._initPromise;
  }

  static isInited(): boolean {
    return this._inited;
  }

  static getAllGrades(): ReadonlyArray<IEquipmentGradeConfig> {
    return this._allGrades;
  }

  static getGradeBasicInfo(grade: EquipmentGradeType): IEquipmentGradeConfig {
    return this._candidatesByType[grade];
  }

  static getCandidatesByType(): TCandidatesByType {
    return this._candidatesByType;
  }

  static getGradeEquipmentBaseCost(grade: EquipmentGradeType): number {
    // 100 钻石 一个宝箱
    switch (grade) {
      case EquipmentGradeType.C:
        return 50;
      case EquipmentGradeType.B:
        return 100;
      case EquipmentGradeType.A:
        return 200;
      case EquipmentGradeType.S:
        return 400;
    }
  }

  static getGradeBackgroundInfo(grade: EquipmentGradeType): [string, string] {
    let bgName = "texture/ui/equipment-bg";
    let labelColor = "";
    switch (grade) {
      case EquipmentGradeType.C:
      case EquipmentGradeType.B:
        bgName += "0";
        labelColor = "#48CC58";
        break;
      case EquipmentGradeType.A:
        bgName += "1";
        labelColor = "#E7B127";
        break;
      case EquipmentGradeType.S:
        bgName += "2";
        labelColor = "#FF5E5E";
        break;
    }

    return [bgName, labelColor];
  }

  static getGradeName(grade: EquipmentGradeType): string {
    switch (grade) {
      case EquipmentGradeType.C:
        return "C";
      case EquipmentGradeType.B:
        return "B";
      case EquipmentGradeType.A:
        return "A";
      case EquipmentGradeType.S:
        return "S";
    }
  }

  private static async _doInit(): Promise<void> {
    const jsonByType = this.loadAllGradeJson();
    const allGrades = [
      ...jsonByType
    ];

    this._allGrades = allGrades;
    this._candidatesByType = this.buildCandidatesMap(allGrades);
    this._inited = true;
  }

  private static loadAllGradeJson(): IEquipmentGradeConfig[] {
    return equipmentGradeJson as IEquipmentGradeConfig[];
  }

  private static buildCandidatesMap(
    allGrades: IEquipmentGradeConfig[]
  ): Partial<Record<EquipmentGradeType, IEquipmentGradeConfig>> {
    const map: Partial<Record<EquipmentGradeType, IEquipmentGradeConfig>> = {};

    for (let i = 0; i < allGrades.length; i++) {
      const item = allGrades[i];
      map[item.grade] = item;
    }

    return map;
  }
}
