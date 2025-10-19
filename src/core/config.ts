import inquirer from 'inquirer'
import { Config } from '../types'
import { saveToEnv, validateRequired } from '../helpers'

export interface PlatformNeeds {
  github: boolean
  gitlab: boolean
  ghcr: boolean
  gitlabRegistry: boolean
  dockerHub: boolean
}

/**
 * Get configuration from environment or prompt user
 */
export async function getConfig(platforms: PlatformNeeds): Promise<Config> {
  const envConfig = {
    github: {
      token: process.env.GH_TOKEN,
      owner: process.env.GH_OWNER || process.env.GL_OWNER,
      repo: process.env.GH_REPO || process.env.GL_REPO
    },
    gitlab: {
      token: process.env.GITLAB_TOKEN,
      owner: process.env.GL_OWNER || process.env.GH_OWNER,
      repo: process.env.GL_REPO || process.env.GH_REPO
    },
    docker: {
      ghcrToken: process.env.GHCR_TOKEN || process.env.GH_TOKEN,
      ghcrOwner: process.env.GHCR_OWNER || process.env.GH_OWNER,
      ghcrPackage: process.env.GHCR_PACKAGE,
      gitlabToken: process.env.GITLAB_TOKEN,
      gitlabProject: process.env.GL_PROJECT,
      dockerHubToken: process.env.DOCKERHUB_TOKEN,
      dockerHubUsername: process.env.DOCKER_HUB_USERNAME,
      dockerHubRepository: process.env.DOCKER_HUB_REPO
    }
  }

  const questions = []
  const envVars: Record<string, string> = {}

  // Collect missing credentials based on selected platforms
  if (platforms.github || platforms.ghcr) {
    if (!envConfig.github.token) {
      questions.push({
        type: 'password',
        name: 'githubToken',
        message: '🔑 Enter GitHub Personal Access Token:',
        validate: (input: string) => validateRequired(input, 'Token')
      })
    }

    if (!envConfig.github.owner) {
      questions.push({
        type: 'input',
        name: 'githubOwner',
        message: '👤 Enter GitHub username/organization:',
        validate: (input: string) => validateRequired(input, 'Username')
      })
    }

    if (platforms.github && !envConfig.github.repo) {
      questions.push({
        type: 'input',
        name: 'githubRepo',
        message: '📦 Enter GitHub repository name:',
        validate: (input: string) => validateRequired(input, 'Repository')
      })
    }
  }

  if (platforms.gitlab || platforms.gitlabRegistry) {
    if (!envConfig.gitlab.token) {
      questions.push({
        type: 'password',
        name: 'gitlabToken',
        message: '🔑 Enter GitLab Personal Access Token:',
        validate: (input: string) => validateRequired(input, 'Token')
      })
    }

    if (!envConfig.gitlab.owner) {
      questions.push({
        type: 'input',
        name: 'gitlabOwner',
        message: '👤 Enter GitLab username/organization:',
        validate: (input: string) => validateRequired(input, 'Username')
      })
    }

    if (platforms.gitlab && !envConfig.gitlab.repo) {
      questions.push({
        type: 'input',
        name: 'gitlabRepo',
        message: '📦 Enter GitLab repository name:',
        validate: (input: string) => validateRequired(input, 'Repository')
      })
    }

    if (platforms.gitlabRegistry && !envConfig.docker.gitlabProject) {
      questions.push({
        type: 'input',
        name: 'gitlabProject',
        message: '📦 Enter GitLab project ID or path (e.g., username/project):',
        validate: (input: string) => validateRequired(input, 'Project ID')
      })
    }
  }

  if (platforms.dockerHub) {
    if (!envConfig.docker.dockerHubToken) {
      questions.push({
        type: 'password',
        name: 'dockerHubToken',
        message: '🔑 Enter Docker Hub password or access token:',
        validate: (input: string) => validateRequired(input, 'Token')
      })
    }

    if (!envConfig.docker.dockerHubUsername) {
      questions.push({
        type: 'input',
        name: 'dockerHubUsername',
        message: '👤 Enter Docker Hub username:',
        validate: (input: string) => validateRequired(input, 'Username')
      })
    }
  }

  const answers = await inquirer.prompt(questions)

  // Build the config
  const config: Config = {
    github: {
      token: envConfig.github.token || answers.githubToken || '',
      owner: envConfig.github.owner || answers.githubOwner || '',
      repo: envConfig.github.repo || answers.githubRepo || ''
    },
    gitlab: {
      token: envConfig.gitlab.token || answers.gitlabToken || '',
      owner: envConfig.gitlab.owner || answers.gitlabOwner || '',
      repo: envConfig.gitlab.repo || answers.gitlabRepo || ''
    },
    docker: {
      ghcrToken: envConfig.docker.ghcrToken || answers.githubToken,
      ghcrOwner: envConfig.docker.ghcrOwner || answers.githubOwner,
      ghcrPackage: envConfig.docker.ghcrPackage,
      gitlabToken: envConfig.docker.gitlabToken || answers.gitlabToken,
      gitlabProject: envConfig.docker.gitlabProject || answers.gitlabProject,
      dockerHubToken: envConfig.docker.dockerHubToken || answers.dockerHubToken,
      dockerHubUsername:
        envConfig.docker.dockerHubUsername || answers.dockerHubUsername,
      dockerHubRepository: envConfig.docker.dockerHubRepository
    }
  }

  // Save to .env if any new credentials were entered
  if (Object.keys(answers).length > 0) {
    console.log('\n💾 Saving credentials to .env file...')
    await saveToEnv(answers, platforms)
    console.log("✅ Credentials saved! You won't need to enter them again.\n")
  }

  return config
}
