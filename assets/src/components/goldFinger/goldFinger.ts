import { Component } from "cc";
import { GEventTarget, GEventType } from "../../common/event";
import { Core } from "../../global/Core";
import { GConfig } from "../../config/config";
import { Bundle } from "../../global/bundle";
import { Prefab } from "cc";
import { instantiate } from "cc";
import { UIMgr } from "../../manager/UIMgr";
import { _decorator } from "cc";
import { RunScene } from "../../controller/RunScene";
import { SceneName } from "../../global/IGame";

const { ccclass, property } = _decorator;

@ccclass('goldFinger')
export class goldFinger extends Component {
    public init() {
        if (!GConfig.testing) return;
        this.node.parent = UIMgr.instance.persistParent;
        this.node.active = GConfig.testing;
    }

    // 清除数据库
    private clearDB() {
        Core.userInfo.clear();
        RunScene.show(SceneName.Start);
    }

    private AddMoney() {
        Core.userInfo.diamond += 10000;
        GEventTarget.emit(GEventType.GEventDiamondChange);
    }
}