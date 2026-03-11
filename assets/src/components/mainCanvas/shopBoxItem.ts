import { _decorator, Component, Node } from 'cc';
import { getChest } from './getChest';
import { GPlatform } from '../../platform/platform';
import { VideoAdType } from '../../platform/type';
import { Core } from '../../global/Core';
import { moneyAD } from '../ad/moneyAD';
import { GEventTarget, GEventType } from '../../common/event';
const { ccclass, property } = _decorator;

const costDiamondCount = 1000;
const diamondPirzeCount = 10;

@ccclass('shopBoxItem')
export class shopBoxItem extends Component {
    private gIsRunning: boolean = false;

    onADClick() {
        if (this.gIsRunning) return;
        this.gIsRunning = true;

        let onSuccess = () => {
            this.showAnimation();
        }

        let onFinally = () => {
            this.gIsRunning = false;
        }

        GPlatform.showVideoAd(VideoAdType.Common, onSuccess, onFinally);
    }

    onBuyClick() {
        if (this.gIsRunning) return;
        this.gIsRunning = true;

        if (Core.userInfo.diamond < costDiamondCount) {
            moneyAD.show();
            this.gIsRunning = false;
            return;
        }

        Core.userInfo.diamond -= costDiamondCount;
        GEventTarget.emit(GEventType.GeventDiamondChange);
        this.gIsRunning = false;
        this.showAnimation();
    }

    private showAnimation() {
        getChest.show(diamondPirzeCount);
    }
}

