---
name: chestshero-collab
description: Collaborate on the ChestsHero Cocos Creator 3.8.8 mini-game with project-specific guidance for gameplay, UI, config, persistence, bundle loading, and platform integration. Use when working in this repository on `assets/src/**`, especially for tab or panel changes, currency or reward flows, user save data, equipment config, bundle-prefab wiring, ads or platform features, or scene startup and transition logic.
---

# ChestsHero Collab

## Overview

Use this skill to make changes that fit the existing ChestsHero architecture instead of adding one-off logic. Keep edits aligned with the current Cocos Creator patterns for bundles, prefab instantiation, persisted player data, global UI roots, and mini-game platform wrappers.

## Working Loop

1. Classify the request before editing: UI panel flow, persistent data, config table, platform or ad integration, scene startup, or utility or manager work.
2. Read `references/project-map.md` first for module ownership and lifecycle entry points.
3. Read `references/change-playbooks.md` when implementing a feature, refactor, or bugfix so the change follows the local patterns.
4. Trace the full player flow before patching. In this repo, behavior is often split across prefab loading, `Core.userInfo`, `GEventTarget`, and platform callbacks.
5. Prefer modifying the existing manager or controller in place over adding parallel abstractions unless the current structure is clearly breaking down.
6. After edits, sanity check the affected flow end to end. This project currently has no meaningful automated test suite, so manual verification is part of the task.

## Project Rules

- Treat `assets/src/scene/startScene.ts` as the runtime bootstrap. Bundle loading, font and button patching, platform initialization, and the first scene jump happen there.
- Use `assets/src/global/bundle.ts` plus `assets/src/manager/LoadMgr.ts` for runtime asset access. Do not hardcode ad-hoc bundle globals or bypass the existing cache unless there is a strong reason.
- Use `assets/src/manager/UIMgr.ts` roots consistently:
  - `dialogParent` for modal panels
  - `topParent` for transient overlays such as reward fly-ins
  - `persistParent` for cross-scene nodes such as loading transitions and debug helpers
- Use `assets/src/controller/RunScene.ts` for scene transitions instead of raw `director.loadScene(...)` in gameplay code.
- Persist long-lived player state through `assets/src/global/UserInfo.ts` and `assets/src/localstorage/SaveProp.ts`. For data that resets daily, prefer `UserInfoDay`.
- When currency or reward data changes, update `Core.userInfo` first and then emit the matching global event if UI depends on it. Today the active pattern is diamond refresh via `GEventTarget.emit(GEventType.GeventDiamondChange)`.
- Route ad, share, vibration, ranking, and mini-game platform behavior through `assets/src/platform/platform.ts` and the `PlatformBase` implementations. Do not call vendor SDK APIs directly from UI controllers unless you are also extending the platform layer.
- Preserve Cocos editor binding patterns: `@property(...)`, component fields initialized to `null`, and prefab-based composition over dynamic scene graph construction.

## Common Tasks

### Add or change a UI panel

- Check whether the panel should be lazily instantiated from a bundle prefab. `assets/src/components/mainCanvas/TabbarsController.ts` is the current example for tab-owned panels.
- Mount the instantiated node under the correct `UIMgr` root instead of directly under the active scene unless the node is scene-local by design.
- Reuse the current animation and click-audio patterns where possible. Button taps and reward popups already have established hooks.

### Add or change player data

- Add fields in `assets/src/global/UserInfo.ts` with `@SaveProp.decorator(defaultValue)`.
- Choose between `UserInfo` and `UserInfoDay` based on whether the value survives calendar-day rollover.
- If the value affects live HUD state, wire an event or refresh point. Do not assume labels poll automatically.
- Keep storage keys stable; renaming a persisted property silently changes the save slot key.

### Add or change config-driven gameplay

- Read both `assets/src/config/IConfig.ts` and the concrete config interfaces before editing.
- Watch the current type split:
  - `IConfig.ts` uses string literal unions for equipment slots and grades such as `p1` and `S`
  - `EquipmentConfig.ts` and `EquipmentGradeConfig.ts` define numeric enums
- If a feature needs both representations, add an explicit mapping helper instead of relying on implicit coercion or duplicated magic values.

### Add ad or platform behavior

- Extend `assets/src/platform/base.ts` first if the capability is cross-platform.
- Implement vendor specifics in the matching platform class under `assets/src/platform/`.
- Keep UI components thin. They should call `GPlatform` and handle success or finalization callbacks, similar to `moneyAD`, `shopBoxItem`, and other reward flows.

### Add reward or currency behavior

- Follow the existing sequence:
  1. Guard repeat taps with a local running flag when async work is involved.
  2. Trigger ad or purchase flow if needed.
  3. Mutate `Core.userInfo`.
  4. Emit the relevant event.
  5. Open popup or animation if the user needs confirmation.
- Inspect the existing diamond flows in `assets/src/components/ad/moneyAD.ts`, `assets/src/components/mainCanvas/shopDailyPrizeItem.ts`, and `assets/src/components/money/moneyController.ts` before introducing a new pattern.

## Validation Checklist

- Confirm the edited flow can still resolve assets from the intended bundle.
- Confirm node parenting is correct for scene-local, dialog, overlay, and persistent UI.
- Confirm save data still initializes for fresh users and does not break existing property names.
- Confirm async reward or ad flows reset their running flags on both success and finalization.
- Confirm any new UI that reflects diamonds or daily rewards still refreshes after `Core.userInfo` changes.
- If the change touches config or equipment progression, verify both the stored representation and the display representation still align.

## References

- Read `references/project-map.md` for the repository structure, startup flow, and module owners.
- Read `references/change-playbooks.md` for feature-oriented implementation guidance and gotchas.
