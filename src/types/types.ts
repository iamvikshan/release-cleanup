import { AxiosInstance } from 'axios'

export interface Config {
  github: {
    token: string
    owner: string
    repo: string
  }
  gitlab: {
    token: string
    owner: string
    repo: string
  }
  docker: {
    ghcrToken?: string
    ghcrOwner?: string
    ghcrPackage?: string
    gitlabToken?: string
    gitlabProject?: string
    dockerHubToken?: string
    dockerHubUsername?: string
    dockerHubRepository?: string
  }
}

export interface APIs {
  githubApi: AxiosInstance
  gitlabApi: AxiosInstance
  ghcrApi?: AxiosInstance
  gitlabRegistryApi?: AxiosInstance
  dockerHubApi?: AxiosInstance
}

export interface GitHubRelease {
  id: number
  tag_name: string
  name?: string
}

export interface GitHubTag {
  name: string
}

export interface GitLabRelease {
  tag_name: string
  name?: string
}

export interface GitLabTag {
  name: string
}

export interface DockerImage {
  id?: number | string
  name: string
  tags?: string[]
  digest?: string
  created_at?: string
}

export interface Items {
  github: {
    releases: GitHubRelease[]
    tags: GitHubTag[]
  } | null
  gitlab: {
    releases: GitLabRelease[]
    tags: GitLabTag[]
  } | null
  docker: {
    ghcr: DockerImage[]
    gitlab: DockerImage[]
    dockerHub: DockerImage[]
  } | null
}

export interface ItemsToDelete {
  github: {
    releases: GitHubRelease[]
    tags: GitHubTag[]
  } | null
  gitlab: {
    releases: GitLabRelease[]
    tags: GitLabTag[]
  } | null
  docker: {
    ghcr: DockerImage[]
    gitlab: DockerImage[]
    dockerHub: DockerImage[]
  } | null
}
