import { _decorator, Component, Node } from 'cc';
import { Core } from '../../../global/Core';
import { equitmentItem } from './equitmentItem';
import { getUserProp } from '../../../manager/User';
import { Label } from 'cc';
import { numberToString } from '../../../utils/string';
import { GEventTarget, GEventType } from '../../../common/event';
const { ccclass, property } = _decorator;

@ccclass('chestController')
export class chestController extends Component {
    @property(Node)
    private gLayoutNode: Node = null;
    @property(Label)
    private gCombatLabel: Label = null;
    @property(Node)
    private gPropInfo: Node = null;
    protected onEnable(): void {
        GEventTarget.on(GEventType.GeventEquipmentUpdate, this.init, this);
    }

    protected onDisable(): void {
        GEventTarget.off(GEventType.GeventEquipmentUpdate, this.init, this);
    }

    init() {
        // 初始化身上的装备
        Core.userInfo.equipped.forEach((uid, index) => {
            if (!uid) return;
            let dbInfo = Core.userInfo.equipments.find(e => e.uid == uid);
            if (!dbInfo) return;
            this.gLayoutNode.children[index].getComponent(equitmentItem).init(dbInfo);
        });

        // 初始化战斗力
        // 初始化属性
        let userProp = getUserProp();
        this.gCombatLabel.string = numberToString(userProp.combat);
        this.gPropInfo.children[0].children[1].getComponent(Label).string = numberToString(userProp.attack);
        this.gPropInfo.children[1].children[1].getComponent(Label).string = numberToString(userProp.hp);
        this.gPropInfo.children[2].children[1].getComponent(Label).string = numberToString(userProp.def);
        this.gPropInfo.children[3].children[1].getComponent(Label).string = numberToString(userProp.speed);
    }

    protected start(): void {
        this.init();
    }
}

