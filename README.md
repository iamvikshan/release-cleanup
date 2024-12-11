# Git Release Cleanup

A CLI tool to easily delete releases and tags across GitHub and GitLab repositories.

## Features

- 🔄 Supports both GitHub and GitLab repositories
- 🏷️ Delete releases and tags selectively
- 🤝 Interactive CLI interface using inquirer
- ⚡ Built with TypeScript for better reliability

> [!WARNING]
>
> Use this tool with caution. Deleting releases and tags is irreversible and can have unintended
> consequences.

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

Create a `.env` file with your GitHub and GitLab credentials:

```yml
GH_TOKEN=your_github_token
GH_OWNER=your_github_username # defaults to GL_OWNER if present
GH_REPO=your_github_repository # defaults to GL_REPO if present

GITLAB_TOKEN=your_gitlab_token
GITLAB_OWNER=your_gitlab_username # defaults to GH_OWNER if present
GITLAB_REPO=your_gitlab_repository # defaults to GH_REPO if present

```

## Usage

if cloned,

```bash
bun start
```

if installed as a package,

```bash
bun release-cleanup
```

The interactive CLI will guide you through:

- Selecting platforms (GitHub/GitLab)
- Choosing what to delete (releases/tags)
- Picking specific items to remove

## Development

This tool is part of a larger project that helps manage releases across GitHub and GitLab
repositories.

The code primarily relies on the official GitHub and GitLab APIs to manage releases and tags
programmatically.

## License

[MIT](https://github.com/iamvikshan/.github/blob/main/.github/LICENSE.md) © Vikshan
