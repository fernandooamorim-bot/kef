window.WeddingRsvp = {
  selectedGuest: null,
  searchTimer: null,
  searchToken: 0,
  availability: { open: true, message: "" },

  init() {
    this.form = document.getElementById("rsvpForm");
    this.status = document.getElementById("formStatus");
    if (!this.form || !this.status) return;

    this.closedPanel = document.getElementById("rsvpClosedPanel");
    this.closedTitle = document.getElementById("rsvpClosedTitle");
    this.closedMessage = document.getElementById("rsvpClosedMessage");
    this.search = this.form.elements.guestSearch;
    this.guestId = this.form.elements.guestId;
    this.suggestions = document.getElementById("guestSuggestions");
    this.selectedBox = document.getElementById("guestSelected");
    this.selectedName = this.selectedBox?.querySelector("strong");
    this.changeGuestButton = document.getElementById("changeGuestButton");
    this.details = document.getElementById("rsvpDetails");
    this.companionChoice = document.getElementById("companionChoice");
    this.companionNameField = document.getElementById("companionNameField");
    this.phone = this.form.elements.phone;
    this.email = this.form.elements.email;
    this.submitButton = this.form.querySelector('button[type="submit"]');

    this.restoreDraft();
    this.bindEvents();
    this.applyConfig(window.WEDDING_CONFIG.rsvp || {});
    this.updateSubmitState();
  },

  applyConfig(config = {}) {
    const fallback = window.WEDDING_CONFIG.rsvp || {};
    const settings = {
      enabled: this.parseBoolean(config.rsvp_enabled ?? config.enabled ?? fallback.enabled, true),
      opensAt: config.rsvp_open_at || config.rsvp_abre_em || config.opensAt || fallback.opensAt || "",
      closesAt: config.rsvp_close_at || config.rsvp_fecha_em || config.closesAt || fallback.closesAt || "",
      closedMessage: config.rsvp_closed_message || config.mensagem_rsvp_fechado || config.closedMessage || fallback.closedMessage || ""
    };
    const state = this.getAvailability(settings);
    this.availability = state;
    this.renderAvailability(state);
  },

  getAvailability(settings) {
    const now = new Date();
    const opensAt = this.parseDate(settings.opensAt);
    const closesAt = this.parseDate(settings.closesAt);
    const openLabel = this.formatLongDate(opensAt);

    if (!settings.enabled) {
      return {
        open: false,
        title: "Confirmações temporariamente indisponíveis.",
        message: settings.closedMessage || "As confirmações de presença serão liberadas em breve."
      };
    }

    if (opensAt && now < opensAt) {
      return {
        open: false,
        title: "Confirmações em breve.",
        message: settings.closedMessage || `As confirmações de presença estarão disponíveis a partir de ${openLabel}.`
      };
    }

    if (closesAt && now > closesAt) {
      return {
        open: false,
        title: "Confirmações encerradas.",
        message: "O prazo para confirmação de presença foi encerrado."
      };
    }

    return { open: true, title: "", message: "" };
  },

  renderAvailability(state) {
    const controls = Array.from(this.form.querySelectorAll("input, button"));
    this.form.classList.toggle("is-rsvp-closed", !state.open);
    if (this.closedPanel) this.closedPanel.hidden = state.open;
    if (this.closedTitle) this.closedTitle.textContent = state.title || "As confirmações ainda não estão disponíveis.";
    if (this.closedMessage) this.closedMessage.textContent = state.message || "";

    controls.forEach((control) => {
      if (control.closest("#rsvpClosedPanel")) return;
      control.disabled = !state.open || (control.type === "submit" && control.disabled);
    });

    if (!state.open) {
      this.hideSuggestions();
      this.setSearching(false);
      this.updateStatus(state.message);
    } else {
      this.updateSubmitState();
    }
  },

  bindEvents() {
    this.search.addEventListener("input", () => {
      this.clearSelectedGuest();
      this.persistDraft();
      this.queueSearch(this.search.value);
    });

    this.search.addEventListener("focus", () => {
      if (this.suggestions.children.length) this.showSuggestions();
    });

    this.changeGuestButton?.addEventListener("click", () => {
      this.clearSelectedGuest();
      this.search.focus();
      this.updateStatus("Digite novamente e selecione seu nome na lista.");
    });

    this.form.addEventListener("change", (event) => {
      if (event.target.name === "attendance") this.updateCompanionVisibility();
      if (event.target.name === "bringCompanion") this.updateCompanionNameVisibility();
      this.persistDraft();
      this.updateSubmitState();
    });

    this.form.addEventListener("input", (event) => {
      if (event.target === this.phone) {
        this.phone.value = this.formatPhone(this.phone.value);
      }
      if (event.target !== this.search) this.persistDraft();
      this.updateSubmitState();
    });

    this.form.addEventListener("submit", (event) => this.submit(event));

    document.addEventListener("click", (event) => {
      if (!this.form.contains(event.target)) this.hideSuggestions();
    });
  },

  restoreDraft() {
    const draft = window.WeddingCache.read(window.WEDDING_CONFIG.cache.rsvpDraftKey);
    if (!draft) return;

    ["guestSearch", "guestId", "phone", "email", "companionName"].forEach((key) => {
      if (this.form.elements[key] && draft[key]) this.form.elements[key].value = draft[key];
    });

    ["attendance", "bringCompanion"].forEach((key) => {
      if (!draft[key]) return;
      const field = this.form.querySelector(`[name="${key}"][value="${draft[key]}"]`);
      if (field) field.checked = true;
    });

    if (draft.selectedGuest) this.selectGuest(draft.selectedGuest, { silent: true });
    this.updateCompanionVisibility();
    this.updateCompanionNameVisibility();
  },

  persistDraft() {
    window.WeddingCache.write(window.WEDDING_CONFIG.cache.rsvpDraftKey, this.readForm(), 60 * 24 * 7);
  },

  queueSearch(value) {
    if (!this.availability.open) {
      this.renderSuggestions([]);
      this.updateStatus(this.availability.message || "As confirmações ainda não estão disponíveis.");
      return;
    }

    window.clearTimeout(this.searchTimer);
    const query = value.trim();

    if (query.length < 2) {
      this.renderSuggestions([]);
      this.updateStatus("Digite pelo menos duas letras para buscar seu nome.");
      return;
    }

    this.searchTimer = window.setTimeout(() => this.searchGuests(query), 280);
  },

  async searchGuests(query) {
    const token = ++this.searchToken;
    this.setSearching(true);
    this.updateStatus("Buscando seu nome na lista...");

    try {
      const guests = await window.WeddingApi.searchGuests(query);
      if (token !== this.searchToken) return;
      this.renderSuggestions(guests);
      this.updateStatus(guests.length ? "Selecione seu nome para continuar." : "Não encontramos esse nome na lista. Confira a escrita ou fale com os noivos.");
    } catch (error) {
      if (token !== this.searchToken) return;
      this.renderSuggestions([]);
      this.updateStatus(error.message || "Não foi possível buscar agora. Tente novamente em instantes.");
    } finally {
      if (token === this.searchToken) this.setSearching(false);
    }
  },

  renderSuggestions(guests) {
    this.suggestions.innerHTML = "";
    if (!guests.length) {
      this.hideSuggestions();
      return;
    }

    guests.forEach((guest) => {
      const option = document.createElement("button");
      option.type = "button";
      option.className = "rsvp-suggestion";
      option.setAttribute("role", "option");
      option.innerHTML = `
        <strong>${this.escapeHtml(guest.name)}</strong>
        <span>${this.escapeHtml(this.describeGuest(guest))}</span>
      `;
      option.addEventListener("click", () => this.selectGuest(guest));
      this.suggestions.appendChild(option);
    });

    this.showSuggestions();
  },

  selectGuest(guest, options = {}) {
    this.selectedGuest = {
      guest_id: guest.guest_id,
      name: guest.name,
      group: guest.group || "",
      allowed_companions: Number(guest.allowed_companions || 0),
      status: guest.status || ""
    };
    this.search.value = guest.name;
    this.guestId.value = guest.guest_id;
    this.selectedName.textContent = guest.name;
    this.selectedBox.hidden = false;
    this.details.hidden = false;
    this.hideSuggestions();
    this.updateCompanionVisibility();
    this.updateSubmitState();
    this.persistDraft();
    if (!options.silent) this.updateStatus("Nome selecionado. Agora escolha sua confirmação.");
  },

  clearSelectedGuest() {
    this.selectedGuest = null;
    this.guestId.value = "";
    this.selectedBox.hidden = true;
    this.details.hidden = true;
    this.companionChoice.hidden = true;
    this.companionNameField.hidden = true;
    this.form.querySelectorAll('[name="attendance"], [name="bringCompanion"]').forEach((field) => { field.checked = false; });
    this.form.elements.companionName.value = "";
    this.submitButton.disabled = true;
  },

  updateCompanionVisibility() {
    const attendance = this.form.elements.attendance.value;
    const canBringCompanion = this.selectedGuest?.allowed_companions > 0 && attendance === "confirmed";
    this.companionChoice.hidden = !canBringCompanion;

    if (!canBringCompanion) {
      this.form.querySelectorAll('[name="bringCompanion"]').forEach((field) => { field.checked = false; });
      this.form.elements.companionName.value = "";
    }

    this.updateCompanionNameVisibility();
  },

  updateCompanionNameVisibility() {
    const bringCompanion = this.form.elements.bringCompanion.value === "yes";
    const show = !this.companionChoice.hidden && bringCompanion;
    this.companionNameField.hidden = !show;
    if (!show) this.form.elements.companionName.value = "";
  },

  updateSubmitState() {
    if (!this.availability.open) {
      this.submitButton.disabled = true;
      return;
    }

    const data = this.readForm();
    const needsCompanionChoice = this.selectedGuest?.allowed_companions > 0 && data.attendance === "confirmed";
    const needsCompanionName = needsCompanionChoice && data.bringCompanion === "yes";
    const valid = Boolean(
      data.guestId &&
      data.attendance &&
      data.phoneDigits.length >= 10 &&
      this.isValidEmail(data.email) &&
      (!needsCompanionChoice || data.bringCompanion) &&
      (!needsCompanionName || data.companionName)
    );
    this.submitButton.disabled = !valid;
  },

  async submit(event) {
    event.preventDefault();
    if (!this.availability.open) {
      this.updateStatus(this.availability.message || "As confirmações ainda não estão disponíveis.");
      window.WeddingFeedback?.show({
        eyebrow: "Confirmação",
        title: this.availability.title || "Confirmações em breve",
        message: this.availability.message || "As confirmações de presença serão liberadas em breve."
      });
      return;
    }

    const data = this.readForm();

    if (!data.guestId || !this.selectedGuest) {
      this.updateStatus("Selecione seu nome na lista antes de enviar.");
      this.search.focus();
      return;
    }

    if (!data.attendance) {
      this.updateStatus("Escolha se você confirma presença.");
      return;
    }

    if (data.phoneDigits.length < 10) {
      this.updateStatus("Informe um WhatsApp válido.");
      this.phone.focus();
      return;
    }

    if (!this.isValidEmail(data.email)) {
      this.updateStatus("Informe um email válido.");
      this.email.focus();
      return;
    }

    this.setSubmitting(true);
    this.updateStatus("Enviando sua confirmação...");
    window.WeddingProcessing?.show({
      title: "Enviando confirmação",
      message: "Estamos registrando sua resposta."
    });

    try {
      const result = await window.WeddingApi.submitRsvp(data);
      this.updateStatus(result.message || "Confirmação registrada. Obrigado!");
      window.WeddingCache.remove(window.WEDDING_CONFIG.cache.rsvpDraftKey);
      this.resetForm();
      window.WeddingProcessing?.close();
      window.WeddingFeedback?.show({
        eyebrow: "Confirmação",
        title: data.attendance === "confirmed" ? "Presença confirmada" : "Resposta registrada",
        message: result.message || "Recebemos sua resposta. Obrigado por avisar."
      });
    } catch (error) {
      this.updateStatus(error.message || "Não foi possível enviar agora. Tente novamente em instantes.");
      window.WeddingProcessing?.close();
      window.WeddingFeedback?.show({
        eyebrow: "Ops",
        title: "Não foi possível enviar",
        message: error.message || "Tente novamente em instantes."
      });
    } finally {
      window.WeddingProcessing?.close();
      this.setSubmitting(false);
    }
  },

  readForm() {
    const attendance = this.form.elements.attendance.value;
    const bringCompanion = this.form.elements.bringCompanion.value;

    return {
      guestId: this.guestId.value.trim(),
      guestName: this.search.value.trim(),
      selectedGuest: this.selectedGuest,
      attendance,
      bringCompanion,
      companionsConfirmed: attendance === "confirmed" && bringCompanion === "yes" ? 1 : 0,
      companionName: this.form.elements.companionName.value.trim(),
      phone: this.form.elements.phone.value.trim(),
      phoneDigits: this.onlyDigits(this.form.elements.phone.value),
      email: this.form.elements.email.value.trim(),
      source: "site",
      userAgent: navigator.userAgent
    };
  },

  resetForm() {
    this.form.reset();
    this.selectedGuest = null;
    this.guestId.value = "";
    this.selectedBox.hidden = true;
    this.details.hidden = true;
    this.companionChoice.hidden = true;
    this.companionNameField.hidden = true;
    this.renderSuggestions([]);
    this.updateSubmitState();
  },

  setSearching(isLoading) {
    this.search.closest(".rsvp-search").classList.toggle("is-loading", isLoading);
    this.search.setAttribute("aria-busy", String(isLoading));
  },

  setSubmitting(isSubmitting) {
    this.submitButton.classList.toggle("is-loading", isSubmitting);
    this.submitButton.textContent = isSubmitting ? "Enviando..." : "Enviar confirmação";
    if (isSubmitting) {
      this.submitButton.disabled = true;
    } else {
      this.updateSubmitState();
    }
  },

  parseBoolean(value, fallback = false) {
    if (value === undefined || value === null || value === "") return fallback;
    const normalized = String(value).trim().toLowerCase();
    return !["false", "não", "nao", "no", "0", "off", "disabled"].includes(normalized);
  },

  parseDate(value) {
    if (!value) return null;
    if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
    const raw = String(value).trim();
    const normalized = raw.includes("T") ? raw : raw.replace(" ", "T");
    const date = new Date(normalized);
    return Number.isNaN(date.getTime()) ? null : date;
  },

  formatLongDate(date) {
    if (!date) return "em breve";
    return new Intl.DateTimeFormat("pt-BR", {
      day: "numeric",
      month: "long",
      year: "numeric"
    }).format(date);
  },

  showSuggestions() {
    this.suggestions.hidden = false;
    this.search.setAttribute("aria-expanded", "true");
  },

  hideSuggestions() {
    this.suggestions.hidden = true;
    this.search.setAttribute("aria-expanded", "false");
  },

  updateStatus(message) {
    this.status.textContent = message;
  },

  describeGuest(guest) {
    const companions = Number(guest.allowed_companions || 0);
    const group = guest.group ? `${guest.group} · ` : "";
    return `${group}${companions > 0 ? "com acompanhante" : "sem acompanhante"}`;
  },

  formatPhone(value) {
    const digits = this.onlyDigits(value).slice(0, 11);
    if (digits.length <= 2) return digits ? `(${digits}` : "";

    const area = digits.slice(0, 2);
    const number = digits.slice(2);
    const firstPartLength = digits.length > 10 ? 5 : 4;
    const firstPart = number.slice(0, firstPartLength);
    const secondPart = number.slice(firstPartLength, firstPartLength + 4);

    return `(${area}) ${firstPart}${secondPart ? `-${secondPart}` : ""}`;
  },

  onlyDigits(value) {
    return String(value || "").replace(/\D/g, "");
  },

  isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
  },

  escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[char]));
  }
};
