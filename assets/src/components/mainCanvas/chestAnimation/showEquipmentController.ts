import { _decorator, Component, Node } from 'cc';
import { Core } from '../../../global/Core';
import { showEquipment } from './showEquipment';
import { getResolveEquipmentReward } from '../../../manager/EquipmentUpgradeMgr';
import { GEventTarget, GEventType } from '../../../common/event';
const { ccclass, property } = _decorator;

@ccclass('showEquipmentController')
export class showEquipmentController extends Component {
    @property(Node)
    private gNewNode: Node = null;
    @property(Node)
    private gOldNode: Node = null;
    // 已经穿上的套装件数
    private gSetCount: number[] = [0, 0, 0, 0, 0];

    private gIsDealing: boolean = false;

    public init(uid: string) {
        // 先判断下是否是带在身上的，是的话不用展示new节点
        this.gIsDealing = false;
        this.initSetCount();
        let dbData = Core.userInfo.equipments.find(e => e.uid === uid);
        let newID = null;
        let oldID = null;
        let targetID = null;
        targetID = Core.userInfo.equipped[dbData.type - 1];
        if (!targetID) {
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
        this.gSetCount = [0, 0, 0, 0];
        Core.userInfo.equipped.forEach((uid) => {
            if (!uid) return;
            this.gSetCount[Core.userInfo.equipments.find(e => e.uid === uid).setId - 1] += 1;
        })
    }

    private close() {
        this.gNewNode.active = false;
        this.gOldNode.active = false;
        this.gIsDealing = false;
    }

    onResolveClick() {
        if (this.gIsDealing) return;
        this.gIsDealing = true;
        // 获取当前临时装备
        let uid = Core.userInfo.tempEquipmentUID;
        if (!uid) {
            this.close();
            return;
        }

        // 获取装备具体信息
        let dbEquipmentInfo = Core.userInfo.equipments.find(e => e.uid == uid);
        if (!dbEquipmentInfo) {
            this.close();
            return;
        }

        let diamond = getResolveEquipmentReward(dbEquipmentInfo.grade, dbEquipmentInfo.level);
        console.log("before ", Core.userInfo.diamond)
        Core.userInfo.diamond += diamond;
        console.log("after ", Core.userInfo.diamond)
        GEventTarget.emit(GEventType.GEventDiamondChange);
        let index = Core.userInfo.equipments.findIndex(e => e.uid === uid);
        if (index !== -1) {
            Core.userInfo.equipments.splice(index, 1);
        }
        Core.userInfo.tempEquipmentUID = null;

        this.close();
    }

    onReplaceClick() {
        if (this.gIsDealing) return;
        this.gIsDealing = true;
        // 获取当前临时装备
        let uid = Core.userInfo.tempEquipmentUID;
        if (!uid) {
            this.close();
            return;
        }

        // 获取装备具体信息
        let dbEquipmentInfo = Core.userInfo.equipments.find(e => e.uid == uid);
        if (!dbEquipmentInfo) {
            this.close();
            return;
        }



        // 如果对应位置没有装备，则直接装备上
        let targetUID = Core.userInfo.equipped[dbEquipmentInfo.type - 1];
        Core.userInfo.equipped[dbEquipmentInfo.type - 1] = uid;
        if (!targetUID) {
            Core.userInfo.tempEquipmentUID = null;
            GEventTarget.emit(GEventType.GeventEquipmentUpdate, uid, dbEquipmentInfo.type);
            return this.close();
        }

        // 有装备，需要显示对调
        Core.userInfo.tempEquipmentUID = targetUID;
        GEventTarget.emit(GEventType.GeventEquipmentUpdate, uid, dbEquipmentInfo.type);
        // 刷新装备显示
        this.init(targetUID);
    }
}

