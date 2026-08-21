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
        reject(new Error("timeout: " + src));
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
        reject(new Error("load failed: " + src));
      };
      document.head.appendChild(script);
    });
  }

  function getScroller() {
    return document.querySelector(".framer-bpy7lj");
  }

  function installAnchorNavigation() {
    function handleClick(event) {
      const anchor =
        event.target.closest && event.target.closest('a[href^="#"]');
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href === "#") return;
      const target = document.querySelector(href);
      if (!target) return;

      event.preventDefault();
      const reduce =
        window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      target.scrollIntoView({
        behavior: reduce ? "auto" : "smooth",
        block: "start",
      });
      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, "", href);
      }
    }

    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
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
      // Balanced feel: smoother than native, without Coursera-heavy lag.
      // 0.04 was too slow; 0.075 felt under-smoothed.
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

    const reduceMotion =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      return () => {
        cleanupFns.forEach((fn) => {
          fn();
        });
      };
    }

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
