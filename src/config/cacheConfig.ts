export interface CacheConfig {
    name: string;
    url: string;
    oldUrl?: string;
    disabled?: boolean;
}

const cacheConfigs: CacheConfig[] = [
    {
        name: 'Cache_American',
        url: 'https://api.luminolmc.cache-build-data.blue-millennium.fun/github_releases.json',
        oldUrl: 'https://api.luminolmc.cache-build-data.blue-millennium.fun/github_releases.old.json'
    },
    {
        name: 'Cache_China',
        url: 'https://36.50.226.140/github_releases.json',
        oldUrl: 'https://36.50.226.140/github_releases.old.json'
    },
    {
        name: 'Cache_Swiss',
        url: 'https://nnnn.baby/github_releases.json',
        oldUrl: 'https://nnnn.baby/github_releases.old.json'
    }
];

export default cacheConfigs;
