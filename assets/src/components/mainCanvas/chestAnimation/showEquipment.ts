import { _decorator, Component, Node } from 'cc';
import { Core } from '../../../global/Core';
import { EquipmentCatalogMgr } from '../../../manager/EquipmentCatalogMgr';
import { Sprite } from 'cc';
import { Label } from 'cc';
import { EquipmentType, IEquipmentConfig } from '../../../config/EquipmentConfig';
import { LoadMgr } from '../../../manager/LoadMgr';
import { Bundle } from '../../../global/bundle';
import { IUserEquipmentData } from '../../../global/UserInfo';
import { EquipmentGradeType, IEquipmentGradeConfig } from '../../../config/EquipmentGradeConfig';
import { Color } from 'cc';
import { numberToString } from '../../../utils/string';
import { EquipmentGradeMgr } from '../../../manager/EquipmentGradeMgr';
import { calcWeightedValue } from '../../../config/EquipmentCalc';
import { EquipmentSuitMgr } from '../../../manager/EquipmentSuitMgr';
const { ccclass, property } = _decorator;

@ccclass('showEquipment')
export class showEquipment extends Component {
    /* icon */
    @property(Sprite)
    private gIconSprite: Sprite = null;
    @property(Sprite)
    private gIconImageSprite: Sprite = null;
    @property(Label)
    private gIconGradeLabel: Label = null;
    @property(Label)
    private gIconTypeLabel: Label = null;
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

    public init(uid: string, setCount: number[]) {
        this.gSetCount = setCount;
        // 获取装备信息
        this.gDBEquipmentData = Core.userInfo.equipments.find(e => e.uid === uid);
        this.gEquipmentBasicData = EquipmentCatalogMgr.getEquipmentBasicInfo(this.gDBEquipmentData.id, this.gDBEquipmentData.type);
        this.gGradeData = EquipmentGradeMgr.getGradeBasicInfo(this.gDBEquipmentData.grade);
        this.initIcon();
        this.initLeftInfo();
        this.initRightInfo();
    }

    private initIcon() {
        let bgName = "texture/ui/equipment-bg";
        switch (this.gDBEquipmentData.grade) {
            case EquipmentGradeType.C:
            case EquipmentGradeType.B:
                bgName += "0";
                this.gradeLabelColor = "#48CC58";
                break;
            case EquipmentGradeType.A:
                bgName += "1";
                this.gradeLabelColor = "#E7B127";
                break;
            case EquipmentGradeType.S:
                bgName += "2";
                this.gradeLabelColor = "#FF5E5E";
                break;
        }

        LoadMgr.loadSpriteFrame(Bundle.mainCanvas, bgName).then((sf) => {
            this.gIconSprite.spriteFrame = sf;
        });

        LoadMgr.loadSpriteFrame(Bundle.mainCanvas, `texture/equipments/${this.gEquipmentBasicData.ico}`).then((sf) => {
            this.gIconImageSprite.spriteFrame = sf;
        });

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
        node.children[2].getComponent(Label).string = numberToString(upgrad);
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
}

