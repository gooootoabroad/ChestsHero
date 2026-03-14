# Repository Guidelines

## Project Structure & Module Organization
This repository is a Cocos Creator 3.8.8 project. Core gameplay scripts live in `assets/src`, grouped by responsibility: `components/` for scene-bound UI logic, `controller/` and `manager/` for orchestration, `platform/` for mini-game adapters, `config/` for static data, and `utils/` for shared helpers. Scenes and runtime art are split between `assets/scene/start.scene` and bundle-specific content under `assets/bundles/`. Editor configuration lives in `settings/` and `profiles/`. Treat `library/` and `temp/` as generated output; do not hand-edit them.

## Build, Test, and Development Commands
Open the project in Cocos Creator 3.8.8 and use the editor for normal development.

- `open -a "CocosCreator" .` launches the project on macOS.
- `npx tsc --noEmit -p tsconfig.json` runs a TypeScript-only check against the project config.
- In Cocos Creator, use Preview to validate scene flow and Build to export the selected target platform.

If `npx tsc` is unavailable locally, install TypeScript first or rely on the Creator editor diagnostics.

## Coding Style & Naming Conventions
Use TypeScript with 4-space indentation and keep imports grouped at the top of each file. Follow existing Cocos patterns: decorators for components, `G` prefixes for globals such as `GConfig` and `GPlatform`, PascalCase for service classes, and the repo’s established lower-camel component names such as `mainCanvasController`. Keep new files near the feature they serve, for example `assets/src/components/mainCanvas/`.

## Testing Guidelines
There is no committed automated test suite yet. Before opening a PR, run a TypeScript check if available and manually verify the affected flow in Cocos Preview. Cover at least scene loading, UI interactions, save-data changes in `assets/src/localstorage`, and any platform-specific branch touched in `assets/src/platform`.

## Commit & Pull Request Guidelines
Recent history uses short bracketed prefixes such as `[add] 增加装备`. Keep that format and use concise imperative summaries, for example `[fix] 修复宝箱动画`. Pull requests should describe the gameplay change, list the scenes or bundles affected, and include screenshots or short videos for UI updates. Link the related task or issue when one exists.

## Asset & Config Notes
Commit `.meta` files alongside every added or moved asset. Avoid renaming bundle folders casually because scene references are path-sensitive in Cocos Creator.
