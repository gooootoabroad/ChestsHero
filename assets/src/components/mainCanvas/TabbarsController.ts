import { tween } from 'cc';
import { Vec3 } from 'cc';
import { v2 } from 'cc';
import { EventTouch } from 'cc';
import { v3 } from 'cc';
import { Prefab } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { AudioMgr } from '../../manager/AudioMgr';
import { Bundle } from '../../global/bundle';
import { AudioClip } from 'cc';
import { instantiate } from 'cc';
const { ccclass, property } = _decorator;

// 全局存放坐标
const v2_1 = v2();

@ccclass('TabbarItem')
class TabbarItem {
    @property(Prefab)
    ItemPrefab: Prefab;

    // 对应prefab加载出来的界面
    node: Node;
}

@ccclass('TabbarsController')
export class TabbarsController extends Component {
    @property(Node)
    private gTabbarsNode: Node = null;
    @property(Node)
    private gContainerNode: Node = null;


    @property(TabbarItem)
    private gItemsInfo: TabbarItem[] = [];

    // 选中节点
    private gSelectedIndex: number = 0;

    protected start(): void {
        // this.gTabbarsNode.children.forEach((child, index) => {
        //     this.gItemsInfo[index].node = child;
        // })

        // 设置默认选中节点
        this.gSelectedIndex = Math.floor(this.gTabbarsNode.children.length / 2);
        this.updateSelectItem();
        this.gTabbarsNode.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    protected onDisable(): void {
        this.gTabbarsNode?.off(Node.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    private updateSelectItem() {
        let durtaion = 0.2;
        this.gTabbarsNode.children.forEach((child, index) => {
            let isSelected = index == this.gSelectedIndex;
            let background = child.getChildByName("Background");
            let scaleX = isSelected ? 1.3 : 1;
            let scaleY = isSelected ? 1.1 : 1;
            let backgroundScale = v3(scaleX, scaleY, 1);
            let backgroundOpacity = isSelected ? 255 : 0;
            let icon = child.getChildByName("Icon");
            scaleX = isSelected ? 1.2 : 1;
            scaleY = isSelected ? 1.2 : 1;
            let iconScale = v3(scaleX, scaleY, 1);
            let iconY = isSelected ? 60 : 0;
            let iconPos = v3(icon.position.x, iconY, 0);
            let title = child.getChildByName("Title");
            scaleX = isSelected ? 1 : 0;
            scaleY = isSelected ? 1 : 0;
            let titleScale = v3(scaleX, scaleY, 1);
            // 做动画
            tween(background).to(durtaion, { scale: backgroundScale, opacity: backgroundOpacity }).start();
            tween(icon).to(durtaion, { scale: iconScale, position: iconPos }).start();
            // 如果是选中，需要先将title展示出来
            if (isSelected) {
                title.active = true;
            }
            tween(title).to(durtaion, { scale: titleScale }).call(() => { title.active = isSelected }).start();
        })

        this.loadPrefab();
    }

    private onTouchEnd(event: EventTouch) {
        let screenPoint = event.getLocation(v2_1);
        let windowId = event.windowId;
        for (let i = 0; i < this.gTabbarsNode.children.length; i++) {
            const node = this.gTabbarsNode.children[i].getChildByName("Background");
            if (node.uiTransfrom.hitTest(screenPoint, windowId)) {
                AudioMgr.inst.playOneShot(Bundle.audio.get('press', AudioClip));
                if (this.gSelectedIndex !== i) {
                    this.gSelectedIndex = i;
                    this.updateSelectItem();
                }
                break;
            }
        }
    }

    private loadPrefab() {
        let selectInfo = this.gItemsInfo[this.gSelectedIndex];
        if (!selectInfo.node) {
            if (!selectInfo.ItemPrefab) return;
            selectInfo.node = instantiate(selectInfo.ItemPrefab);
            selectInfo.node.parent = this.gContainerNode;
        }

        // 设置优先级
        selectInfo.node.setSiblingIndex(-1);

        // 关闭其他节点
        for (let i = 0; i < this.gItemsInfo.length; i++) {
            const item = this.gItemsInfo[i];
            if (item.node) {
                item.node.active = i === this.gSelectedIndex;
            }
        }
    }
}

