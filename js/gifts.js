window.WeddingGifts = {
  gifts: [],
  selectedGift: null,

  init(data) {
    this.gifts = this.withFallbackComplements(data?.gifts || window.WEDDING_CONFIG.fallbackData.gifts || []);
    this.cacheElements();
    this.render();
    this.bindEvents();
  },

  update(data) {
    const nextGifts = this.withFallbackComplements(data?.gifts || []);
    if (!nextGifts.length) return;
    this.gifts = nextGifts;
    this.render();
  },

  withFallbackComplements(gifts) {
    const normalized = this.normalizeGifts(gifts);
    const fallback = this.normalizeGifts(window.WEDDING_CONFIG.fallbackData.gifts || []);
    const ids = new Set(normalized.map((gift) => gift.id));
    return normalized
      .concat(fallback.filter((gift) => !ids.has(gift.id)))
      .sort((a, b) => a.order - b.order);
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
    this.paymentHelp = document.getElementById("giftPaymentHelp");
    this.submitButton = this.form?.querySelector('button[type="submit"]');
    this.customFields = document.getElementById("giftCustomFields");
    this.pixDialog = document.getElementById("pixDialog");
    this.pixQrImage = document.getElementById("pixQrImage");
    this.pixCopyPaste = document.getElementById("pixCopyPaste");
    this.pixStatus = document.getElementById("pixStatus");
    this.copyPixButton = document.getElementById("copyPixButton");
    this.closePixButton = document.getElementById("closePixDialog");
  },

  normalizeGifts(gifts) {
    return gifts
      .filter((gift) => this.isEnabled(gift.enabled))
      .map((gift) => ({
        id: gift.gift_id || gift.id,
        title: gift.title || gift.gift_title || "",
        description: gift.description || "",
        image: gift.image || window.WEDDING_CONFIG.defaultGiftImage,
        imagePosition: gift.image_position || gift.posicao_imagem || gift.imagePosition || "center center",
        paymentUrl: gift.payment_url || gift.paymentUrl || "",
        amount: Number(gift.amount || 0),
        customAmount: gift.custom_amount === true || gift.customAmount === true || String(gift.custom_amount || gift.customAmount || "").toLowerCase() === "true",
        order: Number(gift.sort_order || 999)
      }))
      .filter((gift) => gift.id && gift.title && (gift.amount > 0 || gift.customAmount))
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
      article.className = "gift-card reveal is-visible";
      article.style.setProperty("--gift-image-position", gift.imagePosition);
      article.innerHTML = `
        <img class="gift-card__image" src="${gift.image}" alt="" loading="lazy" decoding="async">
        <div class="gift-card__body">
          <h3>${this.escape(gift.title)}</h3>
          <p>${this.escape(gift.description)}</p>
          <strong>${gift.customAmount ? "Valor livre" : this.formatCurrency(gift.amount)}</strong>
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
    this.dialog.addEventListener("close", () => {
      if (!this.pixDialog?.open) window.WeddingModalLock?.sync();
    });

    this.form.addEventListener("submit", async (event) => {
      event.preventDefault();
      await this.submitGift();
    });

    this.form.addEventListener("change", (event) => {
      if (event.target.name === "paymentMethod") this.updatePaymentHelp();
    });

    this.form.addEventListener("input", (event) => {
      event.target.removeAttribute("aria-invalid");
      if (this.status.textContent) this.status.textContent = "";
    });

    this.copyPixButton?.addEventListener("click", () => this.copyPixCode());
    this.pixQrImage?.addEventListener("load", () => {
      this.pixQrImage.hidden = false;
    });
    this.pixQrImage?.addEventListener("error", () => {
      this.pixQrImage.hidden = true;
      this.pixStatus.textContent = "Não foi possível carregar o QR Code agora. Use o Pix copia e cola abaixo.";
    });
    this.closePixButton?.addEventListener("click", () => this.pixDialog.close());
    this.pixDialog?.addEventListener("click", (event) => {
      if (event.target === this.pixDialog) this.pixDialog.close();
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
    this.amount.textContent = gift.customAmount ? "Valor livre" : this.formatCurrency(gift.amount);
    this.toggleCustomFields(gift.customAmount);
    const pixOption = this.form.querySelector('[name="paymentMethod"][value="pix"]');
    const cardOption = this.form.querySelector('[name="paymentMethod"][value="card"]');
    if (pixOption) pixOption.disabled = !this.hasPix();
    if (cardOption) cardOption.disabled = gift.customAmount;
    this.setPaymentMethod(gift.customAmount ? "pix" : this.hasPix() ? "pix" : "card");
    this.updatePaymentHelp();
    window.WeddingModalLock?.lock();
    this.dialog.showModal();
  },

  async submitGift() {
    const data = this.readForm();
    const validation = this.validateFormData(data);
    if (!validation.valid) {
      this.showValidationError(validation.message, validation.field);
      return;
    }

    if (data.paymentMethod === "pix" && !this.hasPix()) {
      this.status.textContent = "O Pix direto ainda não está configurado.";
      return;
    }

    if (data.paymentMethod === "card" && !data.paymentUrl) {
      this.status.textContent = "Este presente ainda não possui link de pagamento.";
      return;
    }

    this.setSubmitting(true);
    this.status.textContent = "Registrando sua mensagem...";
    window.WeddingProcessing?.show({
      title: "Registrando presente",
      message: "Estamos salvando sua mensagem antes do pagamento."
    });
    try {
      const result = await window.WeddingApi.submitGiftIntent(data);
      this.status.textContent = result.message || "Registro salvo. Redirecionando para o pagamento...";
      if (data.paymentMethod === "pix") {
        window.WeddingProcessing?.close();
        window.setTimeout(() => this.showPixDialog(data), 250);
      } else {
        const paymentUrl = result.paymentUrl || data.paymentUrl;
        window.WeddingProcessing?.show({
          title: "Abrindo pagamento",
          message: "Vamos encaminhar você para o pagamento com cartão."
        });
        window.setTimeout(() => {
          window.location.href = paymentUrl;
        }, 550);
      }
    } catch (error) {
      window.WeddingProcessing?.close();
      this.status.textContent = error.message || "Não foi possível registrar agora. Tente novamente em instantes.";
    } finally {
      this.setSubmitting(false);
    }
  },

  validateFormData(data) {
    if (data.customAmount && !data.customGiftTitle) {
      return {
        valid: false,
        field: "customGiftTitle",
        message: "Dê um nome para o presente misterioso."
      };
    }

    if (data.customAmount && data.amount <= 0) {
      return {
        valid: false,
        field: "customAmount",
        message: "Informe o valor do presente misterioso."
      };
    }

    if (!data.name) {
      return {
        valid: false,
        field: "name",
        message: "Informe seu nome para registrarmos o presente."
      };
    }

    if (!data.phone) {
      return {
        valid: false,
        field: "phone",
        message: "Informe seu telefone para registrarmos o presente."
      };
    }

    return { valid: true };
  },

  showValidationError(message, fieldName) {
    this.status.textContent = message;
    const field = fieldName ? this.form.elements[fieldName] : null;
    if (!field) return;
    field.setAttribute("aria-invalid", "true");
    field.focus({ preventScroll: true });
    field.scrollIntoView({ behavior: "smooth", block: "center" });
  },

  setPaymentMethod(method) {
    const field = this.form.querySelector(`[name="paymentMethod"][value="${method}"]`);
    if (field) field.checked = true;
  },

  readPaymentMethod() {
    return this.form.querySelector('[name="paymentMethod"]:checked')?.value || "card";
  },

  updatePaymentHelp() {
    if (!this.paymentHelp) return;
    const method = this.readPaymentMethod();
    if (method === "pix") {
      this.paymentHelp.textContent = this.hasPix()
        ? this.selectedGift?.customAmount
          ? "Para presente personalizado, sua mensagem será registrada e abriremos o Pix direto."
          : "Ao continuar, sua mensagem será registrada e abriremos o QR Code Pix para pagamento direto."
        : "Pix direto ainda precisa do código copia e cola para ficar disponível.";
      return;
    }
    this.paymentHelp.textContent = "Ao continuar, sua mensagem será registrada e abriremos o pagamento por cartão de crédito.";
  },

  hasPix() {
    return Boolean(this.getPixCode());
  },

  getPixCode() {
    return String(window.WEDDING_CONFIG.payment?.pix?.copyPaste || "").trim();
  },

  showPixDialog(data) {
    const pixCode = this.getPixCode();
    if (!pixCode || !this.pixDialog) return;

    this.dialog.close();
    window.WeddingModalLock?.lock();
    this.pixCopyPaste.value = pixCode;
    this.pixQrImage.hidden = false;
    this.pixQrImage.src = this.getPixQrImage() || `https://quickchart.io/qr?size=320&margin=2&text=${encodeURIComponent(pixCode)}`;
    this.pixQrImage.alt = `QR Code Pix para ${data.giftTitle}`;
    this.pixStatus.textContent = `Valor sugerido: ${this.formatCurrency(data.amount)}.`;
    this.pixDialog.showModal();
  },

  getPixQrImage() {
    return String(window.WEDDING_CONFIG.payment?.pix?.qrImage || "").trim();
  },

  setSubmitting(isSubmitting) {
    if (!this.submitButton) return;
    this.submitButton.classList.toggle("is-loading", isSubmitting);
    this.submitButton.disabled = isSubmitting;
    this.submitButton.textContent = isSubmitting ? "Registrando..." : "Registrar e pagar presente";
  },

  toggleCustomFields(show) {
    if (!this.customFields) return;
    this.customFields.hidden = !show;
    this.form.elements.customGiftTitle.required = show;
    this.form.elements.customAmount.required = show;
  },

  async copyPixCode() {
    const pixCode = this.pixCopyPaste?.value || this.getPixCode();
    if (!pixCode) return;

    try {
      await navigator.clipboard.writeText(pixCode);
      this.pixStatus.textContent = "Código Pix copiado.";
    } catch (error) {
      this.pixCopyPaste.focus();
      this.pixCopyPaste.select();
      this.pixStatus.textContent = "Selecione e copie o código Pix.";
    }
  },

  readForm() {
    const gift = this.selectedGift;
    const paymentMethod = gift.customAmount ? "pix" : this.readPaymentMethod();
    const customGiftTitle = this.form.elements.customGiftTitle.value.trim();
    const customAmount = this.parseCurrency(this.form.elements.customAmount.value);
    return {
      giftId: gift.id,
      giftTitle: gift.customAmount ? customGiftTitle || gift.title : gift.title,
      amount: gift.customAmount ? customAmount : gift.amount,
      customAmount: gift.customAmount,
      paymentMethod,
      paymentUrl: gift.paymentUrl,
      name: this.form.elements.name.value.trim(),
      phone: this.form.elements.phone.value.trim(),
      email: this.form.elements.email.value.trim(),
      message: this.form.elements.message.value.trim(),
      source: "site",
      userAgent: navigator.userAgent
    };
  },

  parseCurrency(value) {
    const raw = String(value || "")
      .replace(/[^\d,.-]/g, "")
      .trim();
    const hasComma = raw.includes(",");
    const hasDot = raw.includes(".");
    const normalized = hasComma
      ? raw.replace(/\./g, "").replace(",", ".")
      : hasDot
        ? raw
        : raw.replace(/[^\d]/g, "");
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
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
