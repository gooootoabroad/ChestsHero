import { Sprite } from "cc";
import { __private, Asset, AssetManager, assetManager, director, SceneAsset, SpriteFrame } from "cc";

export class LoadMgr {

    private static _loadedAssets: Map<string, Asset> = new Map();
    private static _pendingRequests: Map<string, Promise<any>> = new Map();
    static this: any;

    static async loadScene(name: string): Promise<SceneAsset> {
        return new Promise((resolve, reject) => {
            director.preloadScene(name, (err, data) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data);
                }
            });
        });
    }

    static async loadBundle(name: string): Promise<AssetManager.Bundle> {
        return new Promise((resolve, reject) => {
            assetManager.loadBundle(name, (err, bundle) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(bundle);
                }
            });
        });
    }

    static async loadDir<T extends Asset>(bundle: AssetManager.Bundle, dir = '/', type: __private.__types_globals__Constructor<T>): Promise<T[]> {
        return new Promise((resolve, reject) => {
            bundle.loadDir(dir, type, (err, assets) => {
                if (err) {
                    reject(err);
                }
                else {
                    assets.forEach(v => v.addRef());
                    resolve(assets);
                }
            });
        });
    }

    static async loadFile<T extends Asset>(bundle: AssetManager.Bundle, path: string, type: __private.__types_globals__Constructor<T>): Promise<T> {
        let key = `@${bundle.name}_@${path}`;
        if (this._loadedAssets.has(key)) {
            return Promise.resolve(this._loadedAssets.get(key) as T);
        }
        if (this._pendingRequests.has(key)) {
            return this._pendingRequests.get(key);
        }
        let requestPromise = new Promise<T>((resolve, reject) => {
            bundle.load(path, type, (err, asset) => {
                this._pendingRequests.delete(key);
                if (err) {
                    reject(err);
                }
                else {
                    asset.name = path;
                    asset.addRef();
                    this._loadedAssets.set(key, asset);
                    resolve(asset);
                }
            });
        });
        this._pendingRequests.set(key, requestPromise);
        return requestPromise;
    }

    static async loadSpriteFrame(bundle: AssetManager.Bundle, path: string): Promise<SpriteFrame> {
        return await this.loadFile(bundle, path + '/spriteFrame', SpriteFrame);
    }

    static async loadSprite(bundle: AssetManager.Bundle, path: string, sprite: { spriteFrame: SpriteFrame },) {
        if (!sprite || sprite['_SFPath'] === path) {
            return;
        }
        sprite['_SFPath'] = path;
        sprite.spriteFrame = null;
        LoadMgr.loadSpriteFrame(bundle, path).then(sf => {
            if (sprite['_SFPath'] === path) {
                sprite.spriteFrame = sf;
            }
        });
    }
}