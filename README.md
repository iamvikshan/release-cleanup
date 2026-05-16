# Git Release Cleanup

A fast, interactive CLI tool built to selectively prune and delete releases, tags, and container
images across GitHub, GitLab, and multiple container registries. Distributed as lightweight,
standalone native executables powered by Bun.

## Features

- **Multi-Platform Support**: Works simultaneously across GitHub, GitLab, GHCR, GitLab Container
  Registry, and Docker Hub.
- **Hierarchical Context Interception**: Automatically loads smart configuration defaults from
  global environment states (`~/.rlscleanerrc` and `~/.atlasrc`) with an on-the-fly interactive
  review menu.
- **Flexible Deletion Rules**: Pick what you want to remove selectively (Releases, Tags, or
  Container Images) via standard keyboard navigation.
- **Unified Image Management**: Combines cross-registry container imagery under an aggregated
  two-level selection group (Images -> specific tagged versions).
- **Safe by Default**: Explicit multi-select confirmations required prior to executing irreversible
  API deletions.

> [!WARNING]
>
> Use this tool with caution. Deleting releases, tags, and container images is permanent,
> destructive, and cannot be undone.

---

## Installation

You can run the tool via direct pre-compiled binaries, use it as a standalone JavaScript bundle, or
build it locally.

### 1. Download Standalone Native Binaries

Download the specific zero-dependency compiled binary for your environment from the latest
[GitHub Release](https://github.com/iamvikshan/release-cleanup/releases).

- Linux (`x64` / `ARM64`)
- macOS (`Intel` / `Apple Silicon`)
- Windows (`x64`)

No JavaScript runtime (Node.js or Bun) is required to execute these native builds.

### 2. Run the Universal JavaScript Bundle

If you already have a JavaScript runtime installed, download the universal `index.js` file from the
release assets and invoke it directly:

```bash
bun index.js
# or
bun index.js

```

### 3. Build From Source (Development)

```bash
git clone https://github.com/iamvikshan/release-cleanup
cd release-cleanup
bun install
bun run build:all

```

---

## Configuration Hierarchy

The tool reads operational secrets and repository names sequentially based on a strict order of
precedence (from highest to lowest):

1. **`~/.rlscleanerrc`** (Global dedicated cleaner configuration)
2. **`~/.atlasrc`** (Global dev space shared bootstrap environment cache)
3. **`.env`** (Current local working directory environment variables)

### Zero-Config Review Wizard

When you start the tool, it evaluates your environment layers, aggregates the settings it discovers,
and drops you into an inline interactive dashboard:

```bash
Review configuration. Select fields to edit (Space to select, Enter to confirm all):
 ◯ GitHub Token: gith********DQvH
 ◯ GitHub Owner: iamvikshan
 ◯ GitHub Repo: release-cleanup
 ◯ GitLab Token: glpa********81s8
 ◯ GitLab Namespace: vikshan
 ◯ GitLab Repo: release-cleanup

```

- **Accept Defaults**: Simply hit `Enter` to run the tool instantly with the loaded parameters.
- **Repository Switching**: Tap `Space` to select specific fields (like `GitHub Repo` or
  `GitLab Repo`), overwrite them for the active repository, and the tool will selectively
  synchronize those changes directly into your `~/.rlscleanerrc` configuration file.
- **CI Safety**: The utility automatically ignores volatile `GITHUB_TOKEN` environment layers often
  overridden or restricted by runner shells.

---

## Interactive Flow

### Step 1: Scope Target Extraction

Select exactly what types of artifacts you intend to purge from your namespaces.

```bash
? What do you want to delete?
  Releases only
  Tags only
  Containers only
❯ Releases & Tags
  Everything Everywhere All at Once
  ──────────────
  Exit

```

### Step 2: Platform Filter

Target the precise platform or infrastructure housing the artifacts.

```bash
? From where do you want to delete?
❯ GitHub
  GitLab
  Everywhere
  ──────────────
  Go Back

```

### Step 3: Granular Selection & Safe Deletion

A list matching the chosen parameters is rendered directly to your console. Use the arrow keys and
`Space` to pick target items, then finalize execution with a manual verification pass.

```bash
? Select GitHub releases to delete (space to select, enter to confirm):
 ◯ v1.0.0 - Production Release
 ◯ v0.9.0 - Staging Build

Total releases/tags to delete: 2
? Are you sure you want to delete the selected releases/tags? (y/N)

```

---

## Container Version Selection

For container orchestration layers, the engine relies on an automated cross-registry framework that
identifies identical images by name:

1. **Auto-Grouping**: The same image pushed to multiple disparate hubs (e.g., GHCR and Docker Hub)
   maps into a single menu element.
2. **Registry Filtering**: Choose the grouped element, and the tool drills down to prompt you
   separately for targeted versions on an isolated, per-registry basis.
3. **Safe Interception**: Confirms container deletions for the current image group completely before
   presenting sequential image rows.

---

## Related Projects

This repository is maintained as an isolated tool to cleanly coordinate workspace maintenance
alongside [Advanced Git Sync (gitsync)](https://github.com/iamvikshan/gitsync).

Contributions are managed through explicit repository hooks. Please check out
[CONTRIBUTING.md](https://github.com/iamvikshan/release-cleanup?tab=contributing-ov-file) for
operational standards.
