# Git Release Cleanup

<div align="center">

[![wakatime](https://wakatime.com/badge/user/8535571c-1079-48d4-ac47-11a817f61249/project/723ec1bc-7dd6-4696-97d3-f61f1300501c.svg)](https://wakatime.com/badge/user/8535571c-1079-48d4-ac47-11a817f61249/project/723ec1bc-7dd6-4696-97d3-f61f1300501c)

</div>

A powerful CLI tool to easily delete releases, tags, and container images across GitHub, GitLab, and
Docker registries.

## Features

- 🌐 **Multi-Platform Support**: GitHub, GitLab, GHCR, GitLab Container Registry, and Docker Hub
- 🏷️ **Flexible Deletion**: Delete releases, tags, or container images selectively
- 🎯 **Interactive CLI**: User-friendly prompts guide you through the cleanup process
- �🔒 **Safe by Default**: Confirmation required before any deletion
- 🎨 **Default Selections**: First option pre-selected to prevent empty submissions (NEW!)
- 📦 **Two-Level Container Selection**: Choose images, then specific versions (NEW!)
- ⚡ **Built with TypeScript**: Reliable and type-safe
- 🎨 **Modern UI**: Clean interface with emoji indicators

> [!WARNING]
>
> Use this tool with caution. Deleting releases, tags, and container images is irreversible and can
> have unintended consequences.

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/iamvikshan/release-cleanup
cd release-cleanup
bun install
```

### 2. As a node package

```bash
bun i -d release-cleanup
```

> [!NOTE]
>
> This is still a work in progress and not yet published to npm.

## Configuration

The tool features **smart credential management** that automatically creates a `.env` file for you!

### First-Time Setup (Automatic)

1. Run the tool: `bun start`
2. Select what to delete and which platforms
3. Enter credentials when prompted
4. Tool automatically saves to `.env` file. The `.env` is automatically added to `.gitignore`.
5. Next time, credentials are loaded automatically!

### Manual Setup (Optional)

Create a `.env` file manually with your credentials:

```env
# GitHub Configuration
GH_TOKEN=your_github_token
GH_OWNER=your_github_username
GH_REPO=your_github_repository

# GitLab Configuration
GITLAB_TOKEN=your_gitlab_token
GL_OWNER=your_gitlab_username
GL_REPO=your_gitlab_repository

# GitHub Container Registry (GHCR)
GHCR_TOKEN=your_github_token # defaults to GH_TOKEN
GHCR_OWNER=your_github_username # defaults to GH_OWNER
GHCR_PACKAGE=your_package_name

# GitLab Container Registry
GL_PROJECT=your_gitlab_project_id

# Docker Hub
DOCKERHUB_TOKEN=your_dockerhub_token
DOCKER_HUB_USERNAME=your_dockerhub_username
DOCKER_HUB_REPO=your_dockerhub_repository
```

> [!TIP] The tool only asks for credentials needed by your selected platforms.

## Usage

if cloned,

```bash
bun start
```

if installed as a package,

```bash
bun release-cleanup
```

## Interactive Flow

The tool follows a simple 3-step process:

### Step 1: What do you want to delete?

```
📦 What do you want to delete?
  ❯ Releases only
    Tags only
    Containers only
    Releases & Tags
    Everything Everywhere All at Once 🎬
    ────────────────
    ❌ Exit
```

### Step 2: From where?

```
🌐 From where do you want to delete?
  ❯ GitHub
    GitLab
    Everywhere
    ────────────────
    ← Go Back
```

If you select containers, you'll also be asked:

```
📦 Select container registries:
  ◯ GitHub Container Registry (GHCR)
  ◯ GitLab Container Registry
  ◯ Docker Hub
  ◯ Everywhere
```

### Step 3: Which specific items?

```
🎯 Select GitHub releases to delete:
  ◯ v1.0.0 - First Release
  ◯ v0.9.0 - Beta Release
  ◯ v0.8.0 - Alpha Release
```

### Final Confirmation

```
⚠️  Total items to delete: 5
🗑️  Are you sure you want to delete the selected items? (y/N)
```

## Smart Defaults

- **Checkbox Pre-Checked**: First checkbox option is pre-selected to prevent empty submissions
- **Platform-Based Prompts**: Only asks for credentials needed by selected platforms
- **Smart Fallbacks**: GitHub credentials work for GHCR, GitLab for GitLab Registry
- **GitHub + Containers**: Selecting GitHub with containers automatically includes GHCR
- **Smart Filtering**: Only relevant options are shown based on your previous selections

## Container Version Selection

For container images, the tool uses a **unified cross-registry approach** that groups images by
name:

1. **Auto-Grouping**: Same image across different registries (GHCR, GitLab, Docker Hub) are grouped
   together
2. **Select Groups**: Choose which image groups to work with (e.g., `gitpod-bun` appears once even
   if it's in multiple registries)
3. **Select Versions**: For each registry containing the image, select specific versions to delete
4. **Confirm & Delete**: Review and confirm deletion for each group before proceeding

**Example**: If you have `gitpod-bun` in both GHCR and GitLab Registry:

- You'll see one group: `gitpod-bun (GHCR, GitLab) - 16 total versions`
- Select versions from GHCR (8 versions available)
- Select versions from GitLab (8 versions available)
- Confirm deletion for this group
- Continue with next group or exit

This prevents accidental deletions and makes managing the same image across multiple registries
efficient!

## Development

This tool was meant to be part of a larger project that helps manage releases across GitHub and
GitLab repositories, but instead i chose to keep it independent, after deciding to create a
different tool that could sync codebase (including releases and tags!) Behold, to me, My
[Advanced Git Sync](https://github.com/OpenSaucedHub/advanced-git-sync)!

The code primarily relies on the official GitHub and GitLab APIs to manage releases and tags
programmatically.

Why would you need this? IDK but i do.

![Alt](https://repobeats.axiom.co/api/embed/733b1172a0dd4ff34cdb848eff1bc320f018d8f6.svg 'Repobeats analytics image')
