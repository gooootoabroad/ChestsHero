import equipmentSuitJson from "../config/json/equipment-set.json";
import { IEquipmentSetConfig } from "../config/EquipmentSetConfig";

type TCandidatesByType = Readonly<Partial<Record<number, IEquipmentSetConfig>>>;

export class EquipmentSuitMgr {
  private static _initPromise: Promise<void> | null = null;
  private static _inited = false;

  private static _allSuits: IEquipmentSetConfig[] = [];
  private static _candidatesByType: Partial<Record<number, IEquipmentSetConfig>> = {};

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

  static getAllSuits(): ReadonlyArray<IEquipmentSetConfig> {
    return this._allSuits;
  }

  static getSuitBasicInfo(id: number): IEquipmentSetConfig {
    return this._candidatesByType[id];
  }

  static getCandidatesByType(): TCandidatesByType {
    return this._candidatesByType;
  }

  private static async _doInit(): Promise<void> {
    const jsonByType = this.loadAllSuitJson();
    const allSuits = [
      ...jsonByType
    ];

    this._allSuits = allSuits;
    this._candidatesByType = this.buildCandidatesMap(allSuits);
    this._inited = true;
  }

  private static loadAllSuitJson(): IEquipmentSetConfig[] {
    return equipmentSuitJson as IEquipmentSetConfig[];
  }

  private static buildCandidatesMap(
    allSuits: IEquipmentSetConfig[]
  ): Partial<Record<number, IEquipmentSetConfig>> {
    const map: Partial<Record<number, IEquipmentSetConfig>> = {};

    for (let i = 0; i < allSuits.length; i++) {
      const item = allSuits[i];
      map[item.id] = item;
    }

    return map;
  }
}
