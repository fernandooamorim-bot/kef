window.WeddingGifts = {
  gifts: [],
  selectedGift: null,

  init(data) {
    this.gifts = this.normalizeGifts(data?.gifts || window.WEDDING_CONFIG.fallbackData.gifts || []);
    this.cacheElements();
    this.render();
    this.bindEvents();
  },

  cacheElements() {
    this.grid = document.getElementById("giftsGrid");
    this.dialog = document.getElementById("giftDialog");
    this.form = document.getElementById("giftForm");
    this.status = document.getElementById("giftStatus");
    this.closeButton = document.getElementById("closeGiftDialog");
    this.image = document.getElementById("giftDialogImage");
    this.title = document.getElementById("giftDialogTitle");
    this.description = document.getElementById("giftDialogDescription");
    this.amount = document.getElementById("giftDialogAmount");
  },

  normalizeGifts(gifts) {
    return gifts
      .filter((gift) => this.isEnabled(gift.enabled))
      .map((gift) => ({
        id: gift.gift_id || gift.id,
        title: gift.title || "",
        description: gift.description || "",
        image: gift.image || window.WEDDING_CONFIG.defaultGiftImage,
        imagePosition: gift.image_position || gift.imagePosition || "center center",
        amount: Number(gift.amount || 0),
        order: Number(gift.sort_order || 999)
      }))
      .filter((gift) => gift.id && gift.title && gift.amount > 0)
      .sort((a, b) => a.order - b.order);
  },

  isEnabled(value) {
    if (value === undefined || value === null || value === "") return true;
    return String(value).toLowerCase() !== "false";
  },

  render() {
    if (!this.grid) return;
    this.grid.innerHTML = "";

    if (!this.gifts.length) {
      this.grid.innerHTML = '<p class="gift-empty">Em breve, nossa lista de presentes estará disponível.</p>';
      return;
    }

    const fragment = document.createDocumentFragment();
    this.gifts.forEach((gift) => {
      const article = document.createElement("article");
      article.className = "gift-card reveal";
      article.style.setProperty("--gift-image-position", gift.imagePosition);
      article.innerHTML = `
        <img class="gift-card__image" src="${gift.image}" alt="" loading="lazy" decoding="async">
        <div class="gift-card__body">
          <span>Presente simbólico</span>
          <h3>${this.escape(gift.title)}</h3>
          <p>${this.escape(gift.description)}</p>
          <strong>${this.formatCurrency(gift.amount)}</strong>
          <button class="button button--primary" type="button" data-gift-id="${this.escape(gift.id)}">Presentear</button>
        </div>
      `;
      fragment.append(article);
    });
    this.grid.append(fragment);
  },

  bindEvents() {
    if (!this.grid || !this.dialog || !this.form) return;

    this.grid.addEventListener("click", (event) => {
      const button = event.target.closest("[data-gift-id]");
      if (!button) return;
      const gift = this.gifts.find((item) => item.id === button.dataset.giftId);
      if (gift) this.openGift(gift);
    });

    this.closeButton?.addEventListener("click", () => this.dialog.close());
    this.dialog.addEventListener("click", (event) => {
      if (event.target === this.dialog) this.dialog.close();
    });

    this.form.addEventListener("submit", async (event) => {
      event.preventDefault();
      await this.submitGift();
    });
  },

  openGift(gift) {
    this.selectedGift = gift;
    this.form.reset();
    this.status.textContent = "";
    this.form.elements.giftId.value = gift.id;
    this.image.src = gift.image;
    this.image.alt = gift.title;
    this.image.style.objectPosition = gift.imagePosition;
    this.title.textContent = gift.title;
    this.description.textContent = gift.description;
    this.amount.textContent = this.formatCurrency(gift.amount);
    this.dialog.showModal();
  },

  async submitGift() {
    const data = this.readForm();
    if (!data.name || !data.phone) {
      this.status.textContent = "Preencha pelo menos nome e telefone.";
      return;
    }

    this.status.textContent = "Registrando seu presente...";
    try {
      const result = await window.WeddingApi.submitGiftIntent(data);
      this.status.textContent = result.message || "Presente registrado. A etapa de pagamento será conectada em seguida.";
      window.setTimeout(() => this.dialog.close(), 1400);
    } catch (error) {
      this.status.textContent = error.message || "Não foi possível registrar agora. Tente novamente em instantes.";
    }
  },

  readForm() {
    const gift = this.selectedGift;
    return {
      giftId: gift.id,
      giftTitle: gift.title,
      amount: gift.amount,
      name: this.form.elements.name.value.trim(),
      phone: this.form.elements.phone.value.trim(),
      email: this.form.elements.email.value.trim(),
      message: this.form.elements.message.value.trim(),
      source: "site",
      userAgent: navigator.userAgent
    };
  },

  formatCurrency(value) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(value);
  },

  escape(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }
};
