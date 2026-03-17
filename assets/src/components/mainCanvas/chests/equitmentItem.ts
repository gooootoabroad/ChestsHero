import { Sprite } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { UISprite } from '../../UISprite';
import { Label } from 'cc';
import { IUserEquipmentData } from '../../../global/UserInfo';
import { EquipmentGradeMgr } from '../../../manager/EquipmentGradeMgr';
import { LoadMgr } from '../../../manager/LoadMgr';
import { Bundle } from '../../../global/bundle';
import { Color } from 'cc';
import { GEventTarget, GEventType } from '../../../common/event';
import { Core } from '../../../global/Core';
import { EquipmentGradeType } from '../../../config/EquipmentGradeConfig';
import { ParticleMoveController } from './ParticleMoveController';
import { Enum } from 'cc';
import { EquipmentType } from '../../../config/EquipmentConfig';
import { showEquipmentInfo } from './showEquipmentInfo';
const { ccclass, property } = _decorator;

@ccclass('equitmentItem')
export class equitmentItem extends Component {
    @property(Sprite)
    private gBackgroundSprite: Sprite = null;
    @property(UISprite)
    private gIconSprite: UISprite = null;
    @property(Node)
    private gEmptyNode: Node = null;
    @property(Label)
    private gLevel: Label = null;
    @property(Label)
    private gGrade: Label = null;

    @property({ type: Enum(EquipmentType) })
    private gType: EquipmentType = EquipmentType.Weapon;

    private gUID: string = null;
    private isDealing: boolean = false;

    init(data: IUserEquipmentData) {
        if (!data) return;

        this.gEmptyNode.active = false;
        this.gUID = data.uid;
        // 处理背景图
        let bgName = "";
        let gradeColor = "";
        [bgName, gradeColor] = EquipmentGradeMgr.getGradeBackgroundInfo(data.grade);
        LoadMgr.loadSprite(Bundle.mainCanvas, bgName, this.gBackgroundSprite);
        this.gGrade.color = new Color().fromHEX(gradeColor);
        this.gGrade.string = EquipmentGradeMgr.getGradeName(data.grade);
        this.gLevel.string = `Lv.${data.level}`;
        LoadMgr.loadSprite(Bundle.mainCanvas, `texture/equipments/${data.icon}`, this.gIconSprite);
        this.node.getComponent(ParticleMoveController).enabled = data.grade == EquipmentGradeType.S;
    }

    protected onEnable(): void {
        GEventTarget.on(GEventType.GeventEquipmentUpdate, this._onEquipmentUpdate, this);
    }

    protected onDisable(): void {
        GEventTarget.off(GEventType.GeventEquipmentUpdate, this._onEquipmentUpdate, this);
    }

    private _onEquipmentUpdate(uid: string, type: EquipmentType) {
        if (type != this.gType) return;
        let item = Core.userInfo.equipments.find(v => v.uid === uid);
        item && this.init(item);
    }

    onEquipmentClick() {
        if (!this.gUID || this.isDealing) return;
        this.isDealing = true;
        showEquipmentInfo.show(Core.userInfo.equipments.find(v => v.uid === this.gUID));
        this.isDealing = false;
    }
}

