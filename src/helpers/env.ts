import { writeFileSync, existsSync, readFileSync, appendFileSync } from 'fs'
import { resolve } from 'path'

interface PlatformNeeds {
  github: boolean
  gitlab: boolean
  ghcr: boolean
  gitlabRegistry: boolean
  dockerHub: boolean
}

/**
 * Save credentials to .env file
 */
export async function saveToEnv(
  answers: any,
  platforms: PlatformNeeds
): Promise<void> {
  const envPath = resolve(process.cwd(), '.env')
  let envContent = ''

  // Read existing .env if it exists
  if (existsSync(envPath)) {
    envContent = readFileSync(envPath, 'utf-8')
  }

  const newVars: string[] = []

  // Add GitHub credentials
  if (answers.githubToken && !envContent.includes('GH_TOKEN=')) {
    newVars.push(`GH_TOKEN=${answers.githubToken}`)
  }
  if (answers.githubOwner && !envContent.includes('GH_OWNER=')) {
    newVars.push(`GH_OWNER=${answers.githubOwner}`)
  }
  if (answers.githubRepo && !envContent.includes('GH_REPO=')) {
    newVars.push(`GH_REPO=${answers.githubRepo}`)
  }

  // Add GitLab credentials
  if (answers.gitlabToken && !envContent.includes('GITLAB_TOKEN=')) {
    newVars.push(`GITLAB_TOKEN=${answers.gitlabToken}`)
  }
  if (answers.gitlabOwner && !envContent.includes('GL_OWNER=')) {
    newVars.push(`GL_OWNER=${answers.gitlabOwner}`)
  }
  if (answers.gitlabRepo && !envContent.includes('GL_REPO=')) {
    newVars.push(`GL_REPO=${answers.gitlabRepo}`)
  }
  if (answers.gitlabProject && !envContent.includes('GL_PROJECT=')) {
    newVars.push(`GL_PROJECT=${answers.gitlabProject}`)
  }

  // Add GHCR credentials (use GitHub token and owner)
  if (
    platforms.ghcr &&
    answers.githubToken &&
    !envContent.includes('GHCR_TOKEN=')
  ) {
    newVars.push(`GHCR_TOKEN=${answers.githubToken}`)
  }
  if (
    platforms.ghcr &&
    answers.githubOwner &&
    !envContent.includes('GHCR_OWNER=')
  ) {
    newVars.push(`GHCR_OWNER=${answers.githubOwner}`)
  }

  // Add Docker Hub credentials
  if (answers.dockerHubToken && !envContent.includes('DOCKERHUB_TOKEN=')) {
    newVars.push(`DOCKERHUB_TOKEN=${answers.dockerHubToken}`)
  }
  if (
    answers.dockerHubUsername &&
    !envContent.includes('DOCKER_HUB_USERNAME=')
  ) {
    newVars.push(`DOCKER_HUB_USERNAME=${answers.dockerHubUsername}`)
  }

  if (newVars.length > 0) {
    // Add a section header if this is a new file or first addition
    const header =
      envContent.length === 0
        ? '# Release Cleanup Configuration\n# Auto-generated - DO NOT COMMIT\n\n'
        : '\n'

    const newContent = header + newVars.join('\n') + '\n'

    if (existsSync(envPath)) {
      appendFileSync(envPath, newContent)
    } else {
      writeFileSync(envPath, newContent)
    }

    // Ensure .env is in .gitignore
    await ensureGitignore()
  }
}

/**
 * Ensure .env is added to .gitignore
 */
export async function ensureGitignore(): Promise<void> {
  const gitignorePath = resolve(process.cwd(), '.gitignore')

  if (existsSync(gitignorePath)) {
    const content = readFileSync(gitignorePath, 'utf-8')
    if (!content.includes('.env')) {
      appendFileSync(gitignorePath, '\n# Environment variables\n.env\n')
    }
  } else {
    writeFileSync(gitignorePath, '# Environment variables\n.env\n')
  }
}
