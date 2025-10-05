export interface CacheConfig {
    name: string;
    url: string;
    oldUrl?: string;
}

const cacheConfigs: CacheConfig[] = [
    {
        name: 'Cache_Lax',
        url: 'https://luminolmc.buildmanager.api.blue-millennium.fun/github_releases.json',
        oldUrl: 'https://luminolmc.buildmanager.api.blue-millennium.fun/github_releases.old.json'
    }
];

export default cacheConfigs;
