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
import { LoadMgr } from '../../../manager/LoadMgr';
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
    }

    protected onDestroy(): void {
        this.node.off(Node.EventType.TOUCH_END, this.onClick, this);
    }

    start() {
        this.playIdle();
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
        if (this.isRotating || !this.gGIFController) return;

        this.playRotate();
    }

    /** 播放旋转动画 */
    playRotate() {

        this.isRotating = true;

        this.stopIdle();

        let callback = () => {
            // 还原box图片
            LoadMgr.loadSpriteFrame(Bundle.mainCanvas, "texture/chest/rotate/0").then((sf) => {
                this.gImageSprite.spriteFrame = sf;
            });
            this.playShadow();
            this.isRotating = false;
            this.playIdle();
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
}


