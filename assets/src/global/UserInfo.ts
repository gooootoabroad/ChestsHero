import { EquipmentType } from "../config/EquipmentConfig";
import { EquipmentGradeType } from "../config/EquipmentGradeConfig";
import { SaveProp } from "../localstorage/SaveProp";
import { getTodayDateString } from "../utils/string";

export class UserInfo {
    private _day: UserInfoDay;
    get day() {
        if (!this._day) {
            this._day = new UserInfoDay(this);
        }
        return this._day;
    }

    //要通关的关卡
    @SaveProp.decorator(1)
    passLevel: number;

    @SaveProp.decorator(0)
    diamond: number;

    @SaveProp.decorator(0)
    battlePower: number;

    //已装备的装备信息,存放的uid
    @SaveProp.decorator([null, null, null, null])
    equipped: (string | null)[];

    //所有装备信息
    @SaveProp.decorator([])
    equipments: IUserEquipmentData[];

    // 当前开启箱子获得的装备，还没有替换
    @SaveProp.decorator(null)
    tempEquipmentUID: string;


    @SaveProp.decorator({})
    achievement: any;

    @SaveProp.decorator(null)
    reward: any;


    // 兑换码
    // @SaveProp.decorator([])
    // redeems: string[];

    // 第一次奖励
    @SaveProp.decorator(true)
    firstGift: boolean;

    @SaveProp.decorator(true)
    gameGuide: boolean;

    @SaveProp.decorator([])
    wheel: any[];

    // 宝箱数量
    @SaveProp.decorator(0)
    chestCount: number;


    // 上一次登陆时间
    @SaveProp.decorator(getTodayDateString())
    lastLoginTime: string;

    constructor() {
        SaveProp.initObject(this);
    }

    clear() {
        this._day?.clear();
        SaveProp.removeObject(this);
        // 重置内存数据
        SaveProp.initObject(this);
    }
}

export class UserInfoDay {

    //今天的抖音奖励是否可用
    @SaveProp.decorator(true)
    dyRewardEnable: boolean;

    //每日金币奖励
    // @SaveProp.decorator(true)
    // goldReward: boolean;

    //每日钻石奖励
    @SaveProp.decorator(true)
    diamondReward: boolean;

    //每日抽奖
    @SaveProp.decorator(true)
    wheel: boolean;

    // @SaveProp.decorator(null)
    // shopItems: any[];

    @SaveProp.decorator(null)
    task: any;

    @SaveProp.decorator({})
    achievement: any;

    private _userInfo: UserInfo;

    constructor(userInfo: UserInfo) {
        this._userInfo = userInfo;
        let tag = getTodayDateString();
        if (userInfo.lastLoginTime != tag) {
            SaveProp.removeObject(this, userInfo.lastLoginTime);
        }
        userInfo.lastLoginTime = tag;
        SaveProp.initObject(this, tag);
    }

    isDayEnd() {
        return this._userInfo.lastLoginTime == getTodayDateString();
    }

    clear() {
        SaveProp.removeObject(this, getTodayDateString());
    }

}

//已拥有的装备数据
export interface IUserEquipmentData {
    id: number;
    star: number;
    grade: EquipmentGradeType;
    // 级数
    level: number;
    type: EquipmentType;
    // 套装
    setId: number,
    // icon
    icon: string,
    //当获取时随机生成的id
    uid: string;
}