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
    const params = new URLSearchParams(window.location.search);
    const forceIntro = params.get(window.WEDDING_CONFIG.introReplayParam) === "1";
    const skipIntro = params.get(window.WEDDING_CONFIG.introReplayParam) === "0";
    const alwaysShowIntro = window.WEDDING_CONFIG.introMode === "always";
    let started = false;
    let settled = false;
    let attempts = 0;
    let hideTimer;
    let fallbackTimer;
    let retryTimer;

    const maxAttempts = 3;

    const hide = () => {
      settled = true;
      intro?.classList.add("is-hidden");
      document.body.classList.remove("intro-lock");
      if (!alwaysShowIntro) {
        window.WeddingCache.write(key, true, 60 * 24 * 14);
      }
      if (video) video.pause();
      if (hideTimer) window.clearTimeout(hideTimer);
      if (fallbackTimer) window.clearTimeout(fallbackTimer);
      if (retryTimer) window.clearTimeout(retryTimer);
    };

    if (forceIntro) {
      window.WeddingCache.remove(key);
    }

    if (!intro || skipIntro || (!alwaysShowIntro && !forceIntro && window.WeddingCache.read(key))) {
      hide();
      return;
    }

    const markFallback = () => {
      if (started) return;
      if (status) status.textContent = "Toque em entrar para continuar";
      skip?.classList.add("is-ready");
    };

    const commitVideo = () => {
      if (!intro || started) return;
      started = true;
      intro.classList.add("has-video");
      if (status) status.textContent = "Krisna & Fernando";
      if (fallbackTimer) window.clearTimeout(fallbackTimer);
      hideTimer = window.setTimeout(hide, 10500);
    };

    const tryPlayback = async () => {
      if (!video || started || settled) return;
      attempts += 1;
      try {
        await video.play();
        if (video.readyState >= 2) commitVideo();
      } catch (error) {
        if (attempts < maxAttempts) {
          retryTimer = window.setTimeout(tryPlayback, 700);
        } else {
          markFallback();
        }
      }
    };

    video?.addEventListener("loadeddata", tryPlayback, { once: true });
    video?.addEventListener("canplay", tryPlayback, { once: true });
    video?.addEventListener("playing", commitVideo, { once: true });
    video?.addEventListener("error", markFallback, { once: true });

    try {
      video.muted = true;
      video.defaultMuted = true;
      video.playsInline = true;
      video.setAttribute("muted", "");
      video.setAttribute("playsinline", "");
      video.setAttribute("webkit-playsinline", "");
      video.setAttribute("autoplay", "");
      video.preload = "auto";
      video.load();
    } catch (error) {
      markFallback();
    }

    window.setTimeout(tryPlayback, 120);
    window.setTimeout(tryPlayback, 900);
    fallbackTimer = window.setTimeout(markFallback, 5500);

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
