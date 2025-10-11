export interface Contributor {
  name: string;
  avatar: string;
  github: string;
  description: {
    zh: string;
    en: string;
  };
}

export interface Role {
  title: {
    zh: string;
    en: string;
  };
  description: {
    zh: string;
    en: string;
  };
  members: Contributor[];
}

export const team: Role[] = [
  {
    title: {
      zh: "核心开发",
      en: "Core Development",
    },
    description: {
      zh: "这些是Luminol项目的核心开发者，他们在项目的设计、架构和主要功能实现方面发挥了关键作用。",
      en: "They are the core developers of the Luminol project, who play a key role in the design, architecture, and main feature implementation of the project.",
    },
    members: [
      {
        name: "MrHua269",
        avatar: "https://avatars.githubusercontent.com/u/79621885?v=4",
        github: "MrHua269",
        description: {
          zh: "Luminol 项目创始人和核心维护者",
          en: "Founder and core maintainer of Luminol project",
        },
      },
      {
        name: "Suisuroru",
        avatar: "https://avatars.githubusercontent.com/u/88063803?v=4",
        github: "Suisuroru",
        description: {
          zh: "Lophine的主要开发者",
          en: "Core maintainer of Lophine project",
        },
      },
      {
        name: "Bacteriawa",
        avatar: "https://avatars.githubusercontent.com/u/174142951?v=4",
        github: "Bacteriawa",
        description: {
          zh: "LightingLuminol的主要维护者",
          en: "Core maintainer of LightingLuminol project",
        },
      },
    ],
  },
  {
    title: {
      zh: "社区贡献者",
      en: "Community Contributors",
    },
    description: {
      zh: "他们不是我们团队的核心成员，但是也为软件开发做出了不少贡献",
      en: "These contributors have made significant contributions to the success of the Luminol project by reporting issues, providing feedback, and assisting other users.",
    },
    members: [
      {
        name: "Dreeam",
        avatar: "https://avatars.githubusercontent.com/u/61569423?v=4",
        github: "Dreeam-qwq",
        description: {
          zh: "社区支持者",
          en: "Community Supporter",
        },
      },
    ],
  },
  {
    title: {
      zh: "周边开发",
      en: "Frontend",
    },
    description: {
      zh: "他们不是服务器软件的主要维护者，但是为网站和API的开发做出了贡献",
      en: "They are not the main maintainers of the server software but have contributed to the development of the website and API.",
    },
    members: [
      {
        name: "Klop233",
        avatar: "https://avatars.githubusercontent.com/u/62453589?v=4",
        github: "Klop233",
        description: {
          zh: "前端开发、API开发",
          en: "Frontend development, API development",
        },
      },
      {
        name: "Suisuroru",
        avatar: "https://avatars.githubusercontent.com/u/88063803?v=4",
        github: "Suisuroru",
        description: {
          zh: "前端开发、API开发",
          en: "Frontend development, API development",
        },
      },
      {
        name: "Jerry",
        avatar: "https://avatars.githubusercontent.com/u/89722472?v=4",
        github: "NatJerry",
        description: {
          zh: "",
          en: "Frontend development",
        },
      },
      {
        name: "NARCSSU",
        avatar: "https://avatars.githubusercontent.com/u/166523605?s=96&v=4",
        github: "NARCSSU",
        description: {
          zh: "前端开发",
          en: "Frontend development",
        },
      },
    ],
  },
];
