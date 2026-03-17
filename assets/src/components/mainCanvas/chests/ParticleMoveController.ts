import { _decorator, Component, Node, ParticleSystem2D, rect, Tween, tween, v3, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ParticleMoveController')
export class ParticleMoveController extends Component {

    @property
    speed = 200;

    private _tweens: Tween<Node>[] = [];

    private gNode1: Node = null;
    private gNode2: Node = null;

    protected onEnable(): void {
        this._stopTween();
        let particles = this.getComponentsInChildren(ParticleSystem2D);
        if (particles.length === 0) {
            return;
        }
        for (const p of particles) {
            p.resetSystem();
        }
        this.gNode1 = particles[0]?.node;
        this.gNode2 = particles[1]?.node;
        this.gNode1.active = true;
        this.gNode2.active = true;

        let contentSize = this.node.uiTransfrom.contentSize;
        let { width, height } = contentSize;
        let anchorPoint = this.node.uiTransfrom.anchorPoint;
        let box = rect(-anchorPoint.x * width, -anchorPoint.y * height, width, height);
        let speed = this.speed;
        let pos1 = v3(box.xMax, box.yMax, 0);
        let pos2 = v3(box.xMin, box.yMax, 0);
        let pos3 = v3(box.xMin, box.yMin, 0);
        let pos4 = v3(box.xMax, box.yMin, 0);
        if (!!this.gNode1) {
            this.gNode1.setPosition(pos1);
            let t = tween(this.gNode1)
                .to(Vec3.distance(pos1, pos2) / speed, { position: pos2.clone() })
                .to(Vec3.distance(pos2, pos3) / speed, { position: pos3.clone() })
                .to(Vec3.distance(pos3, pos4) / speed, { position: pos4.clone() })
                .to(Vec3.distance(pos4, pos1) / speed, { position: pos1.clone() })
                .union().repeatForever().start();
            this._tweens.push(t);
        }

        if (!!this.gNode2) {
            this.gNode2.setPosition(pos3);
            let t = tween(this.gNode2)
                .to(Vec3.distance(pos3, pos4) / speed, { position: pos4.clone() })
                .to(Vec3.distance(pos4, pos1) / speed, { position: pos1.clone() })
                .to(Vec3.distance(pos1, pos2) / speed, { position: pos2.clone() })
                .to(Vec3.distance(pos2, pos3) / speed, { position: pos3.clone() })
                .union().repeatForever().start();
            this._tweens.push(t);
        }

    }

    protected onDisable(): void {
        this._stopTween();
        let particles = this.getComponentsInChildren(ParticleSystem2D);
        for (const p of particles) {
            p.stopSystem();
        }
    }

    private _stopTween() {
        for (const t of this._tweens) {
            t.stop();
        }
        this._tweens.length = 0;
    }
}


