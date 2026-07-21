import { describe, test, expect, beforeEach, afterEach } from "bun:test"
import { join } from "node:path"
import { readFile, writeFile, unlink, mkdir } from "node:fs/promises"
import { homedir } from "node:os"
import { saveConfig } from "./saver"
import type { PlatformNeeds } from "./reader"

const ALL_PLATFORMS: PlatformNeeds = {
  github: true,
  gitlab: true,
  ghcr: true,
  gitlabRegistry: true,
  dockerHub: true,
}

const RC_PATH = join(homedir(), ".rlscleanerrc")

describe("saveConfig", () => {
  let originalContent: string | null = null

  beforeEach(async () => {
    // Backup existing rc file
    try {
      originalContent = await readFile(RC_PATH, "utf8")
    } catch {
      originalContent = null
    }
  })

  afterEach(async () => {
    // Restore original rc file
    if (originalContent !== null) {
      await writeFile(RC_PATH, originalContent)
    } else {
      try {
        await unlink(RC_PATH)
      } catch {
        // file didn't exist before, that's fine
      }
    }
  })

  test("creates new rc file with provided values", async () => {
    // Remove existing file
    try {
      await unlink(RC_PATH)
    } catch {}

    await saveConfig(
      { githubToken: "ghp_test_abc123", githubOwner: "testuser" },
      ALL_PLATFORMS,
    )

    const content = await readFile(RC_PATH, "utf8")
    expect(content).toContain('GH_TOKEN="ghp_test_abc123"')
    expect(content).toContain('GH_OWNER="testuser"')
    expect(content).toContain("Release Cleanup Global Configuration")
  })

  test("updates existing values instead of duplicating", async () => {
    await writeFile(RC_PATH, 'GH_TOKEN="old_value"\nGH_OWNER="olduser"\n')

    await saveConfig(
      { githubToken: "new_token_value", githubOwner: "newuser" },
      ALL_PLATFORMS,
    )

    const content = await readFile(RC_PATH, "utf8")
    expect(content).toContain('GH_TOKEN="new_token_value"')
    expect(content).toContain('GH_OWNER="newuser"')
    expect(content).not.toContain("old_value")
    // Should not have duplicates
    const tokenLines = content
      .split("\n")
      .filter(l => l.startsWith("GH_TOKEN="))
    expect(tokenLines).toHaveLength(1)
  })

  test("skips empty values", async () => {
    try {
      await unlink(RC_PATH)
    } catch {}

    await saveConfig({ githubToken: "", githubOwner: "user" }, ALL_PLATFORMS)

    const content = await readFile(RC_PATH, "utf8")
    expect(content).not.toContain("GH_TOKEN")
    expect(content).toContain('GH_OWNER="user"')
  })
})
