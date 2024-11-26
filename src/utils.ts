import axios from 'axios';
import { Config, APIs, GitHubRelease, GitHubTag, GitLabRelease, GitLabTag } from './types';

export function createApis(config: Config): APIs {
  const githubApi = axios.create({
    baseURL: 'https://api.github.com',
    headers: {
      Authorization: `token ${config.github.token}`,
      Accept: 'application/vnd.github.v3+json'
    }
  });

  const gitlabApi = axios.create({
    baseURL: 'https://gitlab.com/api/v4',
    headers: {
      'PRIVATE-TOKEN': config.gitlab.token
    }
  });

  return { githubApi, gitlabApi };
}

export async function fetchGithubItems(githubApi: APIs['githubApi'], config: Config) {
  const { owner, repo } = config.github;
  
  const [releases, tags] = await Promise.all([
    githubApi.get<GitHubRelease[]>(`/repos/${owner}/${repo}/releases`).then(res => res.data),
    githubApi.get<GitHubTag[]>(`/repos/${owner}/${repo}/tags`).then(res => res.data)
  ]);

  return { releases, tags };
}

export async function fetchGitlabItems(gitlabApi: APIs['gitlabApi'], config: Config) {
  const projectId = encodeURIComponent(`${config.gitlab.owner}/${config.gitlab.repo}`);
  
  const [releases, tags] = await Promise.all([
    gitlabApi.get<GitLabRelease[]>(`/projects/${projectId}/releases`).then(res => res.data),
    gitlabApi.get<GitLabTag[]>(`/projects/${projectId}/repository/tags`).then(res => res.data)
  ]);

  return { releases, tags };
}

export async function deleteGithubItems(
  githubApi: APIs['githubApi'],
  config: Config,
  items: { releases?: GitHubRelease[]; tags?: GitHubTag[] }
) {
  const { owner, repo } = config.github;
  
  for (const release of items.releases || []) {
    await githubApi.delete(`/repos/${owner}/${repo}/releases/${release.id}`);
    console.log(`Deleted GitHub release: ${release.tag_name}`);
  }

  for (const tag of items.tags || []) {
    await githubApi.delete(`/repos/${owner}/${repo}/git/refs/tags/${tag.name}`);
    console.log(`Deleted GitHub tag: ${tag.name}`);
  }
}

export async function deleteGitlabItems(
  gitlabApi: APIs['gitlabApi'],
  config: Config,
  items: { releases?: GitLabRelease[]; tags?: GitLabTag[] }
) {
  const projectId = encodeURIComponent(`${config.gitlab.owner}/${config.gitlab.repo}`);
  
  for (const release of items.releases || []) {
    await gitlabApi.delete(`/projects/${projectId}/releases/${release.tag_name}`);
    console.log(`Deleted GitLab release: ${release.tag_name}`);
  }

  for (const tag of items.tags || []) {
    await gitlabApi.delete(`/projects/${projectId}/repository/tags/${tag.name}`);
    console.log(`Deleted GitLab tag: ${tag.name}`);
  }
}