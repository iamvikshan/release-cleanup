/**
 * Monorepo build script — builds packages that have a build target.
 * Usage: bun scripts/build.ts [--package nkrn] [--all]
 */

type BuildTarget = {
  target: string
  name: string
}

type PackageConfig = {
  name: string
  entry: string
  binaries: BuildTarget[]
}

const PACKAGES: Record<string, PackageConfig> = {
  nkrn: {
    name: "nkrn",
    entry: "packages/nkrn/src/index.ts",
    binaries: [
      { target: "bun-linux-x64", name: "nkrn-linux-x64" },
      { target: "bun-linux-arm64", name: "nkrn-linux-arm64" },
      { target: "bun-darwin-x64", name: "nkrn-macos-x64" },
      { target: "bun-darwin-arm64", name: "nkrn-macos-arm64" },
      { target: "bun-windows-x64", name: "nkrn-windows-x64.exe" },
    ],
  },
}

function buildJS(entry: string, outfile: string, banner?: string): boolean {
  console.log(`  JS bundle → ${outfile}`)
  const args = ["bun", "build", entry, "--target=bun", "--outfile", outfile]
  if (banner) args.push(`--banner=${banner}`)
  const proc = Bun.spawnSync(args)
  if (!proc.success) {
    console.error(`  FAILED: ${proc.stderr.toString()}`)
    return false
  }
  return true
}

function buildBinary(entry: string, target: string, outfile: string): boolean {
  console.log(`  ${target} → ${outfile}`)
  const proc = Bun.spawnSync([
    "bun",
    "build",
    "--compile",
    "--target",
    target,
    entry,
    "--outfile",
    outfile,
  ])
  if (!proc.success) {
    console.error(`  FAILED: ${proc.stderr.toString()}`)
    return false
  }
  return true
}

function buildPackage(pkg: PackageConfig): boolean {
  console.log(`\nBuilding @dmrzl/${pkg.name}...`)

  // Ensure dist/ exists
  const distDir = `packages/${pkg.name}/dist`
  Bun.spawnSync(["mkdir", "-p", distDir])

  // JS bundle
  const jsOk = buildJS(pkg.entry, `${distDir}/index.js`, "#!/usr/bin/env bun")

  // Platform binaries
  let allBinOk = true
  for (const bin of pkg.binaries) {
    const ok = buildBinary(pkg.entry, bin.target, `${distDir}/${bin.name}`)
    if (!ok) allBinOk = false
  }

  const ok = jsOk && allBinOk
  console.log(ok ? `  ✓ ${pkg.name} done` : `  ✗ ${pkg.name} had failures`)
  return ok
}

function main() {
  const args = process.argv.slice(2)
  const pkgIdx = args.indexOf("--package")
  const targetPkg = pkgIdx !== -1 ? args[pkgIdx + 1] : null

  const packages = targetPkg
    ? [PACKAGES[targetPkg]].filter(Boolean)
    : Object.values(PACKAGES)

  if (packages.length === 0) {
    console.error(`Unknown package: ${targetPkg}`)
    console.error(`Available: ${Object.keys(PACKAGES).join(", ")}`)
    process.exit(1)
  }

  console.log("dmrzl monorepo build")
  console.log("=".repeat(40))

  let allOk = true
  for (const pkg of packages) {
    if (!buildPackage(pkg)) allOk = false
  }

  console.log("\n" + "=".repeat(40))
  console.log(allOk ? "✓ All builds succeeded" : "✗ Some builds failed")
  process.exit(allOk ? 0 : 1)
}

main()
