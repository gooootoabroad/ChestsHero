import { tween } from 'cc';
import { v3 } from 'cc';
import { Tween } from 'cc';
import { Vec3 } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { Bundle, BundleName } from '../../../global/bundle';
import { GIFController } from '../../GIFController';
import { assetManager } from 'cc';
import { SpriteFrame } from 'cc';
import { Sprite } from 'cc';
import { instantiate } from 'cc';
import { LoadMgr } from '../../../manager/LoadMgr';
import { EquipmentCatalogMgr } from '../../../manager/EquipmentCatalogMgr';
import { EquipmentDropMgr } from '../../../manager/EquipmentDropMgr';
import { Core } from '../../../global/Core';
import { showEquipmentController } from './showEquipmentController';
import { randomUUID } from '../../../utils/string';
const { ccclass, property } = _decorator;

@ccclass('chestAnimation')
export class chestAnimation extends Component {
    private gImageSprite: Sprite = null;
    private _originScale: Vec3 = new Vec3();
    private _originPosY = 0;
    private _originAngle = 0;

    private _running = false;
    private isRotating = false;

    private _breathCount = 0;
    private _nextActionCount = 0;

    // 宝箱旋转动画
    private gBundleName = BundleName.MainCanvas;
    private gFolderPath = "texture/chest/rotate";
    // 帧数
    private gFrame = 15;

    private gGIFController: GIFController = null;

    @property(Node)
    private gShadowNode: Node = null;
    private gIsPlayingShadow: boolean = false;

    @property(Node)
    private gTimeNode: Node = null;

    @property(Node)
    private gStarNode: Node = null;

    @property
    private gMaxOpenTimes = 4;

    @property
    private gMaxStar = 5;

    @property
    private gBaseUpgradeChance = 0.35;

    @property
    private gUpgradeChancePerStar = 0.03;

    @property(showEquipmentController)
    private gShowEquipmentScript: showEquipmentController = null;

    private gRemainingOpenTimes = 0;
    private gCurrentStar = 1;
    private gIsOpening = false;

    private gTimeAvailableFrame: SpriteFrame = null;
    private gTimeUsedFrame: SpriteFrame = null;
    private gStarItemTemplate: Node = null;

    onLoad() {
        this.gImageSprite = this.node.getComponent(Sprite);
        this._originScale = this.node.scale.clone();
        this._originPosY = this.node.position.y;
        this._originAngle = this.node.angle;

        this.gGIFController = this.getComponent(GIFController);
        this.gGIFController.frame = this.gFrame;

        let bundle = assetManager.getBundle(this.gBundleName);
        bundle.loadDir(this.gFolderPath, SpriteFrame, (err, data) => {
            let sfs = [...data];
            sfs.sort((a, b) => {
                return Number(a.name) - Number(b.name);
            });
            this.gGIFController.init([{
                animation: 'a',
                images: sfs
            }]);
        });

        this.gShadowNode.opacity = 0;

        this.node.on(Node.EventType.TOUCH_END, this.onClick, this);

        this.bindSiblingNodes();
    }

    protected onDestroy(): void {
        this.node.off(Node.EventType.TOUCH_END, this.onClick, this);
    }

    start() {
        this.playIdle();
        this.initProgress();
    }

    playIdle() {

        this.stopIdle();

        this._running = true;
        this.isRotating = false;

        this.resetRandomAction();

        this.playBreath();
    }

    stopIdle() {

        this._running = false;

        Tween.stopAllByTarget(this.node);

        // 恢复scale
        this.node.setScale(this._originScale);

        // 恢复位置
        const pos = this.node.position.clone();
        pos.y = this._originPosY;
        this.node.setPosition(pos);

        // 恢复角度
        this.node.setRotationFromEuler(0, 0, this._originAngle);
    }

    private resetRandomAction() {

        this._nextActionCount = Math.floor(Math.random() * 5) + 4;
        this._breathCount = 0;
    }

    private playBreath() {

        if (!this._running) return;

        const longScale = new Vec3(
            this._originScale.x * 1.08,
            this._originScale.y * 0.92,
            this._originScale.z
        );

        const shortScale = new Vec3(
            this._originScale.x * 0.92,
            this._originScale.y * 1.08,
            this._originScale.z
        );

        tween(this.node)
            .to(0.25, { scale: longScale })
            .to(0.25, { scale: this._originScale })
            .to(0.25, { scale: shortScale })
            .to(0.25, { scale: this._originScale })
            .call(() => {

                if (!this._running) return;

                this._breathCount++;

                if (this._breathCount >= this._nextActionCount) {
                    this.playRandomAction();
                } else {
                    this.playBreath();
                }

            })
            .start();
    }

    private playRandomAction() {

        if (!this._running) return;

        const r = Math.random();

        if (r < 0.5) {
            this.playJump();
        } else {
            this.playShake();
        }
    }

    private playJump() {

        if (!this._running) return;

        const jumpHeight = 40;

        const squashScale = new Vec3(
            this._originScale.x * 1.15,
            this._originScale.y * 0.75,
            this._originScale.z
        );

        const stretchScale = new Vec3(
            this._originScale.x * 0.9,
            this._originScale.y * 1.2,
            this._originScale.z
        );

        const posUp = this.node.position.clone();
        posUp.y = this._originPosY + jumpHeight;

        const posDown = this.node.position.clone();
        posDown.y = this._originPosY;

        tween(this.node)

            .to(0.15, { scale: squashScale })

            .to(0.18, {
                position: posUp,
                scale: stretchScale
            })

            .to(0.2, {
                position: posDown,
                scale: this._originScale
            })

            .to(0.1, { scale: squashScale })

            .to(0.1, { scale: this._originScale })

            .call(() => {

                if (!this._running) return;

                this.resetRandomAction();
                this.playBreath();

            })

            .start();
    }

    private playShake() {

        if (!this._running) return;

        tween(this.node)

            .to(0.08, { angle: 8 })
            .to(0.08, { angle: -8 })
            .to(0.08, { angle: 6 })
            .to(0.08, { angle: -6 })
            .to(0.08, { angle: 0 })

            .call(() => {

                if (!this._running) return;

                this.resetRandomAction();
                this.playBreath();

            })

            .start();
    }


    /** 点击宝箱 */
    onClick() {
        if (this.isRotating || this.gIsOpening || !this.gGIFController) {
            return;
        }

        // 前 4 次点击：只做开箱流程与星级成长
        if (this.gRemainingOpenTimes > 0) {
            this.gIsOpening = true;
            this.playRotate(() => {
                this.consumeOneChance();
                this.tryUpgradeStar();
                this.refreshTimeView();
                this.refreshStarView();
                this.gIsOpening = false;
            });
            return;
        }

        // 第 5 次点击：进入出装结算
        this.gIsOpening = true;
        this.playRotate(() => {
            this.handleOpenReward();
            this.initProgress();
            this.playIdle();
            this.gIsOpening = false;
        });
    }

    /** 播放旋转动画 */
    playRotate(onFinish?: () => void) {

        this.isRotating = true;

        this.stopIdle();

        let callback = () => {

            this.playShadow();
            this.isRotating = false;
            // 还原box图片
            LoadMgr.loadSprite(Bundle.mainCanvas, "texture/chest/rotate/0", this.gImageSprite)
            this.playIdle();
            onFinish?.();
        }

        this.gGIFController.play('a', false, callback, true);
    }

    playShadow() {
        if (this.gIsPlayingShadow) return;
        this.gIsPlayingShadow = true;

        this.gShadowNode.scale = v3(1, 1, 1);
        this.gShadowNode.opacity = 150;
        tween(this.gShadowNode).to(0.2, { scale: v3(1.4, 1.4, 1), opacity: 0 }).call(() => {
            this.gShadowNode.scale = v3(1, 1, 1,); this.gIsPlayingShadow = false;
        }).start();
    }

    private bindSiblingNodes() {
        const chestNode = this.node.parent;
        if (!chestNode) {
            return;
        }
        if (!this.gTimeNode) {
            this.gTimeNode = chestNode.getChildByName("Time");
        }
        if (!this.gStarNode) {
            this.gStarNode = chestNode.getChildByName("Star");
        }
    }

    private async initProgress() {
        this.gRemainingOpenTimes = this.gMaxOpenTimes;
        this.gCurrentStar = 1;
        await this.cacheTimeFrames();
        this.cacheStarTemplate();
        this.ensureStarSlots();
        this.refreshTimeView();
        this.refreshStarView();
    }

    private getSortedTimeNodes(): Node[] {
        if (!this.gTimeNode) {
            return [];
        }
        return [...this.gTimeNode.children].sort((a, b) => a.position.x - b.position.x);
    }

    private async cacheTimeFrames() {
        const timeNodes = this.getSortedTimeNodes();
        if (timeNodes.length <= 0) {
            return;
        }

        await LoadMgr.loadSpriteFrame(Bundle.mainCanvas, "texture/ui/time").then((sf) => {
            this.gTimeAvailableFrame = sf;
        });

        await LoadMgr.loadSpriteFrame(Bundle.mainCanvas, "texture/ui/blackTime").then((sf) => {
            this.gTimeUsedFrame = sf;
        });
    }

    private cacheStarTemplate() {
        if (!this.gStarNode || this.gStarNode.children.length <= 0) {
            return;
        }
        this.gStarItemTemplate = this.gStarNode.children[0];
    }

    private ensureStarSlots() {
        if (!this.gStarNode || !this.gStarItemTemplate) {
            return;
        }
        while (this.gStarNode.children.length < this.gMaxStar) {
            const newItem = instantiate(this.gStarItemTemplate);
            newItem.parent = this.gStarNode;
        }
    }

    private refreshTimeView() {
        const timeNodes = this.getSortedTimeNodes();
        if (timeNodes.length <= 0) {
            return;
        }
        const consumed = Math.max(0, this.gMaxOpenTimes - this.gRemainingOpenTimes);
        for (let i = 0; i < timeNodes.length; i++) {
            const sp = timeNodes[i].getComponent(Sprite);
            if (!sp) {
                continue;
            }
            sp.spriteFrame = i < consumed ? this.gTimeUsedFrame : this.gTimeAvailableFrame;
        }
    }

    private refreshStarView() {
        if (!this.gStarNode) {
            return;
        }
        for (let i = 0; i < this.gStarNode.children.length; i++) {
            this.gStarNode.children[i].active = i < this.gCurrentStar;
        }
    }

    private consumeOneChance() {
        this.gRemainingOpenTimes = Math.max(0, this.gRemainingOpenTimes - 1);
    }

    private tryUpgradeStar() {
        if (this.gCurrentStar >= this.gMaxStar) {
            return;
        }
        const chance = this.getUpgradeChance();
        if (Math.random() <= chance) {
            this.gCurrentStar++;
        }
    }

    private getUpgradeChance(): number {
        const starBonus = (this.gCurrentStar - 1) * this.gUpgradeChancePerStar;
        return Math.max(0, Math.min(1, this.gBaseUpgradeChance - starBonus));
    }

    private handleOpenReward() {
        const dropResult = EquipmentDropMgr.roll({
            star: this.gCurrentStar,
            candidatesByType: EquipmentCatalogMgr.getCandidatesByType(),
        });

        console.log('[Chest] reward flow ', {
            currentStar: this.gCurrentStar,
            dropResult,
        });

        let uid = randomUUID();
        // 写入数据库
        Core.userInfo.equipments.push({
            id: dropResult.equipmentId,
            star: 1,
            grade: dropResult.grade,
            level: 1,
            type: dropResult.equipmentType,
            setId: dropResult.setId,
            uid: uid,
            icon: dropResult.icon,
        })

        Core.userInfo.tempEquipmentUID = uid;

        this.gShowEquipmentScript.init(uid);
    }
}
