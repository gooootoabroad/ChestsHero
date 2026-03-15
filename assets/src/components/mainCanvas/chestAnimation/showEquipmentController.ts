import { _decorator, Component, Node } from 'cc';
import { Core } from '../../../global/Core';
import { EquipmentType } from '../../../config/EquipmentConfig';
import { showEquipment } from './showEquipment';
const { ccclass, property } = _decorator;

@ccclass('showEquipmentController')
export class showEquipmentController extends Component {
    @property(Node)
    private gNewNode: Node = null;
    @property(Node)
    private gOldNode: Node = null;
    // 已经穿上的套装件数
    private gSetCount: number[] = [0, 0, 0, 0, 0];

    public init(uid: string) {
        // 先判断下是否是带在身上的，是的话不用展示new节点
        this.initSetCount();
        let dbData = Core.userInfo.equipments.find(e => e.uid === uid);
        let newID = null;
        let oldID = null;
        let targetID = null;
        switch (dbData.type) {
            case EquipmentType.Weapon: {
                targetID = Core.userInfo.equipped.p1;
                break;
            }
            case EquipmentType.Armor: {
                targetID = Core.userInfo.equipped.p2;
                break;
            }
            case EquipmentType.Jewelry: {
                targetID = Core.userInfo.equipped.p3;
                break;
            }
            case EquipmentType.Shoes: {
                targetID = Core.userInfo.equipped.p4;
                break;
            }
        }
        if (targetID) {
            newID = uid;
        } else if (targetID === uid) {
            oldID = uid;
        } else {
            newID = uid;
            oldID = targetID;
        }

        this.gOldNode.active = oldID != null;
        if (oldID) {
            this.gOldNode.getComponent(showEquipment).init(oldID, this.gSetCount);
        }

        this.gNewNode.active = newID != null;
        if (newID) {
            this.gNewNode.getComponent(showEquipment).init(newID, this.gSetCount);
        }
    }

    private initSetCount() {
        if (Core.userInfo.equipped.p1) {
            this.gSetCount[Core.userInfo.equipments.find(e => e.uid === Core.userInfo.equipped.p1).setId - 1] += 1;
        }
        if (Core.userInfo.equipped.p2) {
            this.gSetCount[Core.userInfo.equipments.find(e => e.uid === Core.userInfo.equipped.p2).setId - 1] += 1;
        }
        if (Core.userInfo.equipped.p3) {
            this.gSetCount[Core.userInfo.equipments.find(e => e.uid === Core.userInfo.equipped.p3).setId - 1] += 1;
        }
        if (Core.userInfo.equipped.p4) {
            this.gSetCount[Core.userInfo.equipments.find(e => e.uid === Core.userInfo.equipped.p4).setId - 1] += 1;
        }
    }

    onResolveClick() {
        this.gOldNode.active = false;
        this.gNewNode.active = false;
    }
}

