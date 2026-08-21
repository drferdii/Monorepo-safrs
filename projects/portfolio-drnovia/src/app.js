/* NOVIA STUDIO — React 18 runtime shell.
 * The preserved Framer page uses its own 100vh internal scroll container.
 * Lenis owns that nested scroller (.framer-bpy7lj), never window.
 */
(() => {
  const React = window.React;
  const ReactDOM = window.ReactDOM;

  function loadScript(src, id, timeoutMs) {
    return new Promise((resolve, reject) => {
      if (id && document.getElementById(id)) return resolve();
      const script = document.createElement("script");
      if (id) script.id = id;
      script.src = src;
      script.async = true;
      let settled = false;
      const timer = window.setTimeout(() => {
        if (settled) return;
        settled = true;
        reject(new Error(`timeout: ${src}`));
      }, timeoutMs || 3000);
      script.onload = () => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timer);
        resolve();
      };
      script.onerror = () => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timer);
        reject(new Error(`load failed: ${src}`));
      };
      document.head.appendChild(script);
    });
  }

  function getScroller() {
    return document.querySelector(".framer-bpy7lj");
  }

  function installAnchorNavigation() {
    function handleClick(event) {
      const anchor = event.target.closest?.('a[href^="#"]');
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href === "#") return;
      const target = document.querySelector(href);
      if (!target) return;

      event.preventDefault();
      const reduce = window.matchMedia?.(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      target.scrollIntoView({
        behavior: reduce ? "auto" : "smooth",
        block: "start",
      });
      if (window.history?.replaceState) {
        window.history.replaceState(null, "", href);
      }
    }

    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
    };
  }

  function installInteractiveCards() {
    const container = document.getElementById("1np9dlm");
    if (!container) return () => {};

    const cards = [
      {
        id: 0,
        name: "Mantra",
        wrapper: document.querySelector(".framer-uxc0rs"),
        inner: document.querySelector(".framer-1upsiy3"),
      },
      {
        id: 1,
        name: "MedLink",
        wrapper: document.querySelector(".framer-kp9014"),
        inner: document.querySelector(".framer-1eyqovy"),
      },
      {
        id: 2,
        name: "SideLab",
        wrapper: document.querySelector(".framer-1wvt0y2"),
        inner: document.querySelector(".framer-12n68jw"),
      },
    ];

    const validCards = cards.filter((c) => c.wrapper && c.inner);
    if (validCards.length < 3) return () => {};

    let activeIndex = 0;

    function renderStack(targetIndex) {
      activeIndex = (targetIndex + validCards.length) % validCards.length;

      validCards.forEach((c, i) => {
        const relPos =
          (i - activeIndex + validCards.length) % validCards.length;
        const w = c.wrapper;
        const inner = c.inner;

        if (relPos === 0) {
          // ACTIVE FRONT CARD
          w.style.zIndex = "10";
          w.style.bottom = "0px";
          w.style.left = "0px";
          w.style.right = "0px";
          w.style.width = "100%";
          w.style.transform = "translateY(0px) scale(1)";
          w.style.filter = "none";
          w.style.opacity = "1";
          w.style.pointerEvents = "auto";
          w.setAttribute("aria-selected", "true");
          w.classList.add("novia-card-active");
          w.classList.remove("novia-card-back-1", "novia-card-back-2");

          inner.style.opacity = "1";
          inner.style.pointerEvents = "auto";
        } else if (relPos === 1) {
          // MIDDLE CARD (BEHIND 1)
          w.style.zIndex = "5";
          w.style.bottom = "12px";
          w.style.left = "8px";
          w.style.right = "8px";
          w.style.width = "calc(100% - 16px)";
          w.style.transform = "translateY(0px) scale(0.97)";
          w.style.filter = "brightness(0.92)";
          w.style.opacity = "1";
          w.style.pointerEvents = "auto";
          w.setAttribute("aria-selected", "false");
          w.classList.add("novia-card-back-1");
          w.classList.remove("novia-card-active", "novia-card-back-2");

          inner.style.opacity = "0";
          inner.style.pointerEvents = "none";
        } else {
          // BACK CARD (BEHIND 2)
          w.style.zIndex = "2";
          w.style.bottom = "24px";
          w.style.left = "16px";
          w.style.right = "15px";
          w.style.width = "calc(100% - 31px)";
          w.style.transform = "translateY(0px) scale(0.94)";
          w.style.filter = "brightness(0.85)";
          w.style.opacity = "1";
          w.style.pointerEvents = "auto";
          w.setAttribute("aria-selected", "false");
          w.classList.add("novia-card-back-2");
          w.classList.remove("novia-card-active", "novia-card-back-1");

          inner.style.opacity = "0";
          inner.style.pointerEvents = "none";
        }
      });
    }

    renderStack(0);

    const listeners = [];

    validCards.forEach((c, index) => {
      const clickHandler = (e) => {
        // If clicking "Lihat Proyek" link/row, scroll to #project
        if (
          e.target.closest?.('[data-framer-name="Row 2"]') ||
          e.target.closest?.(".framer-1nhr0z3") ||
          e.target.closest?.(".framer-1ejefme") ||
          e.target.closest?.(".framer-1kv3t0f")
        ) {
          e.preventDefault();
          e.stopPropagation();
          const proj = document.querySelector("#project");
          if (proj) {
            proj.scrollIntoView({ behavior: "smooth", block: "start" });
          }
          return;
        }

        e.preventDefault();
        e.stopPropagation();
        if (activeIndex === index) {
          // Click on active card cycles to next card
          renderStack(activeIndex + 1);
        } else {
          // Click on background card tab switches directly to it
          renderStack(index);
        }
      };

      const keyHandler = (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          renderStack(activeIndex + 1);
        }
      };

      c.wrapper.addEventListener("click", clickHandler);
      c.wrapper.addEventListener("keydown", keyHandler);
      listeners.push({ element: c.wrapper, clickHandler, keyHandler });
    });

    return () => {
      listeners.forEach(({ element, clickHandler, keyHandler }) => {
        element.removeEventListener("click", clickHandler);
        element.removeEventListener("keydown", keyHandler);
      });
    };
  }

  function installCtaButtons() {
    const ctas = document.querySelectorAll(
      '.framer-IEAQE, .framer-1rmmc8, [data-framer-name*="Desktop: Bottom"]',
    );
    const handler = (e) => {
      const href = e.currentTarget.getAttribute("href");
      if (!href || href === "#" || href.startsWith("#")) {
        e.preventDefault();
        const footer = document.querySelector("#footer");
        if (footer) {
          const reduce = window.matchMedia?.(
            "(prefers-reduced-motion: reduce)",
          ).matches;
          footer.scrollIntoView({
            behavior: reduce ? "auto" : "smooth",
            block: "start",
          });
        }
      }
    };

    ctas.forEach((cta) => {
      cta.addEventListener("click", handler);
    });

    return () => {
      ctas.forEach((cta) => {
        cta.removeEventListener("click", handler);
      });
    };
  }

  function installEyeFollower() {
    const eyeSvg = document.querySelector(".framer-1xhn0ls-container svg");
    if (!eyeSvg) return () => {};
    const pupils = eyeSvg.querySelectorAll("circle");
    if (pupils.length < 4) return () => {};
    const leftPupil = pupils[2];
    const rightPupil = pupils[3];
    const baseLeft = { cx: 12.28, cy: 13.82 };
    const baseRight = { cx: 48.4, cy: 14.12 };

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let rafId = null;

    function handleMouseMove(e) {
      const rect = eyeSvg.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = (e.clientX - centerX) / (window.innerWidth / 2);
      const dy = (e.clientY - centerY) / (window.innerHeight / 2);
      targetX = Math.max(-1, Math.min(1, dx)) * 4.5;
      targetY = Math.max(-1, Math.min(1, dy)) * 3.5;
    }

    function animate() {
      currentX += (targetX - currentX) * 0.12;
      currentY += (targetY - currentY) * 0.12;

      leftPupil.setAttribute("cx", String(baseLeft.cx + currentX));
      leftPupil.setAttribute("cy", String(baseLeft.cy + currentY));
      rightPupil.setAttribute("cx", String(baseRight.cx + currentX));
      rightPupil.setAttribute("cy", String(baseRight.cy + currentY));

      rafId = requestAnimationFrame(animate);
    }

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    rafId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }

  function initLenis() {
    const LenisCtor = window.Lenis;
    const wrapper = getScroller();
    if (typeof LenisCtor !== "function" || !wrapper) return null;
    const content = wrapper.firstElementChild;
    if (!content) return null;

    const lenis = new LenisCtor({
      wrapper: wrapper,
      content: content,
      eventsTarget: wrapper,
      autoRaf: true,
      anchors: { offset: 24, duration: 1.1 },
      naiveDimensions: true,
      stopInertiaOnNavigate: true,
      lerp: 0.06,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.05,
      syncTouch: false,
      respectReducedMotion: true,
      overscroll: true,
      smoothWheel: true,
    });

    document.documentElement.classList.add("novia-lenis-ready");

    return () => {
      if (lenis && typeof lenis.destroy === "function") lenis.destroy();
      document.documentElement.classList.remove("novia-lenis-ready");
    };
  }

  function initMotion() {
    const cleanupFns = [];
    const lenisCleanup = initLenis();
    if (lenisCleanup) {
      cleanupFns.push(lenisCleanup);
    } else {
      cleanupFns.push(installAnchorNavigation());
    }

    // Install interactive stacked card switcher & tactile handlers
    cleanupFns.push(installInteractiveCards());
    cleanupFns.push(installCtaButtons());

    const reduceMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion) {
      return () => {
        cleanupFns.forEach((fn) => {
          fn();
        });
      };
    }

    const eyeCleanup = installEyeFollower();
    if (eyeCleanup) cleanupFns.push(eyeCleanup);

    let disposed = false;
    let gsapContext = null;

    /* GSAP is visual-only. It does not register ScrollTrigger, wheel handlers,
       RAF-based smooth scrolling, or preventDefault on pointer/wheel events. */
    loadScript(
      "https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js",
      "novia-gsap",
      2500,
    )
      .then(() => {
        if (disposed || !window.gsap) return;
        try {
          const gsap = window.gsap;
          const scroller = getScroller();
          let observer = null;

          gsapContext = gsap.context(() => {
            document.documentElement.classList.add("novia-motion-ready");
            const cards = Array.from(
              document.querySelectorAll('[data-framer-name="Project"]'),
            );

            if ("IntersectionObserver" in window && cards.length) {
              observer = new IntersectionObserver(
                (entries, io) => {
                  entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    gsap.fromTo(
                      entry.target,
                      { y: 14, opacity: 0.97 },
                      {
                        y: 0,
                        opacity: 1,
                        duration: 0.6,
                        ease: "power2.out",
                        clearProps: "transform,opacity",
                      },
                    );
                    io.unobserve(entry.target);
                  });
                },
                {
                  root: scroller || null,
                  rootMargin: "0px 0px -5% 0px",
                  threshold: 0.06,
                },
              );
              cards.forEach((card) => {
                observer.observe(card);
              });
              cleanupFns.push(() => {
                if (observer) observer.disconnect();
              });
            }
          }, document.getElementById("main"));
        } catch (err) {
          console.warn(
            "NOVIA STUDIO: visual motion enhancement unavailable.",
            err,
          );
        }
      })
      .catch(() => {
        /* Offline/CDN failure is intentionally silent: the site remains fully functional. */
      });

    return () => {
      disposed = true;
      cleanupFns.forEach((fn) => {
        fn();
      });
      if (gsapContext && typeof gsapContext.revert === "function")
        gsapContext.revert();
      document.documentElement.classList.remove("novia-motion-ready");
    };
  }

  function App() {
    React.useEffect(() => {
      document.documentElement.lang = "id";
      document.title =
        "Novia Studio — Arsitektur Kecerdasan Buatan & Desain Digital";
      return initMotion();
    }, []);

    return React.createElement("div", {
      id: "main",
      dangerouslySetInnerHTML: { __html: window.NOVIA_PORTFOLIO_MARKUP || "" },
    });
  }

  const rootNode = document.getElementById("root");
  if (!rootNode || !React || !ReactDOM) {
    throw new Error("NOVIA STUDIO: React runtime could not start.");
  }
  ReactDOM.createRoot(rootNode).render(React.createElement(App));
})();
