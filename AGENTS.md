# AGENTS

This repository uses Bun and TypeScript.

Conventions:

- Package manager: Bun (`bun.lock` present)
- Source: `src/`
- Build output: `dist/`
- CI workflows: `.github/workflows/sync.yml`, `.github/workflows/release.yml`
- Release workflow: `.github/workflows/release.yml` builds and publishes on version tags

Release workflow approach:

- Use GitHub Actions on `push` tags and manual dispatch
- Build standalone executables with `bun build --compile --target`
- Upload release artifacts to GitHub Releases
