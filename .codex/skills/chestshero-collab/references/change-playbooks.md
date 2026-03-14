# Change Playbooks

## Add a new main scene panel or tab

1. Find the owning controller in `assets/src/components/mainCanvas/`.
2. Check whether the panel should be loaded by `TabbarsController` through `gItemsInfo`.
3. Load prefab instances from the correct bundle instead of hardcoding scene nodes.
4. Parent modal content under `UIMgr.instance.dialogParent`; parent transient overlays under `topParent`.
5. If the panel depends on live currency or reward state, subscribe and unsubscribe to `GEventTarget` in lifecycle hooks.

## Add a new popup or reward dialog

1. Mirror the pattern in `getChest` or `moneyAD`.
2. Expose a `static show(...)` helper when the popup is opened from multiple places.
3. Instantiate from `Bundle.mainCanvas`.
4. Keep `open(...)` or `load(...)` methods responsible for filling labels and initial state.
5. Destroy the popup node on close instead of only hiding it unless there is a clear reuse strategy.

## Add a new persisted player field

1. Put long-lived fields in `UserInfo`; put daily-reset fields in `UserInfoDay`.
2. Use `@SaveProp.decorator(defaultValue)`.
3. Pick stable property names because they become storage keys.
4. Add any required UI refresh event if the value changes on-screen.
5. If the field changes reward eligibility, review both the storage logic and the visible lock or mask state.

## Add a new config-driven stat or equipment rule

1. Inspect both `IConfig.ts` and the concrete config interfaces.
2. Decide whether the new value belongs in a string literal union, a numeric enum, or both.
3. Add explicit mapping if both forms are needed across save data and runtime config.
4. Search for all downstream readers before changing identifiers, especially grade and slot values.

## Add or change ad flow

1. UI layer calls `GPlatform.showVideoAd(...)`.
2. Success callback grants the reward.
3. Finalization callback resets running state and closes UI if needed.
4. Guard against double tap with a boolean flag like `gIsRunning`.
5. Emit currency refresh events after reward grant.

## Add or change platform capability

1. Extend `PlatformBase` first if the method should exist across platforms.
2. Implement the method in each concrete platform, or provide a safe noop in unsupported environments.
3. Keep vendor SDK usage inside platform files.
4. Make UI and gameplay code depend only on `GPlatform`.

## Refactor with low regression risk

- Keep component property names stable when they are editor-bound.
- Preserve lifecycle hooks like `onLoad`, `start`, and `onDisable`.
- Reuse existing managers before introducing new globals.
- Search for event emitters and listeners as a pair before changing event names.
- Search for prefab paths before renaming bundle assets.

## Common gotchas

- `IConfig.ts` and `EquipmentConfig.ts` or `EquipmentGradeConfig.ts` do not use the same kind of type representation.
- `SaveProp` persistence silently depends on property names.
- `NodePoolMgr` overrides `destroy()` for pooled nodes, so pooled-node lifecycles are not identical to plain nodes.
- Some behaviors are injected globally at startup by patching `Label` and `Button` prototypes in `startScene.ts`.
- The main scene controller is currently thin; avoid stuffing unrelated orchestration there if a feature has a more local owner.
