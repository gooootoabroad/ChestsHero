import { AssetManager } from "cc";

export class Bundle {
    static font: AssetManager.Bundle;
    static audio: AssetManager.Bundle;
    static game: AssetManager.Bundle;
    static mainCanvas: AssetManager.Bundle;
    static runScene: AssetManager.Bundle;
}

export enum BundleName {
    Game = "game",
    MainCanvas = "mainCanvas",
    Audio = "audio",
    Font = "font",
    RunScene = "runScene",
}