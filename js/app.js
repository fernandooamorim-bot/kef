window.WeddingFeedback = {
  dialog: null,

  init() {
    this.dialog = document.getElementById("siteFeedbackDialog");
    this.eyebrow = document.getElementById("siteFeedbackEyebrow");
    this.title = document.getElementById("siteFeedbackTitle");
    this.message = document.getElementById("siteFeedbackMessage");
    this.okButton = document.getElementById("siteFeedbackOk");

    this.okButton?.addEventListener("click", () => this.close());
    this.dialog?.addEventListener("click", (event) => {
      if (event.target === this.dialog) this.close();
    });
  },

  show({ eyebrow = "Aviso", title = "Tudo certo", message = "" } = {}) {
    if (!this.dialog) {
      window.alert(message || title);
      return;
    }

    this.eyebrow.textContent = eyebrow;
    this.title.textContent = title;
    this.message.textContent = message;
    window.WeddingModalLock?.lock();
    this.dialog.showModal();
    this.okButton?.focus();
  },

  close() {
    if (this.dialog?.open) this.dialog.close();
  }
};

window.WeddingProcessing = {
  dialog: null,

  init() {
    this.dialog = document.getElementById("siteProcessingDialog");
    this.title = document.getElementById("siteProcessingTitle");
    this.message = document.getElementById("siteProcessingMessage");
  },

  show({ title = "Processando", message = "Aguarde um instante." } = {}) {
    if (!this.dialog) return;
    this.title.textContent = title;
    this.message.textContent = message;
    window.WeddingModalLock?.lock();
    if (!this.dialog.open) this.dialog.showModal();
  },

  close() {
    if (this.dialog?.open) this.dialog.close();
  }
};

window.WeddingModalLock = {
  scrollY: 0,

  init() {
    document.querySelectorAll("dialog").forEach((dialog) => {
      dialog.addEventListener("close", () => window.setTimeout(() => this.sync(), 0));
    });
  },

  lock() {
    if (document.body.classList.contains("modal-lock")) return;
    this.scrollY = window.scrollY || document.documentElement.scrollTop || 0;
    document.body.style.top = `-${this.scrollY}px`;
    document.body.classList.add("modal-lock");
  },

  sync() {
    const hasOpenDialog = Array.from(document.querySelectorAll("dialog")).some((dialog) => dialog.open);
    if (!hasOpenDialog) this.unlock();
  },

  unlock() {
    if (!document.body.classList.contains("modal-lock")) return;
    document.body.classList.remove("modal-lock");
    document.body.style.top = "";
    window.scrollTo(0, this.scrollY);
  }
};

const app = {
  init() {
    document.body.classList.add("loading-lock");
    window.WeddingFeedback.init();
    window.WeddingProcessing.init();
    window.WeddingModalLock.init();
    this.initLoader();
    this.initHeroVideo();
    this.initNav();
    window.WeddingCountdown.start();
    window.WeddingGallery.init();
    this.initReveal();
    window.WeddingRsvp.init();
    window.WeddingGifts.init(this.withLocalGifts(window.WEDDING_CONFIG.fallbackData));
    window.WeddingApi.getPublicConfig().then((data) => {
      this.applyRemoteConfig(data);
      this.initReveal();
    });
  },

  withLocalGifts(data) {
    return {
      ...(data || {}),
      gifts: window.WEDDING_CONFIG.fallbackData.gifts
    };
  },

  applyRemoteConfig(data) {
    const remote = data?.config || {};
    const heroImage = remote.hero_image || window.WEDDING_CONFIG.heroImage;
    const heroVideo = remote.hero_video || window.WEDDING_CONFIG.heroVideo;
    const resolvedHero = this.resolveGalleryImage(heroImage);
    const hero = document.getElementById("heroImage");
    const heroVideoNode = document.getElementById("heroVideo");

    if (hero && resolvedHero) {
      hero.src = resolvedHero;
    }

    if (heroVideoNode && heroVideo) {
      heroVideoNode.dataset.src = heroVideo;
      const source = heroVideoNode.querySelector("source");
      if (source && source.getAttribute("src") !== heroVideo) {
        source.src = heroVideo;
        heroVideoNode.load();
      }
    }

    window.WeddingRsvp.applyConfig(remote);
    window.WeddingGifts.update(data);
  },

  resolveGalleryImage(value) {
    if (!value) return "";
    if (value.startsWith("assets/") || value.startsWith("http")) return value;
    return `assets/images/gallery/${value}.jpg`;
  },

  initLoader() {
    const loader = document.getElementById("siteLoader");
    const start = Date.now();
    const minDuration = 3000;
    const maxDuration = 5200;
    const hide = () => {
      if (!loader || loader.classList.contains("is-hidden")) return;
      const elapsed = Date.now() - start;
      window.setTimeout(() => {
        loader.classList.add("is-hidden");
        document.body.classList.remove("loading-lock");
        window.setTimeout(() => loader.remove(), 700);
      }, Math.max(0, minDuration - elapsed));
    };

    if (document.readyState === "complete") {
      hide();
    } else {
      window.addEventListener("load", hide, { once: true });
    }
    window.setTimeout(hide, maxDuration);
  },

  initHeroVideo() {
    const video = document.getElementById("heroVideo");
    const hero = document.getElementById("inicio");
    if (!video || !hero) return;

    let attempts = 0;
    const maxAttempts = 3;

    const revealVideo = () => {
      hero.classList.add("has-video");
    };

    const tryPlayback = async () => {
      if (video.dataset.failed === "true" || !video.paused) return;
      attempts += 1;
      try {
        video.muted = true;
        video.defaultMuted = true;
        video.playsInline = true;
        video.setAttribute("muted", "");
        video.setAttribute("playsinline", "");
        video.setAttribute("webkit-playsinline", "");
        video.setAttribute("autoplay", "");
        video.setAttribute("loop", "");
        await video.play();
      } catch (error) {
        if (attempts < maxAttempts) {
          window.setTimeout(tryPlayback, 850);
        } else {
          video.dataset.failed = "true";
        }
      }
    };

    video.addEventListener("playing", revealVideo);
    video.addEventListener("canplay", tryPlayback, { once: true });
    video.addEventListener("error", () => {
      video.dataset.failed = "true";
      hero.classList.remove("has-video");
    });
    try {
      video.load();
    } catch (error) {
      video.dataset.failed = "true";
    }
    window.setTimeout(tryPlayback, 120);
    window.setTimeout(tryPlayback, 1000);
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
