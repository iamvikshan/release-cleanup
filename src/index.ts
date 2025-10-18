import inquirer from 'inquirer'
import {
  createApis,
  fetchGithubItems,
  fetchGitlabItems,
  fetchDockerImages,
  deleteGithubItems,
  deleteGitlabItems,
  deleteDockerImages
} from './utils'
import { getConfig } from './config'
import {
  GitHubRelease,
  GitHubTag,
  GitLabRelease,
  GitLabTag,
  DockerImage,
  Items,
  ItemsToDelete
} from './types'

async function selectPlatforms(): Promise<
  Array<'github' | 'gitlab' | 'docker'>
> {
  const { platforms } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'platforms',
      message: 'Select platforms to cleanup (empty for all):',
      choices: [
        { name: 'GitHub', value: 'github' },
        { name: 'GitLab', value: 'gitlab' },
        { name: 'Docker Registries', value: 'docker' }
      ]
    }
  ])

  return platforms.length ? platforms : ['github', 'gitlab', 'docker']
}

async function selectItemTypes(
  platforms: Array<'github' | 'gitlab' | 'docker'>
): Promise<Array<'releases' | 'tags' | 'docker-images'>> {
  const choices = []

  // Only show releases/tags if github or gitlab is selected
  if (platforms.includes('github') || platforms.includes('gitlab')) {
    choices.push(
      { name: 'Releases', value: 'releases' },
      { name: 'Tags', value: 'tags' }
    )
  }

  // Only show docker images if docker is selected
  if (platforms.includes('docker')) {
    choices.push({ name: 'Docker Images', value: 'docker-images' })
  }

  const { types } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'types',
      message: 'Select what to delete (empty for all):',
      choices
    }
  ])

  // If empty, return all available types for selected platforms
  if (!types.length) {
    const allTypes: Array<'releases' | 'tags' | 'docker-images'> = []
    if (platforms.includes('github') || platforms.includes('gitlab')) {
      allTypes.push('releases', 'tags')
    }
    if (platforms.includes('docker')) {
      allTypes.push('docker-images')
    }
    return allTypes
  }

  return types
}

async function selectDockerRegistries(): Promise<
  Array<'ghcr' | 'gitlab' | 'dockerhub'>
> {
  const { registries } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'registries',
      message: 'Select Docker registries (empty for all):',
      choices: [
        { name: 'GitHub Container Registry (GHCR)', value: 'ghcr' },
        { name: 'GitLab Container Registry', value: 'gitlab' },
        { name: 'Docker Hub', value: 'dockerhub' }
      ]
    }
  ])

  return registries.length ? registries : ['ghcr', 'gitlab', 'dockerhub']
}

async function selectItems<
  T extends GitHubRelease | GitHubTag | GitLabRelease | GitLabTag
>(items: T[], type: 'releases' | 'tags'): Promise<T[]> {
  const choices = items.map(item => ({
    name:
      type === 'releases'
        ? `${(item as GitHubRelease | GitLabRelease).tag_name} - ${(item as GitHubRelease | GitLabRelease).name || 'No title'}`
        : (item as GitHubTag | GitLabTag).name,
    value: item
  }))

  const { selected } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'selected',
      message: `Select ${type} to delete (empty for all):`,
      choices
    }
  ])

  return selected.length ? selected : items
}

async function selectDockerImages(
  images: DockerImage[],
  registry: string
): Promise<DockerImage[]> {
  if (images.length === 0) {
    return []
  }

  const choices = images.map(image => ({
    name: `${image.name}${image.tags ? ` (tags: ${image.tags.join(', ')})` : ''}`,
    value: image
  }))

  const { selected } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'selected',
      message: `Select ${registry} images to delete (empty for all):`,
      choices
    }
  ])

  return selected.length ? selected : images
}

async function cleanup(): Promise<void> {
  try {
    const config = await getConfig()
    const apis = createApis(config)

    const platforms = await selectPlatforms()
    const types = await selectItemTypes(platforms)

    // Ask which Docker registries to target if docker platform is selected
    const dockerRegistries = platforms.includes('docker')
      ? await selectDockerRegistries()
      : []

    const items: Items = {
      github: platforms.includes('github')
        ? await fetchGithubItems(apis.githubApi, config)
        : null,
      gitlab: platforms.includes('gitlab')
        ? await fetchGitlabItems(apis.gitlabApi, config)
        : null,
      docker:
        platforms.includes('docker') && types.includes('docker-images')
          ? await fetchDockerImages(apis, config, dockerRegistries)
          : null
    }

    const toDelete: ItemsToDelete = {
      github: items.github
        ? {
            releases: types.includes('releases')
              ? await selectItems(items.github.releases, 'releases')
              : [],
            tags: types.includes('tags')
              ? await selectItems(items.github.tags, 'tags')
              : []
          }
        : null,
      gitlab: items.gitlab
        ? {
            releases: types.includes('releases')
              ? await selectItems(items.gitlab.releases, 'releases')
              : [],
            tags: types.includes('tags')
              ? await selectItems(items.gitlab.tags, 'tags')
              : []
          }
        : null,
      docker:
        items.docker && types.includes('docker-images')
          ? {
              ghcr: dockerRegistries.includes('ghcr')
                ? await selectDockerImages(items.docker.ghcr, 'GHCR')
                : [],
              gitlab: dockerRegistries.includes('gitlab')
                ? await selectDockerImages(
                    items.docker.gitlab,
                    'GitLab Registry'
                  )
                : [],
              dockerHub: dockerRegistries.includes('dockerhub')
                ? await selectDockerImages(items.docker.dockerHub, 'Docker Hub')
                : []
            }
          : null
    }

    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: 'Are you sure you want to delete the selected items?',
        default: false
      }
    ])

    if (!confirm) {
      console.log('Operation cancelled')
      return
    }

    console.log('Starting cleanup...')

    const operations: Promise<void>[] = []
    if (toDelete.github) {
      operations.push(
        deleteGithubItems(apis.githubApi, config, toDelete.github).catch(
          error => console.error('GitHub Error:', error.message)
        )
      )
    }
    if (toDelete.gitlab) {
      operations.push(
        deleteGitlabItems(apis.gitlabApi, config, toDelete.gitlab).catch(
          error => console.error('GitLab Error:', error.message)
        )
      )
    }
    if (toDelete.docker) {
      operations.push(
        deleteDockerImages(apis, config, toDelete.docker).catch(error =>
          console.error('Docker Error:', error.message)
        )
      )
    }

    await Promise.all(operations)
    console.log('Cleanup completed!')
  } catch (error) {
    console.error(
      'Error:',
      error instanceof Error ? error.message : String(error)
    )
  }
}

cleanup().catch(console.error)
