# Project Map

## Stack and runtime

- Engine: Cocos Creator 3.8.8 with TypeScript.
- Main source root: `assets/src/`.
- Current TypeScript mode is non-strict via `tsconfig.json`.
- Repository README is minimal, so code structure is the real source of truth.

## Scene and bootstrap flow

1. `assets/src/scene/startScene.ts`
   - Sets frame rate.
   - Loads bundles through `LoadMgr`.
   - Initializes `GPlatform`.
   - Patches default `Label` and `Button` behavior.
   - Preloads the main scene and jumps with `RunScene.show(SceneName.Main, true)`.
2. `assets/src/controller/RunScene.ts`
   - Displays the loading transition prefab from `Bundle.runScene`.
   - Loads the next scene and clears node pools.
3. `assets/src/components/mainCanvas/mainCanvasController.ts`
   - Initializes the debug helper `goldFinger`.

## Module map

### `assets/src/global/`

- `bundle.ts`: shared bundle handles and bundle names.
- `Core.ts`: singleton-style access point for `UserInfo`.
- `UserInfo.ts`: persisted player model and day-scoped model.
- `IGame.ts`: scene names.

### `assets/src/manager/`

- `LoadMgr.ts`: bundle, asset, directory, and scene loading with basic caching.
- `UIMgr.ts`: persistent UI root plus dialog, top, and persist layers.
- `AudioMgr.ts`: persistent audio source wrapper for SFX and looping background audio.
- `NodePoolMgr.ts`: pooling wrapper that intercepts `destroy()` for pooled nodes.

### `assets/src/components/`

- `mainCanvas/`: main scene controllers such as tabs, shop, chest reward, and other panel logic.
- `money/`: diamond HUD and reward fly-in animation.
- `ad/`: ad reward popup flow.
- `goldFinger/`: debug or cheat entry enabled by `GConfig.testing`.
- `Controller.ts`: pooled component base with `unuse()`.

### `assets/src/platform/`

- `platform.ts`: chooses the active platform implementation from runtime environment.
- `base.ts`: cross-platform interface.
- `weChat.ts`, `byteDance.ts`, `taobao.ts`, `aliplay.ts`, `test.ts`: vendor-specific adapters.

### `assets/src/config/`

- `IConfig.ts`: shared literal unions for hero stats, equipment slots, grades, and achievements.
- `EquipmentConfig.ts`: equipment config interface plus numeric type enum.
- `EquipmentGradeConfig.ts`: grade config interface plus numeric grade enum.
- `config.ts`: runtime flags and dynamic composite image switch.

### `assets/src/common/` and `assets/src/utils/`

- `common/event.ts`: lightweight global event bus.
- `utils/`: shared helpers for tweening, strings, random, locks, resources, and image composition.

## High-signal flow anchors

- Currency update: mutate `Core.userInfo.diamond` and emit `GEventType.GeventDiamondChange`.
- Daily reward gating: read and write `Core.userInfo.day`.
- Reward popups: instantiate prefab from `Bundle.mainCanvas` and parent under `UIMgr`.
- Tab content: `TabbarsController` lazily instantiates the selected tab prefab and toggles active state.
- Modal or overlay lifecycle: usually create prefab, parent it, open it, then `this.node.destroy()` on confirm or close.

## Data model notes

- Persisted values are implemented with decorators in `SaveProp`.
- Storage keys are derived from class name, optional day tag, and property name.
- Renaming a property changes its storage key and behaves like a data migration.
- Equipment slot keys are stored as `p1` to `p4` in user data.

## Collaboration implications

- Favor small targeted edits around the active gameplay flow instead of introducing broad architecture churn.
- Trace prefab usage together with controller code; many behaviors depend on editor wiring rather than code discovery alone.
- Expect manual verification to matter because the project currently has little automated safety net.
