import { Label } from 'cc';
import { _decorator, Component } from 'cc';
import { numberToString } from '../../utils/string';
import { Bundle } from '../../global/bundle';
import { Core } from '../../global/Core';
import { Prefab } from 'cc';
import { instantiate } from 'cc';
import { UIMgr } from '../../manager/UIMgr';
const { ccclass, property } = _decorator;

@ccclass('getChest')
export class getChest extends Component {
    @property(Label)
    private gValueLabel: Label = null;

    static show(count: number) {
        let prefab = Bundle.mainCanvas.get("prefabs/chest/GetChest", Prefab);
        let node = instantiate(prefab);
        node.parent = UIMgr.instance.dialogParent;

        let comp = node.getComponent(getChest);
        comp.open(count);

        return comp;
    }

    protected open(count: number) {
        this.gValueLabel.string = `x${numberToString(count)}`;
        Core.userInfo.chestCount += count;
    }

    onConfirmClick() {
        this.node.destroy();
    }
}

