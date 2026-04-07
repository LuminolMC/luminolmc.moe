import { Suspense, lazy, useEffect, useRef, useState } from "react";
import Lenis from "lenis";

declare global {
  interface Window {
    lenisInstance: any;
  }
}

import {
  Github,
  MessageSquare,
  Send,
  Download,
  Code2,
  Zap,
  ShieldCheck,
  Database,
  BarChart3,
  ChevronRight,
  Copy,
  Check,
  ArrowUpRight,
} from "lucide-react";
import "./index.css";
import { Sidebar } from "./components";
import hljs from "highlight.js/lib/core";
import java from "highlight.js/lib/languages/java";
import yaml from "highlight.js/lib/languages/yaml";
import xml from "highlight.js/lib/languages/xml";
import gradle from "highlight.js/lib/languages/gradle";
import bash from "highlight.js/lib/languages/bash";

hljs.registerLanguage("java", java);
hljs.registerLanguage("yaml", yaml);
hljs.registerLanguage("xml", xml);
hljs.registerLanguage("gradle", gradle);
hljs.registerLanguage("bash", bash);

import { motion, AnimatePresence } from "motion/react";
import { useI18n } from "./i18n";

const loadFloatingSakuraIsland = () => import("./FloatingSakuraIsland");
const FloatingSakuraIsland = lazy(loadFloatingSakuraIsland);

const retuneVersion = "0.0.0";

type TimeValuePair = [number, number];
type TimeSeriesData = TimeValuePair[];
type SectionId =
  | "hero"
  | "features"
  | "projects"
  | "api"
  | "about"
  | "community";

const DOWNLOAD_PATH = "/download";
const SECTION_PATHS: Record<SectionId, string> = {
  hero: "/",
  features: "/features",
  projects: "/projects",
  api: "/api",
  about: "/about",
  community: "/community",
};

const PATH_TO_SECTION: Record<string, SectionId> = Object.fromEntries(
  Object.entries(SECTION_PATHS).map(([sectionId, path]) => [path, sectionId]),
) as Record<string, SectionId>;
const MOBILE_MEDIA_QUERY = "(max-width: 640px)";
const FLOATING_ISLAND_BACKGROUND = {
  background:
    "linear-gradient(to bottom, var(--color-bg-page) 0%, #f8fafc 30%, #e0f2fe 70%, #bae6fd 100%)",
} as const;

function normalizePathname(pathname: string): string {
  if (!pathname) return "/";
  const normalized = pathname.replace(/\/+$/, "");
  return normalized === "" ? "/" : normalized;
}

const MCNetherPortalParticles = () => {
  const particles = Array.from({ length: 60 }).map((_, i) => {
    const size = 4 + Math.floor(Math.random() * 6); // 4px to 9px, blocky
    const colors = ["#d8b4fe", "#c084fc", "#a855f7", "#9333ea"];
    const color = colors[Math.floor(Math.random() * colors.length)];

    // Spawn in a wide area, drift towards the center (logo)
    const angle = Math.random() * Math.PI * 2;
    const distance = 100 + Math.random() * 150;
    const startX = Math.cos(angle) * distance;
    const startY = Math.sin(angle) * distance;

    return {
      id: i,
      size,
      color,
      startX,
      startY,
      duration: 1.5 + Math.random() * 2,
      delay: Math.random() * 3,
    };
  });

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-0 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute"
          style={{
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: "0px", // Strictly square for MC
          }}
          initial={{ x: p.startX, y: p.startY, opacity: 0, scale: 0 }}
          animate={{
            x: [p.startX, p.startX * 0.5, 0],
            y: [p.startY, p.startY * 0.5 - 20, -40],
            opacity: [0, 1, 1, 0],
            scale: [0, 1, 0.8, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeIn",
          }}
        />
      ))}
    </div>
  );
};

export default function App() {
  const { t } = useI18n();

  const [copied, setCopied] = useState<string | null>(null);
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const [playerCount, setPlayerCount] = useState<number | null>(null);
  const [isMobileViewport, setIsMobileViewport] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(MOBILE_MEDIA_QUERY).matches;
  });
  const [shouldWarmFloatingIsland, setShouldWarmFloatingIsland] = useState(
    () => {
      if (typeof window === "undefined") return true;
      return !window.matchMedia(MOBILE_MEDIA_QUERY).matches;
    },
  );
  const [shouldRenderFloatingIsland, setShouldRenderFloatingIsland] = useState(
    () => {
      if (typeof window === "undefined") return true;
      return !window.matchMedia(MOBILE_MEDIA_QUERY).matches;
    },
  );
  const activeSectionRef = useRef<SectionId>("hero");
  const routeReadyRef = useRef(false);
  const modalPathActiveRef = useRef(false);
  const shouldSyncScrollUrlRef = useRef(!isMobileViewport);
  const footerRef = useRef<HTMLElement>(null);

  type StableTags = {
    luminol: string;
    lophine: string;
    lighting: string;
  };

  const FALLBACK_STABLE_TAGS: StableTags = {
    luminol: "1.21.11-e5ff8df",
    lophine: "1.21.11-ba1216d",
    lighting: "1.21.11-9b07d45",
  };

  const LOPHINE_EXPERIMENTAL_TAG = "1.21.11-5559fa8";

  const [stableTags, setStableTags] =
    useState<StableTags>(FALLBACK_STABLE_TAGS);

  useEffect(() => {
    shouldSyncScrollUrlRef.current = !isMobileViewport;
  }, [isMobileViewport]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia(MOBILE_MEDIA_QUERY);
    const syncViewport = () => {
      const nextIsMobile = mediaQuery.matches;
      setIsMobileViewport(nextIsMobile);
      if (!nextIsMobile) {
        setShouldWarmFloatingIsland(true);
        setShouldRenderFloatingIsland(true);
      }
    };

    syncViewport();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", syncViewport);
      return () => mediaQuery.removeEventListener("change", syncViewport);
    }

    mediaQuery.addListener(syncViewport);
    return () => mediaQuery.removeListener(syncViewport);
  }, []);

  useEffect(() => {
    if (!isMobileViewport || shouldWarmFloatingIsland) return;

    const footer = footerRef.current;
    if (!footer) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;

        setShouldWarmFloatingIsland(true);
        void loadFloatingSakuraIsland();
        observer.disconnect();
      },
      { rootMargin: "1400px 0px" },
    );

    observer.observe(footer);
    return () => observer.disconnect();
  }, [isMobileViewport, shouldWarmFloatingIsland]);

  useEffect(() => {
    if (!shouldWarmFloatingIsland) return;

    void loadFloatingSakuraIsland();
  }, [shouldWarmFloatingIsland]);

  useEffect(() => {
    if (!isMobileViewport || shouldRenderFloatingIsland) return;

    const footer = footerRef.current;
    if (!footer) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;

        setShouldRenderFloatingIsland(true);
        observer.disconnect();
      },
      { rootMargin: "900px 0px" },
    );

    observer.observe(footer);
    return () => observer.disconnect();
  }, [isMobileViewport, shouldRenderFloatingIsland]);

  function replaceUrl(pathname: string) {
    const nextPath = normalizePathname(pathname);
    if (typeof window === "undefined") return;
    if (normalizePathname(window.location.pathname) === nextPath) return;
    window.history.replaceState(window.history.state, "", nextPath);
  }

  function scrollToSection(sectionId: SectionId, immediate = false) {
    if (typeof window === "undefined") return;

    const run = () => {
      if (sectionId === "hero") {
        if (window.lenisInstance) {
          window.lenisInstance.scrollTo(0, { immediate });
        } else {
          window.scrollTo({ top: 0, behavior: immediate ? "auto" : "smooth" });
        }
        return;
      }

      const el = document.getElementById(sectionId);
      if (!el) return;

      if (window.lenisInstance) {
        window.lenisInstance.scrollTo(el, { offset: -24, immediate });
      } else {
        el.scrollIntoView({ behavior: immediate ? "auto" : "smooth" });
      }
    };

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(run);
    });
  }

  function openDownloadModal() {
    modalPathActiveRef.current = true;
    setIsDownloadOpen(true);
    replaceUrl(DOWNLOAD_PATH);
  }

  function closeDownloadModal() {
    modalPathActiveRef.current = false;
    setIsDownloadOpen(false);
    replaceUrl(SECTION_PATHS[activeSectionRef.current]);
  }

  function applyPathname(pathname: string, immediate = false) {
    const normalizedPath = normalizePathname(pathname);

    if (normalizedPath === DOWNLOAD_PATH) {
      modalPathActiveRef.current = true;
      setIsDownloadOpen(true);
      routeReadyRef.current = true;
      return;
    }

    const sectionId = PATH_TO_SECTION[normalizedPath] ?? "hero";
    modalPathActiveRef.current = false;
    setIsDownloadOpen(false);
    activeSectionRef.current = sectionId;

    if (!(normalizedPath in PATH_TO_SECTION)) {
      replaceUrl(SECTION_PATHS[sectionId]);
    }

    scrollToSection(sectionId, immediate);
    routeReadyRef.current = true;
  }

  function parseTag(tag: string): { version: string; build: string } {
    const idx = tag.indexOf("-");
    if (idx === -1) return { version: tag, build: "" };
    return { version: tag.slice(0, idx), build: tag.slice(idx + 1) };
  }

  const downloadItems = [
    {
      key: "luminol-stable",
      owner: "LuminolMC",
      repo: "Luminol",
      name: "Luminol",
      channelKey: "download.stable",
      tag: stableTags.luminol,
    },
    {
      key: "lophine-stable",
      owner: "LuminolMC",
      repo: "Lophine",
      name: "Lophine",
      channelKey: "download.stable",
      tag: stableTags.lophine,
    },
    {
      key: "lophine-experimental",
      owner: "LuminolMC",
      repo: "Lophine",
      name: "Lophine",
      channelKey: "download.experience",
      tag: LOPHINE_EXPERIMENTAL_TAG,
    },
    {
      key: "lighting-stable",
      owner: "LuminolMC",
      repo: "LightingLuminol",
      name: "LightingLuminol",
      channelKey: "download.stable",
      tag: stableTags.lighting,
    },
  ] as const;

  const projectsData = [
    {
      id: "luminol",
      name: "Luminol",
      tag: t("projects.luminol.tag"),
      icon: "/assets/logo/luminol_icon.svg",
      wordmark: "/assets/logo/luminol_wordmark.svg",
      desc: t("projects.luminol.desc"),
      link: "https://github.com/LuminolMC/Luminol",
    },
    {
      id: "lophine",
      name: "Lophine",
      tag: t("projects.lophine.tag"),
      icon: "/assets/logo/lophine_icon_logo_hd.png",
      wordmark: "/assets/logo/lophine_wordmark_hd.png",
      desc: t("projects.lophine.desc"),
      link: "https://github.com/LuminolMC/Lophine",
    },
    {
      id: "lighting",
      name: "LightingLuminol",
      tag: t("projects.lighting.tag"),
      icon: "/assets/logo/lighting_icon_logo_hd.png",
      wordmark: "/assets/logo/lighting_wordmark_hd.png",
      desc: t("projects.lighting.desc"),
      link: "https://github.com/LuminolMC/LightingLuminol",
    },
  ] as const;

  const teamData = [
    {
      category: t("team.categories.core"),
      members: [
        {
          name: "MrHua269",
          role: t("team.roles.luminolFounder"),
          github: "https://github.com/MrHua269",
          avatar: "https://avatars.githubusercontent.com/u/79621885?v=4",
        },
        {
          name: "Suisuroru",
          role: t("team.roles.lophineLead"),
          github: "https://github.com/Suisuroru",
          avatar: "https://avatars.githubusercontent.com/u/88063803?v=4",
        },
        {
          name: "Bacteriawa",
          role: t("team.roles.lightingMaintainer"),
          github: "https://github.com/Bacteriawa",
          avatar: "https://avatars.githubusercontent.com/u/174142951?v=4",
        },
      ],
    },
    {
      category: t("team.categories.community"),
      members: [
        {
          name: "Dreeam",
          role: t("team.roles.communitySupporter"),
          github: "https://github.com/Dreeam-qwq",
          avatar: "https://avatars.githubusercontent.com/u/61569423?v=4",
        },
        {
          name: "Shuakami",
          role: t("team.roles.frontendRefactorCoreContributor"),
          github: "https://github.com/Shuakami",
          avatar: "https://avatars.githubusercontent.com/u/149454909?v=4",
        },
        {
          name: "xiaoyueyoqwq",
          role: t("Try Nextjs!"),
          github: "https://github.com/xiaoyueyoqwq",
          avatar: "https://avatars.githubusercontent.com/u/71379165?v=4",
        },
      ],
    },
    {
      category: t("team.categories.ecosystem"),
      members: [
        {
          name: "Klop233",
          role: t("team.roles.frontendApiDev"),
          github: "https://github.com/Klop233",
          avatar: "https://avatars.githubusercontent.com/u/62453589?v=4",
        },
        {
          name: "Suisuroru",
          role: t("team.roles.frontendApiDev"),
          github: "https://github.com/Suisuroru",
          avatar: "https://avatars.githubusercontent.com/u/88063803?v=4",
        },
        {
          name: "Jerry",
          role: t("team.roles.frontendDev"),
          github: "https://github.com/NatJerry",
          avatar: "https://avatars.githubusercontent.com/u/89722472?v=4",
        },
        {
          name: "NARCSSU",
          role: t("team.roles.frontendDev"),
          github: "https://github.com/NARCSSU",
          avatar: "https://avatars.githubusercontent.com/u/166523605?s=96&v=4",
        },
      ],
    },
  ] as const;

  useEffect(() => {
    const urls = [
      "https://bstats.org/api/v1/plugins/20909/charts/players/data",
      "https://bstats.org/api/v1/plugins/26599/charts/players/data",
      "https://bstats.org/api/v1/plugins/26215/charts/players/data",
    ];
    const controllers = urls.map(() => new AbortController());
    const timeoutIds = controllers.map((controller) =>
      window.setTimeout(() => controller.abort(), 12000),
    );

    (async () => {
      try {
        const counts = await Promise.all(
          urls.map(async (url, index) => {
            const res = await fetch(url, { signal: controllers[index].signal });
            if (!res.ok) {
              throw new Error(`Failed to fetch player stats: ${res.status}`);
            }

            const data = (await res.json()) as unknown;
            if (!Array.isArray(data) || data.length === 0) {
              throw new Error("Invalid player stats response");
            }

            const latest = data[data.length - 1] as TimeSeriesData[number];
            if (
              !Array.isArray(latest) ||
              latest.length < 2 ||
              typeof latest[1] !== "number"
            ) {
              throw new Error("Invalid player stats entry");
            }

            return latest[1];
          }),
        );

        setPlayerCount(counts.reduce((sum, value) => sum + value, 0));
      } catch {
        setPlayerCount(null);
      } finally {
        timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId));
      }
    })();

    return () => {
      timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId));
      controllers.forEach((controller) => controller.abort());
    };
  }, []);

  useEffect(() => {
    const CACHE_KEY = "downloads.latestStableTags.v1";

    if (typeof window === "undefined") return;

    function readCache(): { ts: number; tags: StableTags } | null {
      try {
        const raw = window.localStorage.getItem(CACHE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as { ts?: unknown; tags?: unknown };
        if (
          !parsed ||
          typeof parsed !== "object" ||
          typeof parsed.ts !== "number" ||
          !parsed.tags ||
          typeof parsed.tags !== "object"
        ) {
          return null;
        }
        const tagsObj = parsed.tags as Record<string, unknown>;
        const tags: StableTags = {
          luminol:
            typeof tagsObj.luminol === "string"
              ? tagsObj.luminol
              : FALLBACK_STABLE_TAGS.luminol,
          lophine:
            typeof tagsObj.lophine === "string"
              ? tagsObj.lophine
              : FALLBACK_STABLE_TAGS.lophine,
          lighting:
            typeof tagsObj.lighting === "string"
              ? tagsObj.lighting
              : FALLBACK_STABLE_TAGS.lighting,
        };
        return { ts: parsed.ts, tags };
      } catch {
        return null;
      }
    }

    function writeCache(tags: StableTags) {
      try {
        window.localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({ ts: Date.now(), tags }),
        );
      } catch {
        // ignore
      }
    }

    function sleep(ms: number) {
      return new Promise((resolve) => window.setTimeout(resolve, ms));
    }

    async function fetchLatest(repoFullName: string): Promise<string | null> {
      const maxRetries = 3;

      for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
        try {
          const res = await fetch(
            `https://uapis.cn/api/v1/github/repo?repo=${encodeURIComponent(repoFullName)}`,
          );

          if (res.status === 429) {
            if (attempt === maxRetries) return null;

            const backoffMs = 500 * 2 ** attempt;
            await sleep(backoffMs);
            continue;
          }

          if (!res.ok) return null;

          const json = (await res.json()) as {
            latest_release?: { tag_name?: unknown };
          };
          return typeof json.latest_release?.tag_name === "string"
            ? json.latest_release.tag_name
            : null;
        } catch {
          if (attempt === maxRetries) return null;

          const backoffMs = 500 * 2 ** attempt;
          await sleep(backoffMs);
        }
      }

      return null;
    }

    const cache = readCache();
    if (cache) {
      setStableTags(cache.tags);
    }

    (async () => {
      const [luminol, lophine, lighting] = await Promise.all([
        fetchLatest("LuminolMC/Luminol"),
        fetchLatest("LuminolMC/Lophine"),
        fetchLatest("LuminolMC/LightingLuminol"),
      ]);

      const next: StableTags = {
        luminol: luminol ?? cache?.tags.luminol ?? FALLBACK_STABLE_TAGS.luminol,
        lophine: lophine ?? cache?.tags.lophine ?? FALLBACK_STABLE_TAGS.lophine,
        lighting:
          lighting ?? cache?.tags.lighting ?? FALLBACK_STABLE_TAGS.lighting,
      };

      setStableTags(next);
      writeCache(next);
    })();
  }, []);

  useEffect(() => {
    // We rely on data-lenis-prevent="true" to handle scroll locking within the modal.
    // To prevent body scrolling without layout shift, we can pause lenis.
    if (window.lenisInstance) {
      if (isDownloadOpen) {
        window.lenisInstance.stop();
      } else {
        window.lenisInstance.start();
      }
    }
  }, [isDownloadOpen]);

  useEffect(() => {
    const lenis = new Lenis({
      autoRaf: true,
      lerp: 0.1,
      wheelMultiplier: 0.8,
      smoothWheel: true,
    });
    window.lenisInstance = lenis;

    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      if (!anchor) return;
      if (
        anchor.target === "_blank" ||
        anchor.hasAttribute("download") ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }

      const href = anchor.getAttribute("href");
      if (!href) return;

      if (href.startsWith("#")) {
        e.preventDefault();
        const sectionId = href === "#" ? "hero" : href.slice(1);
        if (
          sectionId === "hero" ||
          sectionId === "features" ||
          sectionId === "projects" ||
          sectionId === "api" ||
          sectionId === "about" ||
          sectionId === "community"
        ) {
          activeSectionRef.current = sectionId;
          modalPathActiveRef.current = false;
          setIsDownloadOpen(false);
          replaceUrl(SECTION_PATHS[sectionId]);
          scrollToSection(sectionId);
        }
        return;
      }

      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;

      const normalizedPath = normalizePathname(url.pathname);
      if (
        !(normalizedPath in PATH_TO_SECTION) &&
        normalizedPath !== DOWNLOAD_PATH
      ) {
        return;
      }

      e.preventDefault();

      if (normalizedPath === DOWNLOAD_PATH) {
        openDownloadModal();
        return;
      }

      const sectionId = PATH_TO_SECTION[normalizedPath] ?? "hero";
      activeSectionRef.current = sectionId;
      modalPathActiveRef.current = false;
      setIsDownloadOpen(false);
      replaceUrl(SECTION_PATHS[sectionId]);
      scrollToSection(sectionId);
    };

    document.addEventListener("click", handleAnchorClick);
    return () => {
      document.removeEventListener("click", handleAnchorClick);
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>(
      ".hero, .section-v2[id], .footer-section[id]",
    );
    const observer = new IntersectionObserver(
      (entries) => {
        if (!routeReadyRef.current || modalPathActiveRef.current) return;

        for (const entry of entries) {
          if (!entry.isIntersecting) continue;

          const id = entry.target.id as SectionId;
          if (!(id in SECTION_PATHS)) continue;

          activeSectionRef.current = id;
          if (!shouldSyncScrollUrlRef.current) continue;
          replaceUrl(SECTION_PATHS[id]);
        }
      },
      { rootMargin: "-20% 0px -60% 0px" },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    applyPathname(window.location.pathname, true);

    const handlePopState = () => {
      applyPathname(window.location.pathname, true);
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const gradleCode = `repositories {
    maven {
        url = "https://repo.menthamc.org/repository/maven-public/"
    }
}

dependencies {
    compileOnly("me.earthme.luminol:luminol-api:$VERSION")
}`;

  const mavenCode = `<repositories>
    <repository>
        <id>menthamc</id>
        <url>https://repo.menthamc.org/repository/maven-public/</url>
    </repository>
</repositories>

<dependencies>
    <dependency>
        <groupId>me.earthme.luminol</groupId>
        <artifactId>luminol-api</artifactId>
        <version>$VERSION</version>
        <scope>provided</scope>
    </dependency>
</dependencies>`;

  const terminalCode = "java -Xms4G -Xmx4G -jar luminol.jar --nogui";
  const luminolYamlCode = `# ${t("quickStart.yamlExampleComment")}
region-format: LINEAR
tpsbar:
  enabled: true
  style: BOSSBAR
fix-folia-bugs: true`;

  return (
    <>
      <div className="layout">
        <Sidebar version={retuneVersion} />

        <main className="content" id="main-content">
          {/* ── Hero Section ── */}
          <section className="hero hero-v2" id="hero">
            <div className="hero-v2-shell">
              <div className="hero-title-group">
                <div className="hero-logo-container">
                  <img
                    src="/assets/logo/luminol_icon.svg"
                    alt="Luminol Logo"
                    className="hero-main-logo"
                  />
                </div>
                <h1 className="hero-title">Luminol</h1>
                <p className="hero-tagline">{t("hero.tagline")}</p>
              </div>

              <div className="hero-badges">
                <img
                  src="https://img.shields.io/github/created-at/LuminolMC/Luminol?style=for-the-badge&color=B6ADE6"
                  alt="Created At"
                />
                <img
                  src="https://img.shields.io/github/license/LuminolMC/Luminol?style=for-the-badge&color=B6ADE6"
                  alt="License"
                />
                <img
                  src="https://img.shields.io/github/issues/LuminolMC/Luminol?style=for-the-badge&color=B6ADE6"
                  alt="Issues"
                />
                <img
                  src="https://img.shields.io/github/commit-activity/w/LuminolMC/Luminol?style=for-the-badge&color=B6ADE6"
                  alt="Commit Activity"
                />
                <img
                  src="https://img.shields.io/github/downloads/LuminolMC/Luminol/total?style=for-the-badge&color=B6ADE6"
                  alt="Downloads"
                />
              </div>

              <div className="hero-actions">
                <button onClick={openDownloadModal} className="cta-primary">
                  {t("ui.downloadNow")}
                </button>
                <a
                  href="https://github.com/LuminolMC/Luminol"
                  className="cta-secondary"
                >
                  {t("ui.githubRepo")}
                </a>
              </div>
            </div>
          </section>

          {/* ── Core Features ── */}
          <section className="section-v2 section-v2-after-hero" id="features">
            <div className="section-header">
              <h2 className="section-title">{t("sections.whyChooseTitle")}</h2>
            </div>
            <div className="features-list">
              <div className="feature-card">
                <div className="feature-content">
                  <h3>{t("features.threading.title")}</h3>
                  <p>{t("features.threading.desc")}</p>
                </div>
              </div>
              <div className="feature-card">
                <div className="feature-content">
                  <h3>{t("features.linear.title")}</h3>
                  <p>{t("features.linear.desc")}</p>
                </div>
              </div>
              <div className="feature-card">
                <div className="feature-content">
                  <h3>{t("features.stability.title")}</h3>
                  <p>{t("features.stability.desc")}</p>
                </div>
              </div>
              <div className="feature-card">
                <div className="feature-content">
                  <h3>{t("features.config.title")}</h3>
                  <p>
                    {t("features.config.descBeforeFile")}
                    <code>luminol_global_config.toml</code>
                    {t("features.config.descAfterFile")}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ── Project Family ── */}
          <section className="section-v2" id="projects">
            <div className="section-header">
              <h2 className="section-title">
                {t("sections.projectFamilyTitle")}
              </h2>
            </div>
            <div className="project-list-v2">
              {projectsData.map((proj) => (
                <a
                  key={proj.id}
                  href={proj.link}
                  target="_blank"
                  rel="noreferrer"
                  className="project-item-v2 group cursor-pointer"
                >
                  <div className="project-header-v2">
                    <div className="project-logo-wrapper">
                      <img
                        src={proj.icon}
                        alt={`${proj.name} Icon`}
                        className="project-icon"
                      />
                      {proj.id === "luminol" ? (
                        <span className="project-wordmark text-wordmark">
                          Luminol
                        </span>
                      ) : (
                        <img
                          src={proj.wordmark}
                          alt={`${proj.name} Wordmark`}
                          className="project-wordmark"
                        />
                      )}
                    </div>
                    <div className="project-meta-v2">
                      <span className="project-tag-v2">{proj.tag}</span>
                      <ArrowUpRight className="project-arrow" size={20} />
                    </div>
                  </div>
                  <p className="project-desc-v2">{proj.desc}</p>
                </a>
              ))}
            </div>
          </section>

          {/* ── API Usage ── */}
          <section className="section-v2" id="api">
            <div className="section-header">
              <h2 className="section-title">{t("sections.apiUsageTitle")}</h2>
            </div>
            <div className="api-content">
              <p className="api-intro">{t("api.intro")}</p>
              <div className="code-tabs">
                <div className="code-block-container">
                  <div className="code-block-header">
                    <span>Gradle (Kotlin)</span>
                    <button
                      onClick={() => copyToClipboard(gradleCode, "gradle")}
                      className="copy-btn"
                    >
                      {copied === "gradle" ? (
                        <Check size={14} />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                  </div>
                  <pre
                    className="code-block-content hljs"
                    dangerouslySetInnerHTML={{
                      __html: hljs.highlight(gradleCode, { language: "gradle" })
                        .value,
                    }}
                  />
                </div>
                <div className="code-block-container">
                  <div className="code-block-header">
                    <span>Maven</span>
                    <button
                      onClick={() => copyToClipboard(mavenCode, "maven")}
                      className="copy-btn"
                    >
                      {copied === "maven" ? (
                        <Check size={14} />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                  </div>
                  <pre
                    className="code-block-content hljs"
                    dangerouslySetInnerHTML={{
                      __html: hljs.highlight(mavenCode, { language: "xml" })
                        .value,
                    }}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* ── About Us ── */}
          <section className="section-v2" id="about">
            <div className="section-header">
              <h2 className="section-title">{t("sections.aboutUsTitle")}</h2>
            </div>
            <div className="flex flex-col gap-12">
              {teamData.map((group, i) => (
                <div key={i}>
                  <h3 className="text-xl font-medium mb-6 text-[var(--color-text-secondary)]">
                    {group.category}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {group.members.map((member, j) => (
                      <a
                        key={j}
                        href={member.github}
                        target="_blank"
                        rel="noreferrer"
                        className="group flex items-center gap-4 p-4 rounded-2xl bg-[var(--color-border-faint)] hover:bg-[var(--color-border-subtle)] transition-all duration-300 border border-transparent hover:border-[var(--color-border)]"
                      >
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex flex-col">
                          <span className="text-base font-medium text-[var(--color-text-primary)] group-hover:text-[var(--color-cta-bg)] transition-colors">
                            {member.name}
                          </span>
                          <span className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                            {member.role}
                          </span>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>

      <footer ref={footerRef} className="footer-v2 full-width-footer relative">
        <div
          className="light-only absolute inset-0 z-0 pointer-events-none overflow-hidden"
          style={FLOATING_ISLAND_BACKGROUND}
        >
          {shouldRenderFloatingIsland ? (
            <Suspense fallback={null}>
              <FloatingSakuraIsland />
            </Suspense>
          ) : null}
        </div>

        <div className="huge-footer-logo relative z-10">
          <div className="dark-only absolute inset-0 flex items-center justify-center">
            <motion.div
              className="absolute inset-0 bg-[var(--color-cta-bg)] rounded-full blur-[80px] opacity-20"
              animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.img
              src="/assets/logo/luminol_icon.svg"
              alt="Luminol Huge"
              className="huge-svg relative z-10"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
            <div className="absolute inset-0 pointer-events-none">
              <MCNetherPortalParticles />
            </div>
          </div>
        </div>

        <div className="footer-content-wrapper relative z-10">
          <div className="footer-section" id="community">
            <h3 className="footer-title">{t("footer.communityTitle")}</h3>
            <div className="footer-links">
              <a href="https://qm.qq.com/q/cFB0SXpWOQ" className="footer-link">
                {t("footer.qqGroup", { id: "1015048616" })}
              </a>
              <a href="https://t.me/LuminolMinecraft" className="footer-link">
                {t("footer.telegram")}
              </a>
              <a href="https://discord.gg/Qd7m3V6eDx" className="footer-link">
                {t("footer.discord")}
              </a>
            </div>
          </div>

          <div className="footer-section" id="ecosystem">
            <h3 className="footer-title">{t("footer.ecosystemTitle")}</h3>
            <div className="footer-links">
              <a
                href="https://craft.luminolsuki.moe/"
                target="_blank"
                rel="noreferrer"
                className="footer-link"
                title={t("footer.craftTooltip")}
              >
                {t("footer.craftTitle")}
              </a>
            </div>
          </div>

          <div className="footer-section" id="sponsors">
            <h3 className="footer-title">{t("footer.sponsorsTitle")}</h3>
            <div className="footer-sponsors">
              <a
                href="https://www.rainyun.com/rgs/aiyuyun_"
                target="_blank"
                rel="noreferrer"
                className="footer-sponsor footer-sponsor-link"
              >
                <img
                  src="/assets/logo/Rainyun.svg"
                  alt="Rainyun"
                  className="footer-sponsor-logo-original"
                />
                <span>{t("footer.sponsorRainyun")}</span>
              </a>
              <a
                href="https://www.ej-technologies.com/jprofiler"
                target="_blank"
                rel="noreferrer"
                className="footer-sponsor footer-sponsor-link"
              >
                <img
                  src="https://www.ej-technologies.com/images/product_banners/jprofiler_large.png"
                  alt="JProfiler"
                  className="footer-sponsor-logo-original"
                />
                <span>{t("footer.sponsorJProfiler")}</span>
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom-v2">
          <div className="footer-brand">
            <span>{t("footer.brand")}</span>
            <AnimatePresence initial={false}>
              {playerCount !== null ? (
                <motion.div
                  key="player-count"
                  className="footer-stats-v2"
                  initial={{ opacity: 0, filter: "blur(12px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, filter: "blur(12px)" }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  {t("footer.servingPlayers", { players: playerCount })}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
          <div className="footer-legal">
            <p>{t("footer.copyright")}</p>
            <p className="disclaimer">{t("footer.disclaimer")}</p>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {isDownloadOpen && (
          <div className="fixed inset-0 z-[99999] overflow-y-auto overflow-x-hidden no-scrollbar">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="fixed inset-0 bg-[var(--color-bg-page)]/80 backdrop-blur-2xl"
              onClick={closeDownloadModal}
            />
            <motion.div
              data-lenis-prevent="true"
              initial={{ opacity: 0, scale: 0.98, filter: "blur(10px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.98, filter: "blur(10px)" }}
              transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
              className="relative min-h-screen flex flex-col px-6 py-12 md:px-16 md:py-24 max-w-[1400px] mx-auto text-[var(--color-text-primary)] no-scrollbar"
            >
              {/* Close Button (Absolute Top Right) */}
              <button
                onClick={closeDownloadModal}
                className="absolute top-6 right-6 md:top-12 md:right-12 p-2 opacity-40 hover:opacity-100 transition-opacity duration-300 z-50"
                aria-label={t("ui.close")}
              >
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>

              {/* Header */}
              <div className="flex justify-between items-center mb-16 md:mb-24">
                <img
                  src="/assets/logo/luminol_icon.svg"
                  alt="Luminol Logo"
                  className="w-12 h-12 md:w-16 md:h-16"
                />
              </div>

              <div className="flex flex-col lg:flex-row gap-16 lg:gap-40">
                {/* Left Column: Download */}
                <div className="lg:w-1/3 flex flex-col sticky top-24 self-start">
                  <h2 className="text-3xl md:text-5xl font-light tracking-tight mb-8">
                    {t("download.title")}
                  </h2>
                  <p className="text-base text-[var(--color-text-secondary)] mb-12 leading-relaxed font-light">
                    {t("download.desc")}
                  </p>

                  <div className="flex flex-col gap-4">
                    {downloadItems.map((item) => {
                      const { version, build } = parseTag(item.tag);
                      const subtitle = build
                        ? `${t(item.channelKey)} • ${version} • ${t("download.buildLabel")} ${build}`
                        : `${t(item.channelKey)} • ${version}`;

                      return (
                        <a
                          key={item.key}
                          href={`https://github.com/${item.owner}/${item.repo}/releases/tag/${item.tag}`}
                          target="_blank"
                          rel="noreferrer"
                          className="group flex items-center justify-between p-6 rounded-2xl bg-[var(--color-border-faint)] hover:bg-[var(--color-border-subtle)] transition-all duration-300"
                        >
                          <div>
                            <div className="text-base font-medium mb-1 group-hover:text-[var(--color-cta-bg)] transition-colors">
                              {item.name}
                            </div>
                            <div className="text-xs text-[var(--color-text-secondary)] font-mono opacity-80">
                              {subtitle}
                            </div>
                          </div>
                          <div className="text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] transition-all duration-300">
                            <Download size={22} strokeWidth={1.5} />
                          </div>
                        </a>
                      );
                    })}
                  </div>
                </div>

                {/* Right Column: Quick Start Steps */}
                <div className="lg:w-2/3">
                  <h3 className="text-2xl font-light mb-12 tracking-tight">
                    {t("quickStart.title")}
                  </h3>
                  <div className="space-y-16">
                    {/* Step 1 */}
                    <div className="relative pl-10 border-l border-[var(--color-border-faint)]">
                      <div className="absolute w-3 h-3 bg-[var(--color-text-primary)] rounded-full -left-[6.5px] top-1.5"></div>
                      <h4 className="text-lg font-medium mb-4">
                        {t("quickStart.step1Title")}
                      </h4>
                      <p className="text-base text-[var(--color-text-secondary)] mb-6 leading-relaxed font-light">
                        {t("quickStart.step1Desc")}
                      </p>
                      <div className="code-block-container !m-0">
                        <div className="code-block-header">
                          <span>Terminal</span>
                          <button
                            onClick={() =>
                              copyToClipboard(terminalCode, "terminal")
                            }
                            className="copy-btn"
                          >
                            {copied === "terminal" ? (
                              <Check size={16} />
                            ) : (
                              <Copy size={16} />
                            )}
                          </button>
                        </div>
                        <pre
                          className="code-block-content hljs text-sm"
                          dangerouslySetInnerHTML={{
                            __html: hljs.highlight(terminalCode, {
                              language: "bash",
                            }).value,
                          }}
                        />
                      </div>
                      <p className="text-sm text-[var(--color-text-secondary)] mt-6 font-light">
                        {t("quickStart.step1NoteBefore")}
                        <code>eula.txt</code>
                        {t("quickStart.step1NoteMiddle")}
                        <code>false</code>
                        {t("quickStart.step1NoteAfter")}
                        <code>true</code>
                        {t("quickStart.step1NoteEnd")}
                      </p>
                    </div>

                    {/* Step 2 */}
                    <div className="relative pl-10 border-l border-[var(--color-border-faint)]">
                      <div className="absolute w-3 h-3 bg-[var(--color-text-primary)] rounded-full -left-[6.5px] top-1.5"></div>
                      <h4 className="text-lg font-medium mb-4">
                        {t("quickStart.step2Title")}
                      </h4>
                      <p className="text-base text-[var(--color-text-secondary)] mb-6 leading-relaxed font-light">
                        {t("quickStart.step2DescBeforeFile")}
                        <code>luminol_global_config.toml</code>
                        {t("quickStart.step2DescAfterFile")}
                      </p>
                      <div className="code-block-container !m-0">
                        <div className="code-block-header">
                          <span>luminol_global_config.toml</span>
                          <button
                            onClick={() =>
                              copyToClipboard(luminolYamlCode, "luminol")
                            }
                            className="copy-btn"
                          >
                            {copied === "luminol" ? (
                              <Check size={16} />
                            ) : (
                              <Copy size={16} />
                            )}
                          </button>
                        </div>
                        <pre
                          className="code-block-content hljs text-sm"
                          dangerouslySetInnerHTML={{
                            __html: hljs.highlight(luminolYamlCode, {
                              language: "yaml",
                            }).value,
                          }}
                        />
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div className="relative pl-10 border-l border-transparent">
                      <div className="absolute w-3 h-3 bg-[var(--color-text-primary)] rounded-full -left-[6.5px] top-1.5"></div>
                      <h4 className="text-lg font-medium mb-4">
                        {t("quickStart.step3Title")}
                      </h4>
                      <p className="text-base text-[var(--color-text-secondary)] leading-relaxed font-light">
                        {t("quickStart.step3Desc")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
