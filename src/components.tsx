import React, { useState, useRef, useLayoutEffect, useEffect } from "react";
import { flushSync } from "react-dom";
import { motion, AnimatePresence } from "motion/react";

import { useI18n } from "./i18n";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      return !!(window as unknown as { __INITIAL_DARK__?: boolean })
        .__INITIAL_DARK__;
    }
    return false;
  });
  const overlayRef = useRef<HTMLDivElement>(null);
  const revealAnim = useRef<Animation | null>(null);
  const appliedDark = useRef(isDark);
  const animatingRef = useRef(false);

  useLayoutEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      isDark ? "dark" : "light",
    );
  }, [isDark]);

  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (!animatingRef.current || !revealAnim.current) return;
      const btn = document.getElementById("theme-btn");
      if (!btn) return;
      const r = btn.getBoundingClientRect();
      if (
        e.clientX >= r.left &&
        e.clientX <= r.right &&
        e.clientY >= r.top &&
        e.clientY <= r.bottom
      ) {
        e.stopPropagation();
        revealAnim.current.reverse();
      }
    }
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      if (revealAnim.current) {
        revealAnim.current.cancel();
        revealAnim.current = null;
      }
    };
  }, []);

  function applyTheme(dark: boolean) {
    setIsDark(dark);
    appliedDark.current = dark;
    document.documentElement.setAttribute(
      "data-theme",
      dark ? "dark" : "light",
    );
    localStorage.setItem("theme", dark ? "dark" : "light");
  }

  function toggle(e: React.MouseEvent) {
    const next = !appliedDark.current;

    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      applyTheme(next);
      return;
    }

    const x = e.clientX;
    const y = e.clientY;
    const maxDist = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );
    const endSize = maxDist * 2;

    const size = 32;
    let rects = "";
    const r = size / 2;
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        const dx = j - r + 0.5;
        const dy = i - r + 0.5;
        if (dx * dx + dy * dy <= r * r) {
          rects += `<rect x="${j}" y="${i}" width="1.1" height="1.1" fill="black"/>`;
        }
      }
    }
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges">${rects}</svg>`;
    const encodedSvg = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

    if (document.startViewTransition) {
      if (animatingRef.current) {
        if (revealAnim.current) revealAnim.current.reverse();
        return;
      }

      animatingRef.current = true;

      const transition = document.startViewTransition(() => {
        document.documentElement.setAttribute("data-vt", "");
        flushSync(() => applyTheme(next));
        getComputedStyle(document.documentElement).opacity;
        document.documentElement.removeAttribute("data-vt");
      });

      transition.ready.then(() => {
        let styleEl = document.querySelector("style[data-theme-reveal]");
        if (!styleEl) {
          styleEl = document.createElement("style");
          styleEl.setAttribute("data-theme-reveal", "");
          document.head.appendChild(styleEl);
        }
        styleEl.textContent = `
          ::view-transition-new(root) {
            mask-image: url("${encodedSvg}");
            mask-repeat: no-repeat;
            mask-size: var(--reveal-size) var(--reveal-size);
            mask-position: calc(${x}px - var(--reveal-size) / 2) calc(${y}px - var(--reveal-size) / 2);
            -webkit-mask-image: url("${encodedSvg}");
            -webkit-mask-repeat: no-repeat;
            -webkit-mask-size: var(--reveal-size) var(--reveal-size);
            -webkit-mask-position: calc(${x}px - var(--reveal-size) / 2) calc(${y}px - var(--reveal-size) / 2);
          }
        `;

        const anim = document.documentElement.animate(
          {
            "--reveal-size": ["0px", `${endSize}px`],
          } as PropertyIndexedKeyframes,
          {
            duration: 800,
            easing: "cubic-bezier(0.4, 0, 0.2, 1)",
            pseudoElement: "::view-transition-new(root)",
            fill: "both",
          },
        );
        revealAnim.current = anim;

        anim.onfinish = () => {
          if (anim.playbackRate < 0) {
            document.documentElement.setAttribute("data-vt", "");
            flushSync(() => applyTheme(!appliedDark.current));
            getComputedStyle(document.documentElement).opacity;
            document.documentElement.removeAttribute("data-vt");
          }
          animatingRef.current = false;
          revealAnim.current = null;
        };
      });
      return;
    }

    const overlay = overlayRef.current;
    if (!overlay) return;

    if (
      revealAnim.current &&
      revealAnim.current.playState !== "finished" &&
      revealAnim.current.playState !== "idle"
    ) {
      revealAnim.current.reverse();
      return;
    }
    if (revealAnim.current) {
      revealAnim.current.cancel();
      overlay.style.display = "none";
      revealAnim.current = null;
    }

    const oldBg = getComputedStyle(document.documentElement)
      .getPropertyValue("--color-bg-page")
      .trim();
    applyTheme(next);

    overlay.style.background = oldBg;
    overlay.style.maskImage = "none";
    overlay.style.webkitMaskImage = "none";
    overlay.style.display = "block";

    const anim = overlay.animate(
      { opacity: [1, 0] },
      { duration: 400, easing: "ease", fill: "both" },
    );
    revealAnim.current = anim;

    anim.addEventListener("finish", () => {
      if (revealAnim.current !== anim) return;
      if (anim.playbackRate < 0) {
        const old = !appliedDark.current;
        applyTheme(old);
      }
      overlay.style.display = "none";
      revealAnim.current = null;
    });
  }

  return (
    <>
      <div ref={overlayRef} className="theme-reveal" />
      <button
        id="theme-btn"
        className="theme-toggle"
        onClick={toggle}
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        suppressHydrationWarning
      >
        <svg
          id="theme-sun"
          className={`theme-icon theme-icon-sun${isDark ? " active" : ""}`}
          suppressHydrationWarning
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M11.9982 3.29083V1.76758M5.83985 18.1586L4.76275 19.2357M11.9982 22.2327V20.7094M19.2334 4.76468L18.1562 5.84179M20.707 12.0001H22.2303M18.1562 18.1586L19.2334 19.2357M1.76562 12.0001H3.28888M4.76267 4.76462L5.83977 5.84173M15.7104 8.28781C17.7606 10.3381 17.7606 13.6622 15.7104 15.7124C13.6601 17.7627 10.336 17.7627 8.28574 15.7124C6.23548 13.6622 6.23548 10.3381 8.28574 8.28781C10.336 6.23756 13.6601 6.23756 15.7104 8.28781Z" />
        </svg>
        <svg
          id="theme-moon"
          className={`theme-icon theme-icon-moon${isDark ? "" : " active"}`}
          suppressHydrationWarning
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21.2481 11.8112C20.1889 12.56 18.8958 13 17.5 13C13.9101 13 11 10.0899 11 6.5C11 5.10416 11.44 3.81108 12.1888 2.75189C12.126 2.75063 12.0631 2.75 12 2.75C6.89137 2.75 2.75 6.89137 2.75 12C2.75 17.1086 6.89137 21.25 12 21.25C17.1086 21.25 21.25 17.1086 21.25 12C21.25 11.9369 21.2494 11.874 21.2481 11.8112Z" />
        </svg>
      </button>
    </>
  );
}

export function LanguageToggle() {
  const { lang, toggleLang, t } = useI18n();

  return (
    <button
      id="lang-btn"
      className="theme-toggle relative flex items-center justify-center"
      onClick={toggleLang}
      aria-label={t("ui.toggleLanguage")}
      suppressHydrationWarning
    >
      <AnimatePresence mode="wait" initial={false}>
        {lang === "zh" ? (
          <motion.svg
            key="cn"
            initial={{ opacity: 0, rotateY: -90, scale: 0.8 }}
            animate={{ opacity: 1, rotateY: 0, scale: 1 }}
            exit={{ opacity: 0, rotateY: 90, scale: 0.8 }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            className="absolute"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m5 8 6 6" />
            <path d="m4 14 6-6 2-3" />
            <path d="M2 5h12" />
            <path d="M7 2h1" />
            <path d="m22 22-5-10-5 10" />
            <path d="M14 18h6" />
          </motion.svg>
        ) : (
          <motion.svg
            key="en"
            initial={{ opacity: 0, rotateY: -90, scale: 0.8 }}
            animate={{ opacity: 1, rotateY: 0, scale: 1 }}
            exit={{ opacity: 0, rotateY: 90, scale: 0.8 }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            className="absolute"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
            <path d="M2 12h20" />
          </motion.svg>
        )}
      </AnimatePresence>
    </button>
  );
}

export function Sidebar({ version }: { version: string }) {
  const { t } = useI18n();

  const [activeSection, setActiveSection] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [animClass, setAnimClass] = useState("");
  const [interactState, setInteractState] = useState("");
  const interactTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const anims = [
      "anim-pixelate",
      "anim-dropped-item",
      "anim-enchanted-leaf",
      "anim-shader-sway",
    ];
    setAnimClass(anims[Math.floor(Math.random() * anims.length)]);
  }, []);

  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>(
      ".hero, .section-v2[id], .footer-section[id]",
    );
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = entry.target.id || "";
            setActiveSection(id);
          }
        }
      },
      { rootMargin: "-20% 0px -60% 0px" },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  return (
    <aside className={`sidebar${menuOpen ? " menu-open" : ""}`}>
      <a
        href="/"
        className={`sidebar-logo ${animClass} ${interactState}`}
        onPointerDown={() => {
          if (animClass === "anim-shader-sway") {
            setInteractState("is-teleporting");
            clearTimeout(interactTimeoutRef.current);
            interactTimeoutRef.current = setTimeout(
              () => setInteractState(""),
              600,
            );
          } else if (animClass === "anim-enchanted-leaf") {
            setInteractState("is-picking-up");
            clearTimeout(interactTimeoutRef.current);
            interactTimeoutRef.current = setTimeout(
              () => setInteractState(""),
              1000,
            );
          }
        }}
      >
        <div className="luminol-logo-wrapper">
          <div className="luminol-icon-container">
            <div className="luminol-icon" />
            <div className="luminol-xp-orb" />
          </div>
          <div className="luminol-wordmark" />
        </div>
      </a>

      <button
        className="hamburger"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label={t("ui.toggleMenu")}
      >
        <span className="hamburger-line" />
        <span className="hamburger-line" />
      </button>

      <nav className="toc">
        <div className="toc-inner">
          <a
            href="/"
            className={`toc-link${activeSection === "hero" || activeSection === "" ? " active" : ""}`}
            onClick={() => setMenuOpen(false)}
          >
            {t("nav.overview")}
          </a>
          <a
            href="/features"
            className={`toc-link${activeSection === "features" ? " active" : ""}`}
            onClick={() => setMenuOpen(false)}
          >
            {t("nav.features")}
          </a>
          <a
            href="/projects"
            className={`toc-link${activeSection === "projects" ? " active" : ""}`}
            onClick={() => setMenuOpen(false)}
          >
            {t("nav.projects")}
          </a>
          <a
            href="/api"
            className={`toc-link${activeSection === "api" ? " active" : ""}`}
            onClick={() => setMenuOpen(false)}
          >
            {t("nav.api")}
          </a>
          <a
            href="/about"
            className={`toc-link${activeSection === "about" ? " active" : ""}`}
            onClick={() => setMenuOpen(false)}
          >
            {t("nav.about")}
          </a>
          <a
            href="/community"
            className={`toc-link${activeSection === "community" ? " active" : ""}`}
            onClick={() => setMenuOpen(false)}
          >
            {t("nav.community")}
          </a>
          <a
            href="https://github.com/LuminolMC/Luminol"
            className="toc-link"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMenuOpen(false)}
          >
            {t("nav.github")}
            <svg
              className="external-icon"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11 7H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-5"></path>
              <path d="M10 14L20 4"></path>
              <path d="M15 4h5v5"></path>
            </svg>
          </a>
          <a
            href="https://luminolmc.com"
            className="toc-link"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMenuOpen(false)}
          >
            {t("nav.luminolCraft")}
            <svg
              className="external-icon"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11 7H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-5"></path>
              <path d="M10 14L20 4"></path>
              <path d="M15 4h5v5"></path>
            </svg>
          </a>
          <div className="toc-toggles">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
      </nav>
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){
var d=window.__INITIAL_DARK__;
var sun=document.getElementById('theme-sun');
var moon=document.getElementById('theme-moon');
var btn=document.getElementById('theme-btn');
if(sun)sun.setAttribute('class','theme-icon theme-icon-sun'+(d?' active':''));
if(moon)moon.setAttribute('class','theme-icon theme-icon-moon'+(d?'':' active'));
if(btn)btn.setAttribute('aria-label',d?'Switch to light mode':'Switch to dark mode');
})()`,
        }}
      />
    </aside>
  );
}
