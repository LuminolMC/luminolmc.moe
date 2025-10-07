export interface CacheConfig {
    name: string;
    url: string;
    oldUrl?: string;
    primer: number;
    cn_primer: number;
}

const cacheConfigs: CacheConfig[] = [
    {
        name: 'Cache_American',
        url: 'https://luminolmc.buildmanager.api.blue-millennium.fun/github_releases.json',
        oldUrl: 'https://luminolmc.buildmanager.api.blue-millennium.fun/github_releases.old.json',
        primer: 1,
        cn_primer: 2
    },
    {
        name: 'Cache_China',
        url: 'https://36.50.226.140/github_releases.json',
        oldUrl: 'https://36.50.226.140/github_releases.old.json',
        primer: 2,
        cn_primer: 1
    },
    {
        name: 'Cache_Swiss',
        url: 'https://api.xiamohuahuo.love/github_releases.json',
        oldUrl: 'https://api.xiamohuahuo.love/github_releases.old.json',
        primer: 3,
        cn_primer: 3
    }
];

export default cacheConfigs;
