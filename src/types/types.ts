import { AxiosInstance } from 'axios';

export interface Config {
  github: {
    token: string;
    owner: string;
    repo: string;
  };
  gitlab: {
    token: string;
    owner: string;
    repo: string;
  };
}

export interface APIs {
  githubApi: AxiosInstance;
  gitlabApi: AxiosInstance;
}

export interface GitHubRelease {
  id: number;
  tag_name: string;
  name?: string;
}

export interface GitHubTag {
  name: string;
}

export interface GitLabRelease {
  tag_name: string;
  name?: string;
}

export interface GitLabTag {
  name: string;
}

export interface Items {
  github: {
    releases: GitHubRelease[];
    tags: GitHubTag[];
  } | null;
  gitlab: {
    releases: GitLabRelease[];
    tags: GitLabTag[];
  } | null;
}

export interface ItemsToDelete {
  github: {
    releases: GitHubRelease[];
    tags: GitHubTag[];
  } | null;
  gitlab: {
    releases: GitLabRelease[];
    tags: GitLabTag[];
  } | null;
}