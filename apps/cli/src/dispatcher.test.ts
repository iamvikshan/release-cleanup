import { describe, test, expect } from "bun:test"
import { join } from "node:path"

const CLI_PATH = join(import.meta.dir, "index.ts")

describe("dmrzl CLI dispatcher", () => {
  test("shows help when no args", async () => {
    const proc = Bun.spawnSync(["bun", CLI_PATH])
    const output = proc.stdout.toString()
    expect(output).toContain("dmrzl")
    expect(output).toContain("nkrn")
    expect(output).toContain("whspr")
    expect(output).toContain("rdnt")
    expect(proc.exitCode).toBe(0)
  })

  test("exits with error for unknown tool", async () => {
    const proc = Bun.spawnSync(["bun", CLI_PATH, "unknown-tool"])
    expect(proc.exitCode).toBe(1)
    expect(proc.stderr.toString()).toContain("Unknown tool")
  })

  test("whspr stub prints not yet implemented", async () => {
    const proc = Bun.spawnSync(["bun", CLI_PATH, "whspr"])
    expect(proc.stdout.toString()).toContain("not yet implemented")
  })

  test("rdnt stub prints not yet implemented", async () => {
    const proc = Bun.spawnSync(["bun", CLI_PATH, "rdnt"])
    expect(proc.stdout.toString()).toContain("not yet implemented")
  })
})
