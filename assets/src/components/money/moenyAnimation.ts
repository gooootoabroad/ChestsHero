import { _decorator, Component, Node } from 'cc';
import { Bundle } from '../../global/bundle';
import { Prefab } from 'cc';
import { instantiate } from 'cc';
import { UIMgr } from '../../manager/UIMgr';
import { tween } from 'cc';
import { v3 } from 'cc';
import { AudioMgr } from '../../manager/AudioMgr';
import { AudioClip } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('moenyAnimation')
export class moenyAnimation extends Component {

    static show(icon: Node, callback: Function) {
        let prefab = Bundle.mainCanvas.get("prefabs/money/MoneyAddAnim", Prefab);
        let node = instantiate(prefab);
        node.parent = UIMgr.instance.topParent;
        let script = node.getComponent(moenyAnimation);
        script.open(icon, callback);
        return script

    }

    public open(icon: Node, callback: Function) {
        AudioMgr.inst.playOneShot(Bundle.audio.get('addMoney', AudioClip));
        for (let i = 0; i < 10; i++) {
            let endPos = icon.getWorldPosition();
            let item = instantiate(icon);
            let posX = (Math.random() - 0.5) * 200;
            let posY = (Math.random() - 0.5) * 100;
            item.parent = this.node;
            item.setPosition(0, 0, 0);
            tween(item).to(0.2, { position: v3(posX, posY, 0) }, { easing: 'sineIn' }).delay(0.2).to(0.5, { worldPosition: endPos }, { easing: 'sineInOut' }).call(() => {
                item.destroy();
            }).start();
        }
        this.scheduleOnce(() => {
            callback && callback();
            this.scheduleOnce(() => {
                this.node.destroy();
            });
        }, 0.9);
    }
}

