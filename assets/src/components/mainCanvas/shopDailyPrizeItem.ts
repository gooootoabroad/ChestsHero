import { Label } from 'cc';
import { Enum } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { Core } from '../../global/Core';
import { numberToString } from '../../utils/string';
import { GEventTarget, GEventType } from '../../common/event';
const { ccclass, property } = _decorator;

const addDiamondValue = 2000;

export enum MoneyEnum {
    //Gold,
    Diamond
}

@ccclass('shopDailyPrizeItem')
export class shopDailyPrizeItem extends Component {
    @property({ type: Enum(MoneyEnum) })
    private gMoneyType = MoneyEnum.Diamond;

    @property(Node)
    private gMaskNode: Node = null;
    @property(Label)
    private gTipLabel: Label = null;
    @property(Label)
    private gValueLabel: Label = null;

    // 能否点击
    private gCanBuy: boolean = false;

    start() {
        this.load();
    }

    private load() {
        this.gCanBuy = false;
        let value = 0;
        if (this.gMoneyType === MoneyEnum.Diamond) {
            this.gCanBuy = Core.userInfo.day.diamondReward;
            value = addDiamondValue;
        }

        this.gMaskNode.active = !this.gCanBuy;
        this.gTipLabel.string = this.gCanBuy ? '免费' : '明天再来吧';
        this.gValueLabel.string = numberToString(value);
    }

    private onClicked() {
        if (!this.gCanBuy) return;
        if (this.gMoneyType === MoneyEnum.Diamond) {
            Core.userInfo.day.diamondReward = false;
            Core.userInfo.diamond += addDiamondValue;
            GEventTarget.emit(GEventType.GEventDiamondChange);
        }

        // 更新ui
        this.load();
    }
}

