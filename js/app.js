const app = {
  init() {
    document.body.classList.add("intro-lock");
    this.initIntro();
    this.initNav();
    this.initReveal();
    window.WeddingCountdown.start();
    window.WeddingGallery.init();
    window.WeddingRsvp.init();
    window.WeddingApi.getPublicConfig().then((data) => this.applyRemoteConfig(data));
  },

  applyRemoteConfig(data) {
    const remote = data?.config || {};
    const heroImage = remote.hero_image || window.WEDDING_CONFIG.heroImage;
    const introVideo = remote.intro_video || window.WEDDING_CONFIG.introVideo;
    const resolvedHero = this.resolveGalleryImage(heroImage);
    const hero = document.getElementById("heroImage");
    const introVideoNode = document.getElementById("introVideo");

    if (hero && resolvedHero) {
      hero.src = resolvedHero;
    }

    if (introVideoNode && introVideo) {
      introVideoNode.dataset.src = introVideo;
    }
  },

  resolveGalleryImage(value) {
    if (!value) return "";
    if (value.startsWith("assets/") || value.startsWith("http")) return value;
    return `assets/images/gallery/${value}.jpg`;
  },

  initIntro() {
    const intro = document.getElementById("intro");
    const video = document.getElementById("introVideo");
    const skip = document.getElementById("skipIntro");
    const status = document.getElementById("introStatus");
    const key = window.WEDDING_CONFIG.cache.introSeenKey;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const params = new URLSearchParams(window.location.search);
    const forceIntro = params.get(window.WEDDING_CONFIG.introReplayParam) === "1";
    let started = false;
    let hideTimer;

    const hide = () => {
      intro?.classList.add("is-hidden");
      document.body.classList.remove("intro-lock");
      window.WeddingCache.write(key, true, 60 * 24 * 14);
      if (video) video.pause();
      if (hideTimer) window.clearTimeout(hideTimer);
    };

    if (forceIntro) {
      window.WeddingCache.remove(key);
    }

    if (!intro || reduceMotion || (!forceIntro && window.WeddingCache.read(key))) {
      hide();
      return;
    }

    const markFallback = () => {
      if (started) return;
      if (status) status.textContent = "Toque em entrar para continuar";
      skip?.classList.add("is-ready");
    };

    const startPlayback = async () => {
      if (!video || started) return;
      try {
        await video.play();
        started = true;
        intro.classList.add("has-video");
        if (status) status.textContent = "Krisna & Fernando";
        hideTimer = window.setTimeout(hide, 10500);
      } catch (error) {
        markFallback();
      }
    };

    video?.addEventListener("loadeddata", startPlayback, { once: true });
    video?.addEventListener("canplay", startPlayback, { once: true });
    video?.addEventListener("error", markFallback, { once: true });
    video?.load();
    window.setTimeout(startPlayback, 600);
    window.setTimeout(markFallback, 5200);

    skip?.addEventListener("click", hide);
    video?.addEventListener("ended", hide);
    window.setTimeout(hide, 15000);
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
