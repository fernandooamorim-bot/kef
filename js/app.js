const app = {
  init() {
    document.body.classList.add("intro-lock");
    this.initIntro();
    this.initNav();
    this.initReveal();
    window.WeddingCountdown.start();
    window.WeddingGallery.init();
    window.WeddingRsvp.init();
    window.WeddingApi.getPublicConfig();
  },

  initIntro() {
    const intro = document.getElementById("intro");
    const video = document.getElementById("introVideo");
    const skip = document.getElementById("skipIntro");
    const key = window.WEDDING_CONFIG.cache.introSeenKey;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const hide = () => {
      intro?.classList.add("is-hidden");
      document.body.classList.remove("intro-lock");
      window.WeddingCache.write(key, true, 60 * 24 * 14);
      if (video) video.pause();
    };

    if (!intro || reduceMotion || window.WeddingCache.read(key)) {
      hide();
      return;
    }

    video?.play().catch(() => {});
    skip?.addEventListener("click", hide);
    video?.addEventListener("ended", hide);
    window.setTimeout(hide, 9000);
  },

  initNav() {
    const toggle = document.getElementById("navToggle");
    const nav = document.getElementById("siteNav");
    if (!toggle || !nav) return;

    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });

    nav.addEventListener("click", (event) => {
      if (event.target.matches("a")) {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  },

  initReveal() {
    const revealItems = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      revealItems.forEach((item) => item.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });

    revealItems.forEach((item) => observer.observe(item));
  }
};

document.addEventListener("DOMContentLoaded", () => app.init());
