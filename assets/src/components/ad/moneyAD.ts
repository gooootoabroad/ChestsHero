import { _decorator, Component, Node } from 'cc';
import { Bundle } from '../../global/bundle';
import { Prefab } from 'cc';
import { instantiate } from 'cc';
import { UIMgr } from '../../manager/UIMgr';
import { showOpenNode } from '../../utils/show';
import { Core } from '../../global/Core';
import { GEventTarget, GEventType } from '../../common/event';
import { GPlatform } from '../../platform/platform';
import { VideoAdType } from '../../platform/type';
const { ccclass, property } = _decorator;

@ccclass('moneyAD')
export class moneyAD extends Component {
    @property(Node)
    private gCanvasNode: Node = null;
    // 是否正在处理广告
    private gIsRunning: boolean = false;

    private gDefaultCount: number = 2000;

    static show() {
        let prefab = Bundle.mainCanvas.get('prefabs/money/AD', Prefab);
        let node = instantiate(prefab);
        node.parent = UIMgr.instance.dialogParent;
        node.getComponent(moneyAD).open();
    }

    public open() {
        showOpenNode(this.gCanvasNode);
    }

    private onCloseClicked() {
        this.node.destroy();
    }

    private onBuyClicked() {
        if (this.gIsRunning) return;
        this.gIsRunning = true;
        let isSuccessed = false;

        let onSuccess = () => {
            Core.userInfo.diamond += this.gDefaultCount;
            GEventTarget.emit(GEventType.GEventDiamondChange);
            isSuccessed = true;
        }

        let onFinally = () => {
            this.gIsRunning = false;
            if (isSuccessed) {
                this.onCloseClicked();
            }
        }

        GPlatform.showVideoAd(VideoAdType.Common, onSuccess, onFinally);
    }
}

