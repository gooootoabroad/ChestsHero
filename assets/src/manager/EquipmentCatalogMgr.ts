import { IEquipmentConfig, EquipmentType } from "../config/EquipmentConfig";
import equipmentWeaponJson from "../config/json/equipment.weapon.json";
import equipmentArmorJson from "../config/json/equipment.armor.json";
import equipmentJewelryJson from "../config/json/equipment.jewelry.json";
import equipmentShoesJson from "../config/json/equipment.shoes.json";

type TCandidatesByType = Readonly<Partial<Record<EquipmentType, IEquipmentConfig[]>>>;

interface IEquipmentJsonByType {
  weapon: IEquipmentConfig[];
  armor: IEquipmentConfig[];
  jewelry: IEquipmentConfig[];
  shoes: IEquipmentConfig[];
}

export class EquipmentCatalogMgr {
  private static _initPromise: Promise<void> | null = null;
  private static _inited = false;

  private static _allEquipments: IEquipmentConfig[] = [];
  private static _candidatesByType: Partial<Record<EquipmentType, IEquipmentConfig[]>> = {};

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

  static getAllEquipments(): ReadonlyArray<IEquipmentConfig> {
    return this._allEquipments;
  }

  static getCandidatesByType(): TCandidatesByType {
    return this._candidatesByType;
  }

  private static async _doInit(): Promise<void> {
    const jsonByType = this.loadAllEquipmentJson();
    const allEquipments = [
      ...jsonByType.weapon,
      ...jsonByType.armor,
      ...jsonByType.jewelry,
      ...jsonByType.shoes,
    ];

    this._allEquipments = allEquipments;
    this._candidatesByType = this.buildCandidatesMap(allEquipments);
    this._inited = true;
  }

  private static loadAllEquipmentJson(): IEquipmentJsonByType {
    return {
      weapon: equipmentWeaponJson as IEquipmentConfig[],
      armor: equipmentArmorJson as IEquipmentConfig[],
      jewelry: equipmentJewelryJson as IEquipmentConfig[],
      shoes: equipmentShoesJson as IEquipmentConfig[],
    };
  }

  private static buildCandidatesMap(
    allEquipments: IEquipmentConfig[]
  ): Partial<Record<EquipmentType, IEquipmentConfig[]>> {
    const map: Partial<Record<EquipmentType, IEquipmentConfig[]>> = {
      [EquipmentType.Weapon]: [],
      [EquipmentType.Armor]: [],
      [EquipmentType.Jewelry]: [],
      [EquipmentType.Shoes]: [],
    };

    for (let i = 0; i < allEquipments.length; i++) {
      const item = allEquipments[i];
      if (!map[item.type]) {
        map[item.type] = [];
      }
      map[item.type].push(item);
    }

    return map;
  }
}
