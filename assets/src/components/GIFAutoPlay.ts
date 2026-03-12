import { _decorator, assetManager, Component, SpriteFrame } from 'cc';
import { GIFController } from './GIFController';
import { Enum } from 'cc';
import { BundleName } from '../global/bundle';
const { ccclass, property } = _decorator;

@ccclass('GIFAutoPlay')
export class GIFAutoPlay extends Component {

    @property({ type: Enum(BundleName) })
    private gBundleName = BundleName.MainCanvas;

    @property
    private gFolderPath = "a";

    // 帧数
    @property
    frame = 15;

    protected start(): void {
        let gif = this.getComponent(GIFController);
        if (!gif) {
            return;
        }
        gif.frame = this.frame;

        let bundle = assetManager.getBundle(this.gBundleName);
        bundle.loadDir(this.gFolderPath, SpriteFrame, (err, data) => {
            let sfs = [...data];
            sfs.sort((a, b) => {
                return Number(a.name) - Number(b.name);
            });
            gif.init([{
                animation: 'a',
                images: sfs
            }]);
            gif.play('a');
        });
    }

}


