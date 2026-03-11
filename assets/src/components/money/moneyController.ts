import { Label } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { Core } from '../../global/Core';
import { numberToString } from '../../utils/string';
import { GEventTarget, GEventType } from '../../common/event';
import { moneyAD } from '../ad/moneyAD';
import { moenyAnimation } from './moenyAnimation';
const { ccclass, property } = _decorator;

@ccclass('moneyController')
export class moneyController extends Component {
    @property(Label)
    private gDiamondLabel: Label = null;
    @property(Node)
    private gDiamondIconNode: Node = null;

    // 当前钻石
    private gCurrentDiamondCount = -1;
    // 是否在做动画
    private gIsPlayingAnimation: boolean = false;

    protected start(): void {
        this.updateDiamondLabel();
        GEventTarget.on(GEventType.GeventDiamondChange, this.updateDiamondLabel, this);
    }

    protected onDisable(): void {
        GEventTarget.off(GEventType.GeventDiamondChange, this.updateDiamondLabel, this);
    }

    private updateDiamondLabel() {
        let count = Core.userInfo.diamond;
        this.gDiamondLabel.string = numberToString(count);
        if (this.gCurrentDiamondCount == -1 || this.gCurrentDiamondCount >= count || this.gIsPlayingAnimation) {
            this.gCurrentDiamondCount = count;
            return;
        }

        this.gIsPlayingAnimation = true;
        // 增加了钻石，做动画
        this.gCurrentDiamondCount = count;

        moenyAnimation.show(this.gDiamondIconNode, () => {
            this.gIsPlayingAnimation = false;
        }).node;
    }

    private onAddDiamondClick() {
        moneyAD.show();
    }

}

