## [1.0.3](https://github.com/iamvikshan/release-cleanup/compare/v1.0.2...v1.0.3) (2026-06-10)

### Bug Fixes

* **deps:** update dependency axios to ^1.17.0 ([#42](https://github.com/iamvikshan/release-cleanup/issues/42)) ([73ed028](https://github.com/iamvikshan/release-cleanup/commit/73ed0284a993a23881ac43a0701a5374abf20b74))

## [1.0.2](https://github.com/iamvikshan/release-cleanup/compare/v1.0.1...v1.0.2) (2026-06-08)

### Bug Fixes

* **deps:** update dependency inquirer to v14.0.2 ([#41](https://github.com/iamvikshan/release-cleanup/issues/41)) ([4b52d85](https://github.com/iamvikshan/release-cleanup/commit/4b52d8550ffedf98358036403023320f7b9375f4))

## [1.0.1](https://github.com/iamvikshan/release-cleanup/compare/v1.0.0...v1.0.1) (2026-06-06)

### Bug Fixes

* **deps:** update dependency inquirer to v14 ([#37](https://github.com/iamvikshan/release-cleanup/issues/37)) ([cbc56da](https://github.com/iamvikshan/release-cleanup/commit/cbc56da910e70edd8645925c33d41b8e5536c15e))

## 1.0.0 (2026-05-16)

### ⚠ BREAKING CHANGES

* Restructured entire codebase into modular architecture

 Features:
- Add back navigation with "← Go Back" option at each step
- Implement "Everything Everywhere All at Once" unified deletion mode
- Add "❌ Exit" option for clean program termination
- Group container images across registries (GHCR, GitLab, Docker Hub)
- Smart credential management with auto .env creation and .gitignore
- Default selections to prevent empty submissions

- Split monolithic files into modular structure (680→4 lines in index.ts)
- Organize code into api/, cli/, core/, helpers/, types/ directories
- Implement barrel exports for clean imports
- No file exceeds 350 lines (improved maintainability)

- Remove dangerous "delete all" prompt on empty selection
- Add confirmation before each container group deletion
- Sequential container processing with continue/exit options

- api/: GitHub, GitLab, and Docker registry clients
- cli/: User prompts, selectors, and container workflows
- core/: Main orchestration and configuration management
- helpers/: Image grouping, env file ops, validation utils
- types/: TypeScript interfaces with barrel exports

- Update README with new flow diagrams
- Document back navigation feature
- Clarify "Everything Everywhere" vs "Everywhere" semantics
- Add safety feature explanations

- Cleaner platform selection (removed redundant "Both" option)
- Visual separators for better option grouping
- Intuitive navigation symbols (, ❌, 🎬)
- Skip platforms with no selections instead of prompting

### Features

* add Docker image cleanup support across GHCR, GitLab Registry, and Docker Hub ([ab90d2e](https://github.com/iamvikshan/release-cleanup/commit/ab90d2e6c3192147da70f1c374410d7c57615547))
* add setup scripts and configure renovate for release-cleanup ([decf347](https://github.com/iamvikshan/release-cleanup/commit/decf34760915e208b3eeaa55bfdd01d7cb75e6e0))
* implement modular architecture with navigation system ([1cd9818](https://github.com/iamvikshan/release-cleanup/commit/1cd9818ae7df8d0d8fede60fb9735432a4ed69d4))
* update package.json prepare script for husky installation ([fff3cb0](https://github.com/iamvikshan/release-cleanup/commit/fff3cb0509d87e513cbce6ab33627f967742007e))

### Bug Fixes

* **deps:** update dependency axios to ^1.13.6 ([#20](https://github.com/iamvikshan/release-cleanup/issues/20)) ([f4c00ed](https://github.com/iamvikshan/release-cleanup/commit/f4c00eded7c81f06858ca07202b1c6f388896e0f))
* **deps:** update dependency inquirer to v13 ([4a65b61](https://github.com/iamvikshan/release-cleanup/commit/4a65b6161ec323f131367965c32fc9cf18b71b8a))
* improve author.sh safety checks and auto-detect repos ([4bf8ecd](https://github.com/iamvikshan/release-cleanup/commit/4bf8ecd54e891dacf97987d2cdc052d61368b9f9))
