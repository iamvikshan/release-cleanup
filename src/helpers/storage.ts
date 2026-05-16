import { homedir } from 'os'
import { join } from 'path'
import { PlatformNeeds } from '@core/config'

/**
 * Save new credentials globally to ~/.rlscleanerrc
 * Avoids mutating local project files like .env or .gitignore.
 */
export async function saveConfig(
  answers: Record<string, string>,
  platforms: PlatformNeeds
): Promise<void> {
  const rcPath = join(homedir(), '.rlscleanerrc')
  const file = Bun.file(rcPath)

  let content = ''
  let originalContent = ''

  if (await file.exists()) {
    originalContent = await file.text()
    content = originalContent
  }

  const newVars: string[] = []

  // Helper to safely format and append variables
  const addVar = (key: string, value: string | undefined) => {
    if (value && value.trim() !== '') {
      const newLine = `${key}="${value.trim()}"`

      // Use 'gm' (global + multiline) to overwrite ALL occurrences of the key
      // This prevents the parser from accidentally reading an old duplicate at the bottom of the file
      const regex = new RegExp(`^${key}=.*$`, 'gm')

      if (regex.test(content)) {
        content = content.replace(regex, newLine)
      } else if (!newVars.includes(newLine)) {
        newVars.push(newLine)
      }
    }
  }

  // GitHub credentials
  addVar('GH_TOKEN', answers.githubToken)
  addVar('GH_OWNER', answers.githubOwner)
  addVar('GH_REPO', answers.githubRepo)

  // GitLab credentials
  addVar('GL_TOKEN', answers.gitlabToken)
  addVar('GL_OWNER', answers.gitlabOwner)
  addVar('GL_REPO', answers.gitlabRepo)
  addVar('GL_PROJECT', answers.gitlabProject)

  // GHCR credentials
  if (platforms.ghcr) {
    addVar('GHCR_TOKEN', answers.githubToken)
    addVar('GHCR_OWNER', answers.githubOwner)
  }

  // Docker Hub credentials
  addVar('DOCKERHUB_TOKEN', answers.dockerHubToken)
  addVar('DOCKER_HUB_USERNAME', answers.dockerHubUsername)

  // Compare against the cached originalContent instead of re-reading the file stream
  if (newVars.length > 0 || content !== originalContent) {
    const header =
      originalContent.length === 0
        ? '# Release Cleanup Global Configuration\n# Auto-generated - DO NOT COMMIT\n\n'
        : ''

    const appendedVars =
      newVars.length > 0
        ? (content.endsWith('\n') || content === '' ? '' : '\n') +
          newVars.join('\n') +
          '\n'
        : ''

    const newContent = header + content + appendedVars

    await Bun.write(rcPath, newContent)
  }
}
