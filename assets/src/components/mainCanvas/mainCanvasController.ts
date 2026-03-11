import { _decorator, Component, Node } from 'cc';
import { goldFinger } from '../goldFinger/goldFinger';
const { ccclass, property } = _decorator;

@ccclass('mainCanvasController')
export class mainCanvasController extends Component {
    @property(goldFinger)
    private gGoldFinger: goldFinger = null;

    start() {
        this.gGoldFinger.init();
    }

    update(deltaTime: number) {

    }
}

