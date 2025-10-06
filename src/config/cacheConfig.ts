export interface CacheConfig {
    name: string;
    url: string;
    oldUrl?: string;
}

const cacheConfigs: CacheConfig[] = [
    {
        name: 'Cache_American',
        url: 'https://luminolmc.buildmanager.api.blue-millennium.fun/github_releases.json',
        oldUrl: 'https://luminolmc.buildmanager.api.blue-millennium.fun/github_releases.old.json'
    },
    {
        name: 'Cache_China',
        url: 'https://36.50.226.140/github_releases.json',
        oldUrl: 'https://36.50.226.140/github_releases.old.json'
    },
    {
        name: 'Cache_Swiss',
        url: 'https://api.xiamohuahuo.love/github_releases.json',
        oldUrl: 'https://api.xiamohuahuo.love/github_releases.old.json'
    }
];

export default cacheConfigs;
