import inquirer from 'inquirer';
import {
  createApis,
  fetchGithubItems,
  fetchGitlabItems,
  deleteGithubItems,
  deleteGitlabItems
} from './utils';
import { getConfig } from './config';
import { GitHubRelease, GitHubTag, GitLabRelease, GitLabTag, Items, ItemsToDelete } from './types';

async function selectPlatforms(): Promise<Array<'github' | 'gitlab'>> {
  const { platforms } = await inquirer.prompt([{
    type: 'checkbox',
    name: 'platforms',
    message: 'Select platforms to cleanup (empty for all):',
    choices: [
      { name: 'GitHub', value: 'github' },
      { name: 'GitLab', value: 'gitlab' }
    ]
  }]);

  return platforms.length ? platforms : ['github', 'gitlab'];
}

async function selectItemTypes(): Promise<Array<'releases' | 'tags'>> {
  const { types } = await inquirer.prompt([{
    type: 'checkbox',
    name: 'types',
    message: 'Select what to delete (empty for all):',
    choices: [
      { name: 'Releases', value: 'releases' },
      { name: 'Tags', value: 'tags' }
    ]
  }]);

  return types.length ? types : ['releases', 'tags'];
}

async function selectItems<T extends GitHubRelease | GitHubTag | GitLabRelease | GitLabTag>(
  items: T[],
  type: 'releases' | 'tags'
): Promise<T[]> {
  const choices = items.map(item => ({
    name: type === 'releases' ? `${(item as GitHubRelease | GitLabRelease).tag_name} - ${(item as GitHubRelease | GitLabRelease).name || 'No title'}` : (item as GitHubTag | GitLabTag).name,
    value: item
  }));

  const { selected } = await inquirer.prompt([{
    type: 'checkbox',
    name: 'selected',
    message: `Select ${type} to delete (empty for all):`,
    choices
  }]);

  return selected.length ? selected : items;
}

async function cleanup(): Promise<void> {
  try {
    const config = await getConfig();
    const { githubApi, gitlabApi } = createApis(config);
    
    const platforms = await selectPlatforms();
    const types = await selectItemTypes();
    
    const items: Items = {
      github: platforms.includes('github') ? await fetchGithubItems(githubApi, config) : null,
      gitlab: platforms.includes('gitlab') ? await fetchGitlabItems(gitlabApi, config) : null
    };

    const toDelete: ItemsToDelete = {
      github: items.github ? {
        releases: types.includes('releases') ? await selectItems(items.github.releases, 'releases') : [],
        tags: types.includes('tags') ? await selectItems(items.github.tags, 'tags') : []
      } : null,
      gitlab: items.gitlab ? {
        releases: types.includes('releases') ? await selectItems(items.gitlab.releases, 'releases') : [],
        tags: types.includes('tags') ? await selectItems(items.gitlab.tags, 'tags') : []
      } : null
    };

    const { confirm } = await inquirer.prompt([{
      type: 'confirm',
      name: 'confirm',
      message: 'Are you sure you want to delete the selected items?',
      default: false
    }]);

    if (!confirm) {
      console.log('Operation cancelled');
      return;
    }

    console.log('Starting cleanup...');

    const operations: Promise<void>[] = [];
    if (toDelete.github) {
      operations.push(
        deleteGithubItems(githubApi, config, toDelete.github)
          .catch(error => console.error('GitHub Error:', error.message))
      );
    }
    if (toDelete.gitlab) {
      operations.push(
        deleteGitlabItems(gitlabApi, config, toDelete.gitlab)
          .catch(error => console.error('GitLab Error:', error.message))
      );
    }

    await Promise.all(operations);
    console.log('Cleanup completed!');
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : String(error));
  }
}

cleanup().catch(console.error);