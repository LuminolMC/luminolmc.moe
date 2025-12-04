export interface possibleApiStructure {
    name: string;
    path: string;
}

const possibleApiStructures: possibleApiStructure[] = [
    {
        name: 'v1',
        path: '*'
    },
    {
        name: 'v2',
        path: 'releases/*'
    }
];

export default possibleApiStructures;
