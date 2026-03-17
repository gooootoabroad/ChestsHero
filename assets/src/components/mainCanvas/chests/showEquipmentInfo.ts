import { Label } from 'cc';
import { Sprite } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { IUserEquipmentData } from '../../../global/UserInfo';
import { EquipmentType, IEquipmentConfig } from '../../../config/EquipmentConfig';
import { IEquipmentGradeConfig } from '../../../config/EquipmentGradeConfig';
import { Core } from '../../../global/Core';
import { EquipmentCatalogMgr } from '../../../manager/EquipmentCatalogMgr';
import { Bundle } from '../../../global/bundle';
import { EquipmentGradeMgr } from '../../../manager/EquipmentGradeMgr';
import { LoadMgr } from '../../../manager/LoadMgr';
import { Color } from 'cc';
import { calcEquipmentUpgradeDiamond, calcWeightedValue } from '../../../config/EquipmentCalc';
import { numberToString } from '../../../utils/string';
import { EquipmentSuitMgr } from '../../../manager/EquipmentSuitMgr';
import { Prefab } from 'cc';
import { instantiate } from 'cc';
import { UIMgr } from '../../../manager/UIMgr';
import { moneyAD } from '../../ad/moneyAD';
import { showOpenNode } from '../../../utils/show';
import { GEventTarget, GEventType } from '../../../common/event';
import { getEquipmentCombat } from '../../../manager/User';
const { ccclass, property } = _decorator;

@ccclass('showEquipmentInfo')
export class showEquipmentInfo extends Component {
    /* icon */
    @property(Sprite)
    private gIconSprite: Sprite = null;
    @property(Sprite)
    private gIconImageSprite: Sprite = null;
    @property(Label)
    private gIconGradeLabel: Label = null;
    @property(Label)
    private gIconTypeLabel: Label = null;
    @property(Label)
    private gTitleLabel: Label = null;
    @property(Label)
    private gCombatLabel: Label = null;
    /* 升级消耗*/
    @property(Label)
    private gCostLabel: Label = null;
    // 偷懒
    private gradeLabelColor: string = "";

    /* info left*/
    @property(Node)
    private gInfoLeftNode: Node = null;

    /* info right*/
    @property(Node)
    private gInfoRightNode: Node = null;

    /* */
    private gDBEquipmentData: IUserEquipmentData = null;
    private gEquipmentBasicData: IEquipmentConfig = null;
    private gGradeData: IEquipmentGradeConfig = null;
    // 已经穿上的套装件数
    private gSetCount: number[] = [0, 0, 0, 0, 0];

    private gIsDealing: boolean = false;

    static show(dbData: IUserEquipmentData) {
        let prefab = Bundle.mainCanvas.get('prefabs/chest/EquipmentInfo', Prefab);
        let node = instantiate(prefab);
        node.parent = UIMgr.instance.dialogParent;
        node.getComponent(showEquipmentInfo).open(dbData);
    }

    public open(dbData: IUserEquipmentData) {
        showOpenNode(this.node.children[1], () => { this.init(dbData) });
    }

    private init(dbData: IUserEquipmentData, isRefresh: boolean = false) {
        this.gIsDealing = false;
        // 获取装备信息
        this.gDBEquipmentData = dbData;
        this.gEquipmentBasicData = EquipmentCatalogMgr.getEquipmentBasicInfo(this.gDBEquipmentData.id, this.gDBEquipmentData.type);
        this.gGradeData = EquipmentGradeMgr.getGradeBasicInfo(this.gDBEquipmentData.grade);
        if (!isRefresh) {
            this.initSetCount();
            this.initIcon();
        }
        this.initLeftInfo();
        this.initRightInfo();
        this.initCost();
        this.gCombatLabel.string = numberToString(getEquipmentCombat(dbData.uid));
    }

    private initSetCount() {
        Core.userInfo.equipped.forEach((uid) => {
            if (!uid) return;
            this.gSetCount[Core.userInfo.equipments.find(e => e.uid === uid).setId - 1] += 1;
        })
    }

    private initIcon() {
        let bgName: string;
        [bgName, this.gradeLabelColor] = EquipmentGradeMgr.getGradeBackgroundInfo(this.gDBEquipmentData.grade);
        LoadMgr.loadSprite(Bundle.mainCanvas, bgName, this.gIconSprite);
        LoadMgr.loadSprite(Bundle.mainCanvas, `texture/equipments/${this.gEquipmentBasicData.ico}`, this.gIconImageSprite);

        this.gIconGradeLabel.color = new Color().fromHEX(this.gradeLabelColor);
        this.gIconGradeLabel.string = this.gGradeData.name;
        let typeString = "";
        switch (this.gEquipmentBasicData.type) {
            case EquipmentType.Weapon:
                typeString = "武器";
                break;
            case EquipmentType.Armor:
                typeString = "上衣";
                break;
            case EquipmentType.Jewelry:
                typeString = "首饰";
                break;
            case EquipmentType.Shoes:
                typeString = "鞋子";
                break;
        }
        this.gIconTypeLabel.string = typeString;
    }

    private initLeftInfo() {
        // 偷懒按照节点顺序写了
        let label = this.gInfoLeftNode.children[0].getComponent(Label);
        label.color = new Color().fromHEX(this.gradeLabelColor);
        label.string = `${this.gEquipmentBasicData.name} Lv${this.gDBEquipmentData.level}`;
        this.gTitleLabel.color = label.color;
        this.gTitleLabel.string = this.gEquipmentBasicData.name;
        let basicInfo = calcWeightedValue(this.gEquipmentBasicData.statWeights, this.gGradeData.baseStatBudget);
        let upgradeInfo = calcWeightedValue(this.gEquipmentBasicData.statWeights, this.gGradeData.growthStatBudget * (this.gDBEquipmentData.level - 1));
        this.updateProp(this.gInfoLeftNode.children[1], basicInfo.damage, upgradeInfo.damage);
        this.updateProp(this.gInfoLeftNode.children[2], basicInfo.hp, upgradeInfo.hp);
        this.updateProp(this.gInfoLeftNode.children[3], basicInfo.defense, upgradeInfo.defense);
        this.updateProp(this.gInfoLeftNode.children[4], basicInfo.agility, upgradeInfo.agility);

    }

    private updateProp(node: Node, basic: number, upgrad: number) {
        node.children[1].getComponent(Label).string = numberToString(basic);
        if (node.children.length < 3) return;
        node.children[2].active = upgrad > 0;
        if (upgrad == 0) return;
        node.children[2].getComponent(Label).string = `+${numberToString(upgrad)}`;
    }

    private initRightInfo() {
        // 套装
        let suitInfo = EquipmentSuitMgr.getSuitBasicInfo(this.gEquipmentBasicData.setId);
        this.gInfoRightNode.children[0].children[0].getComponent(Label).string = suitInfo.name;
        let suitLabel = this.gInfoRightNode.children[0].children[1].getComponent(Label);
        let suitColor = "#525252";
        if (this.gSetCount[suitInfo.id - 1] == 4) {
            suitColor = "#000000";
        }
        suitLabel.color = new Color().fromHEX(suitColor);
        suitLabel.string = `【${this.gSetCount[suitInfo.id - 1]}/4】套装效果：${suitInfo.setSkill}`;

        // 星级
        this.gInfoRightNode.children[1].active = this.gEquipmentBasicData.starSkills.length != 0;
        if (this.gEquipmentBasicData.starSkills.length == 0) return;

        // 星星
        for (let i = 0; i < this.gDBEquipmentData.star; i++) {
            let node = this.gInfoRightNode.children[1].children[1].children[i];
            node.active = true;
            node.getComponent(Sprite).color = new Color().fromHEX("#FFFFFF");
            let desNode = this.gInfoRightNode.children[1].children[2 + i];
            desNode.active = true;
            let desLabel = desNode.getComponent(Label);
            desLabel.color = new Color().fromHEX("#000000");
            desLabel.string = `${i + 1}星：${this.gEquipmentBasicData.starSkills[i]}`
        }
        for (let i = this.gDBEquipmentData.star; i < this.gEquipmentBasicData.starSkills.length; i++) {
            let node = this.gInfoRightNode.children[1].children[1].children[i];
            node.active = true;
            node.getComponent(Sprite).color = new Color().fromHEX("#665C5C");
            let desNode = this.gInfoRightNode.children[1].children[2 + i];
            desNode.active = true;
            let desLabel = desNode.getComponent(Label);
            desLabel.color = new Color().fromHEX("#525252");
            desLabel.string = `${i + 1}星：${this.gEquipmentBasicData.starSkills[i]}`
        }
        for (let i = this.gEquipmentBasicData.starSkills.length; i < 5; i++) {
            this.gInfoRightNode.children[1].children[1].children[i].active = false;
            this.gInfoRightNode.children[1].children[2 + i].active = false;
        }
    }

    private initCost() {
        this.gCostLabel.string = numberToString(calcEquipmentUpgradeDiamond(this.gGradeData, this.gDBEquipmentData.level));
    }

    private onUpgradeClick() {
        if (this.gIsDealing) return;
        this.gIsDealing = true;
        // 判断钱够不够
        let cost = calcEquipmentUpgradeDiamond(this.gGradeData, this.gDBEquipmentData.level);
        if (Core.userInfo.diamond < cost) {
            // 钱不够
            moneyAD.show();
            this.gIsDealing = false;
            return;
        }

        Core.userInfo.diamond -= cost;
        let item = Core.userInfo.equipments.find(e => e.uid === this.gDBEquipmentData.uid);
        if (item) {
            item.level += 1;
            Core.userInfo.equipments = Core.userInfo.equipments;
        }

        // 刷新
        this.init(item, true);
        GEventTarget.emit(GEventType.GeventEquipmentUpdate, this.gDBEquipmentData.uid, this.gDBEquipmentData.type);
    }

    private onCloseClick() {
        this.node.destroy();
    }
}

