import { AssetManager, Sprite, SpriteFrame, _decorator } from 'cc';
import { Controller } from './Controller';
import { LoadMgr } from '../manager/LoadMgr';

const { ccclass, property } = _decorator;

export interface IGIFData {
    animation: string;
    images: SpriteFrame[];
}

/**
 * 序列帧控制器
 */
@ccclass('GIFController')
export class GIFController extends Controller {

    protected _sprite: Sprite;

    private _animaiton: string = "";
    private _loop = true;
    private _call: () => void;
    private _index = 0;

    private _datas: IGIFData[];
    private _spriteFrames: SpriteFrame[];

    private _frame = 1 / 30;
    private _tick = 0;
    private _timeScale = 1;

    private _pause = false;

    onLoad() {
        this._sprite = this.getComponent(Sprite) ?? this.addComponent(Sprite);
        this._sprite.sizeMode = Sprite.SizeMode.RAW;
        this._sprite.trim = false;
    }

    init(datas: IGIFData[]) {
        this._datas = datas;
    }

    play<T extends string>(animation: T, loop = true, call: () => void = null, resetIndex = true) {
        if (!this._datas) {
            return;
        }
        this._animaiton = animation;
        this._loop = loop;
        this._call = call;
        if (resetIndex) {
            this._tick = 0;
            this._index = 0;
        }

        let currentData = this._datas.find(data => data.animation === animation);
        this._spriteFrames = currentData.images;
        this._sprite.spriteFrame = this._spriteFrames[this._index % this._spriteFrames.length];

        this._pause = false;
    }

    get animation() {
        return this._animaiton;
    }

    get loop() {
        return this._loop;
    }

    get call() {
        return this._call;
    }

    set pause(v: boolean) {
        this._pause = v;
    }

    get frame() {
        return 1 / this._frame;
    }

    set frame(v: number) {
        this._frame = 1 / v;
    }

    get timeScale() {
        return this._timeScale;
    }

    set timeScale(v: number) {
        this._timeScale = v;
    }

    get duration() {
        if (!!this._spriteFrames) {
            return this._spriteFrames.length / 30;
        }
        return 0;
    }

    update(dt: number) {
        if (this._pause || !this._spriteFrames || this._spriteFrames.length === 0) {
            return;
        }
        this._tick += dt * this.timeScale;
        if (this._tick < this._frame) {
            return;
        }
        let addIndex = Math.floor(this._tick / this._frame);
        this._tick -= addIndex * this._frame;
        if (this._index === (this._spriteFrames.length - 1)) {
            this._index = 0;
        }
        else {
            this._index = Math.min(this._index + addIndex, this._spriteFrames.length - 1);
        }
        this._sprite.spriteFrame = this._spriteFrames[this._index];
        if (this._index === (this._spriteFrames.length - 1)) {
            if (!this._loop) {
                this._pause = true;
            }
            this._call && this._call();
        }
    }

    static async getGIFData(bundle: AssetManager.Bundle, dir: string, animation: string) {
        let result = await LoadMgr.loadDir(bundle, dir, SpriteFrame);
        let sfs = [...result];
        sfs.sort((a, b) => a.name < b.name ? -1 : 1);
        let data: IGIFData = {
            animation,
            images: sfs
        };
        return data;
    }

}