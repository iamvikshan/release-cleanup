import inquirer from 'inquirer'
import { Config } from './types'

export async function getConfig(): Promise<Config> {
  const envConfig = {
    github: {
      token: process.env.GH_TOKEN,
      owner: process.env.GH_OWNER || process.env.GL_OWNER || 'iamvikshan',
      repo: process.env.GH_REPO || process.env.GL_REPO
    },
    gitlab: {
      token: process.env.GITLAB_TOKEN,
      owner: process.env.GL_OWNER || process.env.GH_OWNER || 'vikshan',
      repo: process.env.GL_REPO || process.env.GH_REPO
    },
    docker: {
      ghcrToken: process.env.GHCR_TOKEN || process.env.GH_TOKEN,
      ghcrOwner: process.env.GHCR_OWNER || process.env.GH_OWNER || 'iamvikshan',
      ghcrPackage: process.env.GHCR_PACKAGE,
      gitlabToken: process.env.GITLAB_TOKEN,
      gitlabProject: process.env.GL_PROJECT,
      dockerHubToken: process.env.DOCKERHUB_TOKEN,
      dockerHubUsername: process.env.DOCKER_HUB_USERNAME || 'vikshan',
      dockerHubRepository: process.env.DOCKER_HUB_REPO
    }
  }

  const questions = []

  if (!envConfig.github.token) {
    questions.push({
      type: 'password',
      name: 'githubToken',
      message: 'Enter GitHub token:'
    })
  }

  if (!envConfig.github.owner) {
    questions.push({
      type: 'input',
      name: 'owner',
      message: 'Enter repository owner:'
    })
  }

  if (!envConfig.github.repo) {
    questions.push({
      type: 'input',
      name: 'repo',
      message: 'Enter repository name:'
    })
  }

  if (!envConfig.gitlab.token) {
    questions.push({
      type: 'password',
      name: 'gitlabToken',
      message: 'Enter GitLab token:'
    })
  }

  const answers = await inquirer.prompt(questions)

  return {
    github: {
      token: envConfig.github.token || answers.githubToken,
      owner: envConfig.github.owner || answers.owner,
      repo: envConfig.github.repo || answers.repo
    },
    gitlab: {
      token: envConfig.gitlab.token || answers.gitlabToken,
      owner: envConfig.gitlab.owner || answers.owner,
      repo: envConfig.gitlab.repo || answers.repo
    },
    docker: envConfig.docker
  }
}
