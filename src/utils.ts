import axios from 'axios'
import {
  Config,
  APIs,
  GitHubRelease,
  GitHubTag,
  GitLabRelease,
  GitLabTag,
  DockerImage
} from './types'

export function createApis(config: Config): APIs {
  const githubApi = axios.create({
    baseURL: 'https://api.github.com',
    headers: {
      Authorization: `token ${config.github.token}`,
      Accept: 'application/vnd.github.v3+json'
    }
  })

  const gitlabApi = axios.create({
    baseURL: 'https://gitlab.com/api/v4',
    headers: {
      'PRIVATE-TOKEN': config.gitlab.token
    }
  })

  const apis: APIs = { githubApi, gitlabApi }

  // GHCR API (uses GitHub token)
  if (config.docker.ghcrToken) {
    apis.ghcrApi = axios.create({
      baseURL: 'https://api.github.com',
      headers: {
        Authorization: `token ${config.docker.ghcrToken}`,
        Accept: 'application/vnd.github.package-deletes-preview+json'
      }
    })
  }

  // GitLab Container Registry API
  if (config.docker.gitlabToken) {
    apis.gitlabRegistryApi = axios.create({
      baseURL: 'https://gitlab.com/api/v4',
      headers: {
        'PRIVATE-TOKEN': config.docker.gitlabToken
      }
    })
  }

  // Docker Hub API (authentication handled in fetchDockerImages)
  if (config.docker.dockerHubToken) {
    apis.dockerHubApi = axios.create({
      baseURL: 'https://hub.docker.com/v2'
    })
  }

  return apis
}

export async function fetchGithubItems(
  githubApi: APIs['githubApi'],
  config: Config
) {
  const { owner, repo } = config.github

  const [releases, tags] = await Promise.all([
    githubApi
      .get<GitHubRelease[]>(`/repos/${owner}/${repo}/releases`)
      .then(res => res.data),
    githubApi
      .get<GitHubTag[]>(`/repos/${owner}/${repo}/tags`)
      .then(res => res.data)
  ])

  return { releases, tags }
}

export async function fetchGitlabItems(
  gitlabApi: APIs['gitlabApi'],
  config: Config
) {
  const projectId = encodeURIComponent(
    `${config.gitlab.owner}/${config.gitlab.repo}`
  )

  const [releases, tags] = await Promise.all([
    gitlabApi
      .get<GitLabRelease[]>(`/projects/${projectId}/releases`)
      .then(res => res.data),
    gitlabApi
      .get<GitLabTag[]>(`/projects/${projectId}/repository/tags`)
      .then(res => res.data)
  ])

  return { releases, tags }
}

export async function deleteGithubItems(
  githubApi: APIs['githubApi'],
  config: Config,
  items: { releases?: GitHubRelease[]; tags?: GitHubTag[] }
) {
  const { owner, repo } = config.github

  for (const release of items.releases || []) {
    await githubApi.delete(`/repos/${owner}/${repo}/releases/${release.id}`)
    console.log(`Deleted GitHub release: ${release.tag_name}`)
  }

  for (const tag of items.tags || []) {
    await githubApi.delete(`/repos/${owner}/${repo}/git/refs/tags/${tag.name}`)
    console.log(`Deleted GitHub tag: ${tag.name}`)
  }
}

export async function deleteGitlabItems(
  gitlabApi: APIs['gitlabApi'],
  config: Config,
  items: { releases?: GitLabRelease[]; tags?: GitLabTag[] }
) {
  const projectId = encodeURIComponent(
    `${config.gitlab.owner}/${config.gitlab.repo}`
  )

  for (const release of items.releases || []) {
    await gitlabApi.delete(
      `/projects/${projectId}/releases/${release.tag_name}`
    )
    console.log(`Deleted GitLab release: ${release.tag_name}`)
  }

  for (const tag of items.tags || []) {
    await gitlabApi.delete(`/projects/${projectId}/repository/tags/${tag.name}`)
    console.log(`Deleted GitLab tag: ${tag.name}`)
  }
}

// Docker Image Functions
export async function fetchDockerImages(
  apis: APIs,
  config: Config,
  registries?: Array<'ghcr' | 'gitlab' | 'dockerhub'>
): Promise<{
  ghcr: DockerImage[]
  gitlab: DockerImage[]
  dockerHub: DockerImage[]
}> {
  // Default to all registries if not specified
  const targetRegistries = registries || ['ghcr', 'gitlab', 'dockerhub']

  const results = {
    ghcr: [] as DockerImage[],
    gitlab: [] as DockerImage[],
    dockerHub: [] as DockerImage[]
  }

  // Fetch GHCR images
  if (
    targetRegistries.includes('ghcr') &&
    apis.ghcrApi &&
    config.docker.ghcrOwner
  ) {
    try {
      // List all container packages for the user
      const response = await apis.ghcrApi.get(
        `/users/${config.docker.ghcrOwner}/packages?package_type=container&per_page=100`
      )

      // Flatten all packages and their versions
      const packages: DockerImage[] = []
      for (const pkg of response.data) {
        // Get versions for each package
        try {
          const versionsResponse = await apis.ghcrApi.get(
            `/users/${config.docker.ghcrOwner}/packages/container/${encodeURIComponent(pkg.name)}/versions`
          )
          packages.push({
            id: pkg.id,
            name: pkg.name,
            created_at: pkg.created_at,
            tags: versionsResponse.data
              .map((v: any) => v.metadata?.container?.tags || [])
              .flat()
          })
        } catch (err) {
          console.error(
            `Error fetching versions for ${pkg.name}:`,
            err instanceof Error ? err.message : String(err)
          )
        }
      }
      results.ghcr = packages
    } catch (error) {
      console.error(
        'Error fetching GHCR images:',
        error instanceof Error ? error.message : String(error)
      )
    }
  }

  // Fetch GitLab Registry images
  if (
    targetRegistries.includes('gitlab') &&
    apis.gitlabRegistryApi &&
    config.docker.gitlabProject
  ) {
    try {
      const projectId = encodeURIComponent(config.docker.gitlabProject)
      const response = await apis.gitlabRegistryApi.get(
        `/projects/${projectId}/registry/repositories`
      )
      results.gitlab = response.data.map((repo: any) => ({
        id: repo.id,
        name: repo.path || repo.name,
        created_at: repo.created_at
      }))
    } catch (error) {
      console.error(
        'Error fetching GitLab images:',
        error instanceof Error ? error.message : String(error)
      )
    }
  }

  // Fetch Docker Hub images
  if (
    targetRegistries.includes('dockerhub') &&
    apis.dockerHubApi &&
    config.docker.dockerHubUsername &&
    config.docker.dockerHubToken
  ) {
    try {
      // First, authenticate to get JWT token
      const authResponse = await axios.post(
        'https://hub.docker.com/v2/users/login',
        {
          username: config.docker.dockerHubUsername,
          password: config.docker.dockerHubToken
        }
      )

      // Update API instance with JWT token
      apis.dockerHubApi.defaults.headers.Authorization = `Bearer ${authResponse.data.token}`

      // Fetch all repositories for the user
      const reposResponse = await apis.dockerHubApi.get(
        `/repositories/${config.docker.dockerHubUsername}/`
      )

      // Map repositories to DockerImage format
      results.dockerHub = reposResponse.data.results.map((repo: any) => ({
        name: repo.name,
        id: `${repo.namespace}/${repo.name}`,
        created_at: repo.last_updated,
        tags: [] // Tags will be fetched on demand if needed
      }))
    } catch (error) {
      console.error(
        'Error fetching Docker Hub images:',
        error instanceof Error ? error.message : String(error)
      )
    }
  }

  return results
}

export async function deleteDockerImages(
  apis: APIs,
  config: Config,
  items: {
    ghcr?: DockerImage[]
    gitlab?: DockerImage[]
    dockerHub?: DockerImage[]
  }
) {
  // Delete GHCR images
  if (apis.ghcrApi && items.ghcr) {
    for (const image of items.ghcr) {
      try {
        await apis.ghcrApi.delete(`/user/packages/container/${image.name}`)
        console.log(`Deleted GHCR image: ${image.name}`)
      } catch (error) {
        console.error(
          `Error deleting GHCR image ${image.name}:`,
          error instanceof Error ? error.message : String(error)
        )
      }
    }
  }

  // Delete GitLab Registry images
  if (apis.gitlabRegistryApi && items.gitlab && config.docker.gitlabProject) {
    for (const image of items.gitlab) {
      try {
        await apis.gitlabRegistryApi.delete(
          `/projects/${encodeURIComponent(`${config.gitlab.owner}/${config.docker.gitlabProject}`)}/registry/repositories/${image.id}`
        )
        console.log(`Deleted GitLab Registry image: ${image.name}`)
      } catch (error) {
        console.error(
          `Error deleting GitLab image ${image.name}:`,
          error instanceof Error ? error.message : String(error)
        )
      }
    }
  }

  // Delete Docker Hub images
  if (
    apis.dockerHubApi &&
    items.dockerHub &&
    config.docker.dockerHubUsername &&
    config.docker.dockerHubToken
  ) {
    try {
      // Authenticate first
      const authResponse = await axios.post(
        'https://hub.docker.com/v2/users/login',
        {
          username: config.docker.dockerHubUsername,
          password: config.docker.dockerHubToken
        }
      )

      apis.dockerHubApi.defaults.headers.Authorization = `Bearer ${authResponse.data.token}`

      // Delete repositories
      for (const image of items.dockerHub) {
        try {
          await apis.dockerHubApi.delete(
            `/repositories/${config.docker.dockerHubUsername}/${image.name}/`
          )
          console.log(`Deleted Docker Hub repository: ${image.name}`)
        } catch (error) {
          console.error(
            `Error deleting Docker Hub repository ${image.name}:`,
            error instanceof Error ? error.message : String(error)
          )
        }
      }
    } catch (error) {
      console.error(
        'Error authenticating with Docker Hub:',
        error instanceof Error ? error.message : String(error)
      )
    }
  }
}
