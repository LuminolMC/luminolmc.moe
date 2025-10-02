export interface CoreContributor {
  name: string
  avatar: string
  github: string
  role: {
    zh: string
    en: string
  }
}

export const coreContributors: CoreContributor[] = [
  {
    name: 'MrHua269',
    avatar: 'https://avatars.githubusercontent.com/u/79621885?v=4',
    github: 'MrHua269',
    role: {
      zh: 'Luminol 项目创始人和核心维护者',
      en: 'Founder and core maintainer of Luminol project'
    }
  },
  {
    name: 'Suisuroru',
    avatar: 'https://avatars.githubusercontent.com/u/88063803?v=4',
    github: 'Suisuroru',
    role: {
      zh: 'Lophine的主要开发者',
      en: 'Core maintainer of Lophine project'
    }
  },
  {
    name: 'Lora4967',
    avatar: 'https://avatars.githubusercontent.com/u/126928266?v=4',
    github: 'Lora4967',
    role: {
      zh: 'MrHua269的另一个GitHub账号',
      en: 'Another GitHub account of MrHua269'
    }
  },
  {
    name: 'Bacteriawa',
    avatar: 'https://avatars.githubusercontent.com/u/174142951?v=4',
    github: 'Bacteriawa',
    role: {
      zh: 'LightingLuminol的主要维护者',
      en: 'Core maintainer of LightingLuminol project'
    }
  }
]
